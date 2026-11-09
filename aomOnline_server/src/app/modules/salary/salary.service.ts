import { FilterQuery, Types } from 'mongoose';
import { Salary } from './salary.model';
import {
  ISalary,
  TSalaryMethod,
  deriveSalaryStatus,
} from './salary.interface';
import { Teacher } from '../teacher/teacher.model';
import { ITeacher } from '../teacher/teacher.interface';
import { User } from '../user/user.model';
import { computeTeacherPayout } from '../teacher/teacher.utils';
import { createNotification } from '../notification/notification.service';

// The subset of req.user the service needs to resolve the actor.
export interface IActor {
  userId: string;
  role: string;
  email?: string;
}

const httpError = (message: string, status: number) =>
  Object.assign(new Error(message), { status });

const isAdmin = (role: string) => role === 'admin' || role === 'superAdmin';

// Resolve the effective month/year, defaulting to the current server date.
// Uses UTC to match analytics (payment.service uses local time — near a month
// boundary the two can disagree on "this month").
const resolvePeriod = (
  month?: number,
  year?: number,
): { month: number; year: number } => {
  const now = new Date();
  return {
    month: month ?? now.getUTCMonth() + 1,
    year: year ?? now.getUTCFullYear(),
  };
};

interface IPopulatedUser {
  _id?: Types.ObjectId;
  name?: string;
  email?: string;
  phone?: string;
  photo?: string;
}

interface ITeacherLean extends Omit<ITeacher, 'userRef'> {
  _id: Types.ObjectId;
  userRef?: IPopulatedUser | null;
}

// Recompute paidAmount/status from the entries and persist. Every mutation
// funnels through here so the two stored totals can't drift from the ledger.
const syncTotals = async (salary: ISalary & { save: () => Promise<unknown> }) => {
  salary.paidAmount = salary.entries.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  salary.status = deriveSalaryStatus(salary.paidAmount, salary.salaryAmount);
  await salary.save();
  return salary;
};

// Load a teacher or 404.
const loadTeacher = async (teacherId: string): Promise<ITeacherLean> => {
  if (!Types.ObjectId.isValid(teacherId)) {
    throw httpError('Invalid teacher id', 400);
  }
  const teacher = await Teacher.findById(teacherId)
    .populate('userRef', 'name email phone photo')
    .lean<ITeacherLean | null>();
  if (!teacher) throw httpError('Teacher not found', 404);
  return teacher;
};

// Find the salary record for a period, creating it from the current student
// assignments if it doesn't exist yet. Records are created lazily — viewing the
// overview must not write, or simply opening the page would freeze every
// teacher's figure for that month.
const ensureSalaryRecord = async (
  teacher: ITeacherLean,
  month: number,
  year: number,
) => {
  const existing = await Salary.findOne({
    teacherRef: teacher._id,
    month,
    year,
  });
  if (existing) return existing;

  const { salary, studentCount } = await computeTeacherPayout(
    teacher._id,
    teacher.ratePerStudent ?? 0,
  );

  return Salary.create({
    teacherRef: teacher._id,
    month,
    year,
    salaryAmount: salary,
    paidAmount: 0,
    status: deriveSalaryStatus(0, salary),
    entries: [],
    isAmountOverridden: false,
    studentCount,
  });
};

interface IOverviewQuery {
  month?: string | number;
  year?: string | number;
  search?: string;
  status?: string;
  page?: string | number;
  limit?: string | number;
}

// GET /api/salaries/overview — admin: every teacher's salary for one period,
// with summary stats. Read-only: teachers without a record yet show their
// computed expected salary and a zero paid amount.
const getOverview = async (query: IOverviewQuery) => {
  const { month, year } = resolvePeriod(
    query.month !== undefined ? Number(query.month) : undefined,
    query.year !== undefined ? Number(query.year) : undefined,
  );

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const search = (query.search ?? '').trim();

  // Match on teacherId directly, or on the teacher's name/email which live on
  // the linked User doc.
  const filter: FilterQuery<ITeacher> = {};
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const matchedUsers = await User.find({
      $or: [{ name: rx }, { email: rx }],
    })
      .select('_id')
      .lean<{ _id: Types.ObjectId }[]>();
    filter.$or = [
      { teacherId: rx },
      { userRef: { $in: matchedUsers.map((u) => u._id) } },
    ];
  }

  const teachers = await Teacher.find(filter)
    .populate('userRef', 'name email phone photo')
    .sort({ teacherId: 1 })
    .lean<ITeacherLean[]>();

  const records = await Salary.find({
    teacherRef: { $in: teachers.map((t) => t._id) },
    month,
    year,
  }).lean();

  const byTeacher = new Map(records.map((r) => [String(r.teacherRef), r]));

  const rows = await Promise.all(
    teachers.map(async (t) => {
      const record = byTeacher.get(String(t._id));

      // No record yet → project from the current assignments.
      let salaryAmount: number;
      let studentCount: number;
      if (record) {
        salaryAmount = record.salaryAmount;
        studentCount = record.studentCount;
      } else {
        const computed = await computeTeacherPayout(
          t._id,
          t.ratePerStudent ?? 0,
        );
        salaryAmount = computed.salary;
        studentCount = computed.studentCount;
      }

      const paidAmount = record?.paidAmount ?? 0;
      const entries = record?.entries ?? [];
      const lastEntry = entries[entries.length - 1];

      return {
        _id: record?._id ?? null,
        teacherRef: t._id,
        teacherId: t.teacherId,
        name: t.userRef?.name ?? '',
        email: t.userRef?.email ?? '',
        photo: t.userRef?.photo || t.photo || '',
        designation: t.designation ?? '',
        subject: t.subject ?? '',
        isActive: t.isActive,
        studentCount,
        salaryAmount,
        paidAmount,
        dueAmount: Math.max(0, salaryAmount - paidAmount),
        status: record?.status ?? deriveSalaryStatus(0, salaryAmount),
        isAmountOverridden: record?.isAmountOverridden ?? false,
        entriesCount: entries.length,
        lastPaidAt: lastEntry?.paidAt ?? null,
      };
    }),
  );

  // Summary covers every matched teacher, not just the current page — the
  // stat cards describe the month, not the pagination window.
  const summary = rows.reduce(
    (acc, r) => {
      acc.totalSalary += r.salaryAmount;
      acc.totalPaid += r.paidAmount;
      acc.totalDue += r.dueAmount;
      if (r.status === 'paid') acc.paidTeachers += 1;
      else if (r.status === 'partial') acc.partialTeachers += 1;
      else acc.unpaidTeachers += 1;
      return acc;
    },
    {
      totalTeachers: rows.length,
      paidTeachers: 0,
      partialTeachers: 0,
      unpaidTeachers: 0,
      totalSalary: 0,
      totalPaid: 0,
      totalDue: 0,
      progressPercent: 0,
    },
  );
  summary.progressPercent =
    summary.totalSalary > 0
      ? Math.round((summary.totalPaid / summary.totalSalary) * 100)
      : 0;

  const statusFilter = (query.status ?? '').trim();
  const filtered = statusFilter
    ? rows.filter((r) => r.status === statusFilter)
    : rows;

  const total = filtered.length;
  const start = (page - 1) * limit;

  return {
    data: filtered.slice(start, start + limit),
    summary: { ...summary, month, year },
    meta: {
      page,
      limit,
      total,
      totalPage: Math.max(1, Math.ceil(total / limit)),
      month,
      year,
    },
  };
};

interface IPayInput {
  teacherId: string;
  amount: number | string;
  paidAt?: string;
  method: TSalaryMethod;
  purpose?: string;
  transactionId?: string;
  accountNumber?: string;
  screenshotUrl?: string;
  note?: string;
  month?: number | string;
  year?: number | string;
}

// POST /api/salaries/pay — admin: record one disbursement.
// The money already moved outside the system; this is the ledger entry.
// Sent as multipart, so numeric fields arrive as strings — coerce them here.
const paySalary = async (actor: IActor, input: IPayInput) => {
  const month = input.month !== undefined ? Number(input.month) : undefined;
  const year = input.year !== undefined ? Number(input.year) : undefined;
  const { month: m, year: y } = resolvePeriod(month, year);
  const teacher = await loadTeacher(input.teacherId);

  const amount = Number(input.amount);
  if (!(amount > 0)) {
    throw httpError('Payment amount must be greater than zero', 400);
  }

  const salary = await ensureSalaryRecord(teacher, m, y);

  salary.entries.push({
    amount,
    paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
    method: input.method,
    purpose: input.purpose,
    transactionId: input.transactionId,
    accountNumber: input.accountNumber,
    screenshotUrl: input.screenshotUrl,
    note: input.note,
    recordedBy: new Types.ObjectId(actor.userId),
  });

  await syncTotals(salary as never);

  // Let the teacher know money was recorded against their name.
  if (teacher.userRef?._id) {
    await createNotification({
      userRef: teacher.userRef._id,
      title: 'বেতন পরিশোধ হয়েছে',
      message: `${m}/${y} মাসের বেতন বাবদ ${amount} টাকা পরিশোধ করা হয়েছে।`,
      type: 'general',
      meta: { salaryId: String(salary._id) },
    });
  }

  return { salary };
};

interface IBulkPayInput {
  teacherIds?: string[];
  method: TSalaryMethod;
  paidAt?: string;
  note?: string;
  month?: number;
  year?: number;
}

// POST /api/salaries/bulk-pay — admin: settle the full outstanding due for
// many teachers at once. Teachers with nothing due are skipped, not errored.
const bulkPay = async (actor: IActor, input: IBulkPayInput) => {
  const { month, year } = resolvePeriod(input.month, input.year);

  const filter: FilterQuery<ITeacher> = {};
  if (input.teacherIds?.length) {
    const ids = input.teacherIds.filter((id) => Types.ObjectId.isValid(id));
    if (!ids.length) throw httpError('No valid teacher ids provided', 400);
    filter._id = { $in: ids.map((id) => new Types.ObjectId(id)) };
  }

  const teachers = await Teacher.find(filter)
    .populate('userRef', 'name email phone photo')
    .lean<ITeacherLean[]>();

  const paidAt = input.paidAt ? new Date(input.paidAt) : new Date();
  let paidCount = 0;
  let totalPaid = 0;
  const skipped: string[] = [];

  for (const teacher of teachers) {
    const salary = await ensureSalaryRecord(teacher, month, year);
    const due = salary.salaryAmount - salary.paidAmount;

    if (due <= 0) {
      skipped.push(teacher.teacherId);
      continue;
    }

    salary.entries.push({
      amount: due,
      paidAt,
      method: input.method,
      note: input.note ?? 'Bulk salary payment',
      recordedBy: new Types.ObjectId(actor.userId),
    });
    await syncTotals(salary as never);

    paidCount += 1;
    totalPaid += due;

    if (teacher.userRef?._id) {
      await createNotification({
        userRef: teacher.userRef._id,
        title: 'বেতন পরিশোধ হয়েছে',
        message: `${month}/${year} মাসের বেতন বাবদ ${due} টাকা পরিশোধ করা হয়েছে।`,
        type: 'general',
        meta: { salaryId: String(salary._id) },
      });
    }
  }

  return { month, year, paidCount, totalPaid, skippedCount: skipped.length };
};

interface IAmountInput {
  teacherId: string;
  salaryAmount: number;
  month?: number;
  year?: number;
  note?: string;
}

// PATCH /api/salaries/amount — admin: override the expected salary for a month
// (a bonus, a deduction, an agreed flat figure). Marks the record so later
// student changes don't silently overwrite the deliberate number.
const updateSalaryAmount = async (actor: IActor, input: IAmountInput) => {
  const { month, year } = resolvePeriod(input.month, input.year);
  const teacher = await loadTeacher(input.teacherId);

  if (input.salaryAmount < 0) {
    throw httpError('Salary amount cannot be negative', 400);
  }

  const salary = await ensureSalaryRecord(teacher, month, year);
  salary.salaryAmount = input.salaryAmount;
  salary.isAmountOverridden = true;
  if (input.note !== undefined) salary.note = input.note;
  await syncTotals(salary as never);

  return { salary };
};

// DELETE /api/salaries/:salaryId/entry/:entryId — admin: undo one instalment
// (mistyped amount, wrong teacher). The record itself survives so the month
// keeps its salaryAmount snapshot.
const deleteEntry = async (
  actor: IActor,
  salaryId: string,
  entryId: string,
) => {
  if (!Types.ObjectId.isValid(salaryId) || !Types.ObjectId.isValid(entryId)) {
    throw httpError('Invalid id', 400);
  }

  const salary = await Salary.findById(salaryId);
  if (!salary) throw httpError('Salary record not found', 404);

  const before = salary.entries.length;
  salary.entries = salary.entries.filter(
    (e) => String(e._id) !== String(entryId),
  );
  if (salary.entries.length === before) {
    throw httpError('Payment entry not found', 404);
  }

  await syncTotals(salary as never);
  return { salary };
};

// Resolve which teacher the actor may read. Admins may name any teacher;
// a teacher resolves to their own profile and may not name another.
const resolveTeacherScope = async (
  actor: IActor,
  teacherId?: string,
): Promise<ITeacherLean> => {
  if (isAdmin(actor.role)) {
    if (!teacherId) throw httpError('teacherId is required', 400);
    return loadTeacher(teacherId);
  }

  const own = await Teacher.findOne({ userRef: actor.userId })
    .populate('userRef', 'name email phone photo')
    .lean<ITeacherLean | null>();
  if (!own) throw httpError('Teacher profile not found', 404);

  if (teacherId && String(own._id) !== String(teacherId)) {
    throw httpError('You can only view your own salary', 403);
  }
  return own;
};

// GET /api/salaries/history/:teacherId (admin) and /my-salary (teacher).
// Teachers see their own salary only — never a student's fee, and never
// another teacher's figures.
const getHistory = async (
  actor: IActor,
  teacherId?: string,
  limit = 24,
) => {
  const teacher = await resolveTeacherScope(actor, teacherId);

  const records = await Salary.find({ teacherRef: teacher._id })
    .sort({ year: -1, month: -1 })
    .limit(Math.min(60, Math.max(1, limit)))
    .lean();

  const totals = records.reduce(
    (acc, r) => {
      acc.totalSalary += r.salaryAmount;
      acc.totalPaid += r.paidAmount;
      acc.totalDue += Math.max(0, r.salaryAmount - r.paidAmount);
      return acc;
    },
    { totalSalary: 0, totalPaid: 0, totalDue: 0 },
  );

  // Recurring monthly figure from the current student assignments — the same
  // "Next Month Salary" the admin sees, shown to the teacher on their page.
  const { salary: projectedSalary, studentCount } = await computeTeacherPayout(
    teacher._id,
    teacher.ratePerStudent ?? 0,
  );

  return {
    teacher: {
      _id: teacher._id,
      teacherId: teacher.teacherId,
      name: teacher.userRef?.name ?? '',
      email: teacher.userRef?.email ?? '',
      photo: teacher.userRef?.photo || teacher.photo || '',
      designation: teacher.designation ?? '',
      subject: teacher.subject ?? '',
      projectedSalary,
      studentCount,
    },
    records,
    totals,
  };
};

export const SalaryService = {
  getOverview,
  paySalary,
  bulkPay,
  updateSalaryAmount,
  deleteEntry,
  getHistory,
};
