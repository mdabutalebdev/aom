import { Types } from 'mongoose';
import { Teacher } from '../teacher/teacher.model';
import { Student } from '../student/student.model';
import { Class } from '../class/class.model';
import { Admission } from '../admission/admission.model';
import { Contact } from '../contact/contact.model';
import { Payment } from '../payment/payment.model';
import { Salary } from '../salary/salary.model';
import { Attendance } from '../attendance/attendance.model';
import { Progress } from '../progress/progress.model';
import { ITeacher } from '../teacher/teacher.interface';
import { TAttendanceStatus } from '../attendance/attendance.interface';
import { monthRangeUTC } from '../attendance/attendance.utils';
import { sumAllTeacherPayout, sumTeacherPayout } from '../teacher/teacher.utils';

const httpError = (message: string, status: number) =>
  Object.assign(new Error(message), { status });

// Resolve the effective month (1-12) / year, defaulting to the current UTC date.
// Mirrors attendance.utils.resolveMonthYear + payment.service.resolvePeriod.
const resolvePeriod = (
  month?: number,
  year?: number,
): { month: number; year: number } => {
  const now = new Date();
  return {
    month: month ?? now.getUTCMonth() + 1, // getUTCMonth() is 0-based
    year: year ?? now.getUTCFullYear(),
  };
};

// ─── Reusable aggregation blocks ───────────────────────────────────

// Payment stats for a month/year across ALL students.
// totalCollected = Σ monthlyFee of paid students; totalDue = Σ monthlyFee of
// unpaid students. A student with no Payment record counts as unpaid/due.
// Mirrors payment.service.computeTeacherStats but madrasa-wide.
const computePaymentStats = async (month: number, year: number) => {
  const students = await Student.find({})
    .select('monthlyFee')
    .lean<{ _id: Types.ObjectId; monthlyFee?: number }[]>();

  const payments = await Payment.find({ month, year })
    .select('studentRef status')
    .lean();

  const paidStudentIds = new Set(
    payments
      .filter((p) => p.status === 'paid')
      .map((p) => String(p.studentRef)),
  );

  let paidCount = 0;
  let unpaidCount = 0;
  let totalCollected = 0;
  let totalDue = 0;

  for (const s of students) {
    const fee = s.monthlyFee ?? 0;
    if (paidStudentIds.has(String(s._id))) {
      paidCount += 1;
      totalCollected += fee;
    } else {
      unpaidCount += 1;
      totalDue += fee;
    }
  }

  return { month, year, paidCount, unpaidCount, totalCollected, totalDue };
};

// Sum of next-month salaries across ALL teachers.
//
// This used to compute `ratePerStudent × studentCount`, which ignored each
// student's own teacherPayoutAmount — so this endpoint and /payments/overview
// reported different totals for the same data whenever a student had a custom
// payout. Both now share sumAllTeacherPayout.
const computeTotalSalaryNextMonth = sumAllTeacherPayout;

// Attendance tally for a month/year across ALL students.
// Mirrors attendance.service.summarize + monthRangeUTC.
const computeAttendanceStats = async (month: number, year: number) => {
  const { start, end } = monthRangeUTC(month, year);

  const records = await Attendance.find({
    date: { $gte: start, $lt: end },
  })
    .select('status')
    .lean();

  const summary = {
    present: 0,
    absent: 0,
    leave: 0,
    holiday: 0,
    total: 0,
  };
  for (const r of records) {
    summary[r.status as TAttendanceStatus] += 1;
    summary.total += 1;
  }

  return { month, year, ...summary };
};

// Progress aggregate across ALL students with a progress doc.
// avgPercentage rounded; completedLevels = # of students at 100%.
const computeProgressStats = async () => {
  const docs = await Progress.find({})
    .select('percentage')
    .lean<{ percentage?: number }[]>();

  if (docs.length === 0) {
    return { avgPercentage: 0, completedLevels: 0 };
  }

  const sum = docs.reduce((acc, d) => acc + (d.percentage ?? 0), 0);
  const completedLevels = docs.filter((d) => (d.percentage ?? 0) >= 100).length;

  return {
    avgPercentage: Math.round(sum / docs.length),
    completedLevels,
  };
};

// The `count` (month, year) periods ending at the given period, oldest → newest.
const buildPeriods = (month: number, year: number, count: number) => {
  const periods: { month: number; year: number }[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    // Zero-based month index math to roll years cleanly.
    const idx = month - 1 - i;
    const d = new Date(Date.UTC(year, idx, 1));
    periods.push({ month: d.getUTCMonth() + 1, year: d.getUTCFullYear() });
  }
  return periods;
};

// Money in, grouped by (year, month) — sums what was actually collected.
const collectionByPeriod = async () => {
  const grouped = await Payment.aggregate<{
    _id: { month: number; year: number };
    collected: number;
  }>([
    { $match: { status: 'paid' } },
    {
      $group: {
        _id: { month: '$month', year: '$year' },
        collected: { $sum: '$amount' },
      },
    },
  ]);

  return new Map(
    grouped.map((g) => [`${g._id.year}-${g._id.month}`, g.collected]),
  );
};

// Money out, grouped by (year, month).
//
// Expenses are what was actually DISBURSED (Salary.paidAmount), not what is
// owed — an unpaid salary hasn't left the madrasa's hands yet, so counting it
// would understate profit for any month that isn't settled. The outstanding
// commitment is reported separately as salaryDue.
const expenseByPeriod = async () => {
  const grouped = await Salary.aggregate<{
    _id: { month: number; year: number };
    paid: number;
    owed: number;
  }>([
    {
      $group: {
        _id: { month: '$month', year: '$year' },
        paid: { $sum: '$paidAmount' },
        owed: { $sum: '$salaryAmount' },
      },
    },
  ]);

  return new Map(
    grouped.map((g) => [
      `${g._id.year}-${g._id.month}`,
      { paid: g.paid, owed: g.owed },
    ]),
  );
};

// Last 6 months of totalCollected (paid payments), oldest → newest, anchored
// to the given month/year.
const computeCollectionTrend = async (month: number, year: number) => {
  const periods = buildPeriods(month, year, 6);
  const collectedByKey = await collectionByPeriod();

  return periods.map((p) => ({
    month: p.month,
    year: p.year,
    collected: collectedByKey.get(`${p.year}-${p.month}`) ?? 0,
  }));
};

// Last 6 months of collection vs expenses vs net profit, oldest → newest.
const computeProfitTrend = async (month: number, year: number) => {
  const periods = buildPeriods(month, year, 6);
  const [collectedByKey, expenseByKey] = await Promise.all([
    collectionByPeriod(),
    expenseByPeriod(),
  ]);

  return periods.map((p) => {
    const key = `${p.year}-${p.month}`;
    const collection = collectedByKey.get(key) ?? 0;
    const expenses = expenseByKey.get(key)?.paid ?? 0;
    return {
      month: p.month,
      year: p.year,
      collection,
      expenses,
      profit: collection - expenses,
    };
  });
};

// Profit for one month: what came in from guardians minus what went out as
// teacher salary. Collection is summed from Payment.amount (the same source
// as the trend) rather than the students' current monthlyFee, so the card and
// the chart's last point always agree.
const computeProfit = async (month: number, year: number) => {
  const [collectedByKey, expenseByKey] = await Promise.all([
    collectionByPeriod(),
    expenseByPeriod(),
  ]);

  const key = `${year}-${month}`;
  const totalCollection = collectedByKey.get(key) ?? 0;
  const expense = expenseByKey.get(key);
  const totalExpenses = expense?.paid ?? 0;

  return {
    month,
    year,
    totalCollection,
    totalExpenses,
    netProfit: totalCollection - totalExpenses,
    // Salary committed for the month but not yet disbursed.
    salaryDue: Math.max(0, (expense?.owed ?? 0) - totalExpenses),
  };
};

// ─── GET /api/analytics/overview?month=&year= ──────────────────────
const getOverview = async (monthArg?: number, yearArg?: number) => {
  const { month, year } = resolvePeriod(monthArg, yearArg);

  const [
    teachers,
    students,
    singleStudents,
    groupStudents,
    classes,
    pendingAdmissions,
    payments,
    totalSalaryNextMonth,
    attendance,
    progress,
    recentAdmissionDocs,
    recentContactDocs,
    collectionTrend,
    profit,
    profitTrend,
  ] = await Promise.all([
    Teacher.countDocuments({}),
    Student.countDocuments({}),
    // Single (one-to-one) students have no group; group students carry a groupRef.
    Student.countDocuments({ groupRef: null }),
    Student.countDocuments({ groupRef: { $ne: null } }),
    Class.countDocuments({}),
    Admission.countDocuments({ status: 'pending' }),
    computePaymentStats(month, year),
    computeTotalSalaryNextMonth(),
    computeAttendanceStats(month, year),
    computeProgressStats(),
    Admission.find({})
      .select('studentName desiredClass status createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Contact.find({})
      .select('name subject status createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    computeCollectionTrend(month, year),
    computeProfit(month, year),
    computeProfitTrend(month, year),
  ]);

  const recentAdmissions = recentAdmissionDocs.map((a) => ({
    _id: a._id,
    studentName: a.studentName,
    desiredClass: a.desiredClass,
    status: a.status,
    createdAt: a.createdAt,
  }));

  const recentContacts = recentContactDocs.map((c) => ({
    _id: c._id,
    name: c.name,
    subject: c.subject,
    status: c.status,
    createdAt: c.createdAt,
  }));

  return {
    data: {
      counts: {
        teachers,
        students,
        singleStudents,
        groupStudents,
        classes,
        pendingAdmissions,
      },
      payments: {
        month: payments.month,
        year: payments.year,
        totalCollected: payments.totalCollected,
        totalDue: payments.totalDue,
        paidCount: payments.paidCount,
        unpaidCount: payments.unpaidCount,
        totalSalaryNextMonth,
      },
      profit,
      attendance,
      progress,
      recentAdmissions,
      recentContacts,
      collectionTrend,
      profitTrend,
    },
  };
};

// ─── Report helpers (per-row builders) ─────────────────────────────

// Shape of a teacher doc populated with its userRef name.
interface IPopulatedUser {
  name?: string;
}
interface ITeacherLean extends Omit<ITeacher, 'userRef'> {
  _id: Types.ObjectId;
  userRef?: IPopulatedUser | null;
}

// salary report — per teacher: studentCount, ratePerStudent, salary.
const buildSalaryReport = async () => {
  const teachers = await Teacher.find({})
    .populate('userRef', 'name')
    .sort({ teacherId: 1 })
    .lean<ITeacherLean[]>();

  const rows = await Promise.all(
    teachers.map(async (t) => {
      const studentCount = await Student.countDocuments({ teacherRef: t._id });
      const ratePerStudent = t.ratePerStudent ?? 0;
      return {
        teacherId: t._id,
        name: t.userRef?.name ?? '',
        studentCount,
        ratePerStudent,
        // Per-student payout, not rate × count — a student with a custom
        // teacherPayoutAmount would otherwise be reported at the wrong figure.
        salary: await sumTeacherPayout(t._id, ratePerStudent),
      };
    }),
  );

  const totals = rows.reduce(
    (acc, r) => {
      acc.totalSalary += r.salary;
      acc.totalStudents += r.studentCount;
      return acc;
    },
    { totalSalary: 0, totalStudents: 0 },
  );

  return { rows, totals };
};

// payment report — per teacher: paid/unpaid counts + collected/due for a month.
const buildPaymentReport = async (month: number, year: number) => {
  const teachers = await Teacher.find({})
    .populate('userRef', 'name')
    .sort({ teacherId: 1 })
    .lean<ITeacherLean[]>();

  const rows = await Promise.all(
    teachers.map(async (t) => {
      const students = await Student.find({ teacherRef: t._id })
        .select('monthlyFee')
        .lean<{ _id: Types.ObjectId; monthlyFee?: number }[]>();

      const payments = await Payment.find({
        studentRef: { $in: students.map((s) => s._id) },
        month,
        year,
      })
        .select('studentRef status')
        .lean();

      const paidStudentIds = new Set(
        payments
          .filter((p) => p.status === 'paid')
          .map((p) => String(p.studentRef)),
      );

      let paidCount = 0;
      let unpaidCount = 0;
      let collected = 0;
      let due = 0;

      for (const s of students) {
        const fee = s.monthlyFee ?? 0;
        if (paidStudentIds.has(String(s._id))) {
          paidCount += 1;
          collected += fee;
        } else {
          unpaidCount += 1;
          due += fee;
        }
      }

      return {
        teacherId: t._id,
        name: t.userRef?.name ?? '',
        paidCount,
        unpaidCount,
        collected,
        due,
      };
    }),
  );

  const totals = rows.reduce(
    (acc, r) => {
      acc.totalCollected += r.collected;
      acc.totalDue += r.due;
      acc.paidCount += r.paidCount;
      acc.unpaidCount += r.unpaidCount;
      return acc;
    },
    { totalCollected: 0, totalDue: 0, paidCount: 0, unpaidCount: 0 },
  );

  return { rows, totals };
};

// A lean Student doc populated with its class name.
interface IStudentReportLean {
  _id: Types.ObjectId;
  name: string;
  classRef?: { name?: string } | null;
}

// attendance report — per student: monthly present/absent/leave/holiday tally.
const buildAttendanceReport = async (month: number, year: number) => {
  const { start, end } = monthRangeUTC(month, year);

  const students = await Student.find({})
    .select('name classRef')
    .populate('classRef', 'name')
    .sort({ studentId: 1 })
    .lean<IStudentReportLean[]>();

  const records = await Attendance.find({
    date: { $gte: start, $lt: end },
  })
    .select('studentRef status')
    .lean();

  const statusesByStudent = new Map<string, TAttendanceStatus[]>();
  for (const r of records) {
    const key = String(r.studentRef);
    const list = statusesByStudent.get(key) ?? [];
    list.push(r.status);
    statusesByStudent.set(key, list);
  }

  const totals = { present: 0, absent: 0, leave: 0, holiday: 0 };

  const rows = students.map((s) => {
    const summary = {
      present: 0,
      absent: 0,
      leave: 0,
      holiday: 0,
      total: 0,
    };
    for (const status of statusesByStudent.get(String(s._id)) ?? []) {
      summary[status] += 1;
      summary.total += 1;
    }
    totals.present += summary.present;
    totals.absent += summary.absent;
    totals.leave += summary.leave;
    totals.holiday += summary.holiday;

    return {
      studentId: s._id,
      name: s.name,
      className: s.classRef?.name ?? '',
      ...summary,
    };
  });

  return { rows, totals };
};

// progress report — per student: current percentage (0 if no progress doc).
const buildProgressReport = async () => {
  const students = await Student.find({})
    .select('name classRef')
    .populate('classRef', 'name')
    .sort({ studentId: 1 })
    .lean<IStudentReportLean[]>();

  const progressDocs = await Progress.find({})
    .select('studentRef percentage')
    .lean();

  const percentageByStudent = new Map(
    progressDocs.map((p) => [String(p.studentRef), p.percentage ?? 0]),
  );

  const rows = students.map((s) => ({
    studentId: s._id,
    name: s.name,
    className: s.classRef?.name ?? '',
    percentage: percentageByStudent.get(String(s._id)) ?? 0,
  }));

  const completedLevels = rows.filter((r) => r.percentage >= 100).length;
  const avgPercentage =
    rows.length > 0
      ? Math.round(
          rows.reduce((sum, r) => sum + r.percentage, 0) / rows.length,
        )
      : 0;

  return { rows, totals: { avgPercentage, completedLevels } };
};

// ─── GET /api/analytics/report?type=&month=&year= ──────────────────
type TReportType = 'salary' | 'payment' | 'attendance' | 'progress';
const REPORT_TYPES: TReportType[] = [
  'salary',
  'payment',
  'attendance',
  'progress',
];

const getReport = async (
  type: string,
  monthArg?: number,
  yearArg?: number,
) => {
  if (!REPORT_TYPES.includes(type as TReportType)) {
    throw httpError(
      `Invalid report type. Expected one of: ${REPORT_TYPES.join(', ')}`,
      400,
    );
  }

  const { month, year } = resolvePeriod(monthArg, yearArg);

  let result: { rows: unknown[]; totals: Record<string, number> };

  switch (type as TReportType) {
    case 'salary':
      result = await buildSalaryReport();
      break;
    case 'payment':
      result = await buildPaymentReport(month, year);
      break;
    case 'attendance':
      result = await buildAttendanceReport(month, year);
      break;
    case 'progress':
    default:
      result = await buildProgressReport();
      break;
  }

  return {
    data: {
      type,
      month,
      year,
      rows: result.rows,
      totals: result.totals,
    },
  };
};

export const AnalyticsService = {
  getOverview,
  getReport,
};
