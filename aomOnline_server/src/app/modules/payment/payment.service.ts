import { FilterQuery, Types } from 'mongoose';
import { Payment } from './payment.model';
import { Teacher } from '../teacher/teacher.model';
import { ITeacher } from '../teacher/teacher.interface';
import { Student } from '../student/student.model';
import { User } from '../user/user.model';
import { sumTeacherPayout } from '../teacher/teacher.utils';
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

interface IOverviewQuery {
  search?: string;
  page?: string;
  limit?: string;
}

interface IPaymentStats {
  totalPaid: number;
  totalUnpaid: number;
  totalPending: number;
  totalCollected: number;
  totalDue: number;
  paidPercent: number;
  unpaidPercent: number;
}

// Count students assigned to a given teacher.
const countStudents = async (teacherRef: Types.ObjectId): Promise<number> => {
  return Student.countDocuments({ teacherRef });
};

// Teacher payout now lives in teacher.utils.ts — see the note there about the
// three copies of this formula that had drifted apart.

// Resolve the effective month/year, defaulting to the current server date.
const resolvePeriod = (
  month?: number,
  year?: number,
): { month: number; year: number } => {
  const now = new Date();
  return {
    month: month ?? now.getMonth() + 1, // getMonth() is 0-based
    year: year ?? now.getFullYear(),
  };
};

// Shape of a teacher doc populated with its userRef (name/email/phone).
interface IPopulatedUser {
  name?: string;
  email?: string;
  phone?: string;
}
interface ITeacherLean extends Omit<ITeacher, 'userRef'> {
  _id: Types.ObjectId;
  userRef?: IPopulatedUser | null;
}

// Compute the paid/unpaid stats for a single teacher's students in a period.
// totalCollected = Σ monthlyFee of paid students; totalDue = Σ monthlyFee of unpaid.
const computeTeacherStats = async (
  teacherRef: Types.ObjectId,
  month: number,
  year: number,
): Promise<IPaymentStats> => {
  const students = await Student.find({ teacherRef })
    .select('monthlyFee')
    .lean();

  const payments = await Payment.find({
    studentRef: { $in: students.map((s) => s._id) },
    month,
    year,
  })
    .select('studentRef status')
    .lean();

  const statusByStudent = new Map(
    payments.map((p) => [String(p.studentRef), p.status]),
  );

  let totalPaid = 0;
  let totalUnpaid = 0;
  let totalPending = 0;
  let totalCollected = 0;
  let totalDue = 0;

  for (const s of students) {
    const fee = s.monthlyFee ?? 0;
    const status = statusByStudent.get(String(s._id)) ?? 'unpaid';
    if (status === 'paid') {
      totalPaid += 1;
      totalCollected += fee;
    } else if (status === 'pending') {
      totalPending += 1;
      totalDue += fee;
    } else {
      totalUnpaid += 1;
      totalDue += fee;
    }
  }

  const totalStudents = students.length;
  const paidPercent =
    totalStudents > 0 ? Math.round((totalPaid / totalStudents) * 100) : 0;
  const unpaidPercent = totalStudents > 0 ? 100 - paidPercent : 0;

  return {
    totalPaid,
    totalUnpaid,
    totalPending,
    totalCollected,
    totalDue,
    paidPercent,
    unpaidPercent,
  };
};

// GET /api/payments/overview — admin: teacher salary overview (next month).
// nextMonthSalary = Σ each assigned student's teacherPayoutAmount (falls back
// to ratePerStudent per-student if unset); totalSalaryNextMonth is the sum
// across ALL teachers (not just the current page).
const getOverview = async (query: IOverviewQuery) => {
  const { search } = query;

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  const filter: FilterQuery<ITeacher> = {};

  // Search across teacherId + linked user's name/email.
  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    })
      .select('_id')
      .lean();
    const userIds = users.map((u) => u._id);

    filter.$or = [
      { teacherId: { $regex: search, $options: 'i' } },
      { userRef: { $in: userIds } },
    ];
  }

  const [teachers, total] = await Promise.all([
    Teacher.find(filter)
      .populate('userRef', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<ITeacherLean[]>(),
    Teacher.countDocuments(filter),
  ]);

  // Per-teacher card data (with derived studentCount + nextMonthSalary).
  const teacherCards = await Promise.all(
    teachers.map(async (t) => {
      const studentCount = await countStudents(t._id);
      const nextMonthSalary = await sumTeacherPayout(t._id, t.ratePerStudent ?? 0);
      return {
        _id: t._id,
        teacherId: t.teacherId,
        name: t.userRef?.name ?? '',
        photo: t.photo,
        subject: t.subject,
        ratePerStudent: t.ratePerStudent,
        studentCount,
        nextMonthSalary,
      };
    }),
  );

  // Summary spans ALL teachers (respecting the search filter), not just the page.
  const allTeachers = await Teacher.find(filter)
    .select('ratePerStudent')
    .lean<ITeacherLean[]>();
  const [totalStudents, ...salaries] = await Promise.all([
    Student.countDocuments({}),
    ...allTeachers.map((t) => sumTeacherPayout(t._id, t.ratePerStudent ?? 0)),
  ]);
  const totalSalaryNextMonth = salaries.reduce((sum, s) => sum + s, 0);

  return {
    data: {
      summary: {
        totalTeachers: total,
        totalStudents,
        totalSalaryNextMonth,
      },
      teachers: teacherCards,
    },
    meta: {
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// GET /api/payments/teacher/:teacherId — admin (any teacher) / teacher (own
// only) — one teacher's collection sheet for a month/year. Each student's
// status comes from its Payment record (or 'unpaid' if none exists). A
// teacher actor never sees transactionId/bankInfo/guardian contact info —
// those fields are omitted entirely from the response for that role.
const getTeacherPayments = async (
  actor: IActor,
  teacherId: string,
  monthArg?: number,
  yearArg?: number,
) => {
  const { month, year } = resolvePeriod(monthArg, yearArg);

  const teacher = await Teacher.findById(teacherId)
    .populate('userRef', 'name email phone')
    .lean<ITeacherLean>();
  if (!teacher) {
    throw Object.assign(new Error('Teacher not found'), { status: 404 });
  }

  // A 'teacher' actor may only view their own collection sheet.
  if (!isAdmin(actor.role)) {
    const ownTeacher = await Teacher.findOne({ userRef: actor.userId })
      .select('_id')
      .lean();
    if (!ownTeacher || String(ownTeacher._id) !== String(teacher._id)) {
      throw httpError('Forbidden: this is not your collection sheet', 403);
    }
  }

  const students = await Student.find({ teacherRef: teacher._id })
    .select('studentId name photo monthlyFee teacherPayoutAmount')
    .sort({ studentId: 1 })
    .lean();

  const studentCount = students.length;
  const fallbackRate = teacher.ratePerStudent ?? 0;
  const nextMonthSalary = students.reduce(
    (sum, s) => sum + (s.teacherPayoutAmount ?? fallbackRate),
    0,
  );

  // Look up existing payments for these students in the given period.
  const payments = await Payment.find({
    studentRef: { $in: students.map((s) => s._id) },
    month,
    year,
  })
    .select('studentRef status transactionId bankInfo rejectionReason')
    .lean();

  const paymentByStudent = new Map(
    payments.map((p) => [String(p.studentRef), p]),
  );

  let totalPaid = 0;
  let totalUnpaid = 0;
  let totalPending = 0;
  let totalCollected = 0;
  let totalDue = 0;

  const isTeacherActor = !isAdmin(actor.role);

  const studentRows = students.map((s) => {
    const payment = paymentByStudent.get(String(s._id));
    const status: 'paid' | 'unpaid' | 'pending' = payment?.status ?? 'unpaid';
    const fee = s.monthlyFee ?? 0;

    if (status === 'paid') {
      totalPaid += 1;
      totalCollected += fee;
    } else if (status === 'pending') {
      totalPending += 1;
      totalDue += fee;
    } else {
      totalUnpaid += 1;
      totalDue += fee;
    }

    return {
      _id: s._id,
      studentId: s.studentId,
      name: s.name,
      photo: s.photo,
      monthlyFee: s.monthlyFee,
      status,
      paymentId: payment?._id,
      // Review-relevant fields — admin only, never surfaced to a teacher.
      ...(isTeacherActor
        ? {}
        : {
            transactionId: payment?.transactionId,
            bankInfo: payment?.bankInfo,
            rejectionReason: payment?.rejectionReason,
          }),
    };
  });

  const paidPercent =
    studentCount > 0 ? Math.round((totalPaid / studentCount) * 100) : 0;
  const unpaidPercent = studentCount > 0 ? 100 - paidPercent : 0;

  return {
    data: {
      teacher: {
        _id: teacher._id,
        teacherId: teacher.teacherId,
        name: teacher.userRef?.name ?? '',
        // Teacher's own contact info is fine to show to themself; only
        // GUARDIAN contact info is restricted (there is none in this payload).
        email: teacher.userRef?.email ?? '',
        phone: teacher.userRef?.phone ?? teacher.phone ?? '',
        photo: teacher.photo,
        subject: teacher.subject,
        ratePerStudent: teacher.ratePerStudent,
        studentCount,
        nextMonthSalary,
      },
      month,
      year,
      students: studentRows,
      stats: {
        totalPaid,
        totalUnpaid,
        totalPending,
        totalCollected,
        totalDue,
        paidPercent,
        unpaidPercent,
      },
    },
  };
};

// GET /api/payments/my-students — teacher: self-resolving version of
// getTeacherPayments (no :teacherId param needed — resolves the actor's own
// Teacher profile first).
const getMyPayments = async (actor: IActor, monthArg?: number, yearArg?: number) => {
  const teacher = await Teacher.findOne({ userRef: actor.userId })
    .select('_id')
    .lean();
  if (!teacher) {
    throw httpError('No teacher profile is linked to this account', 403);
  }
  return getTeacherPayments(actor, String(teacher._id), monthArg, yearArg);
};

// PATCH /api/payments/toggle — admin: flip a student's paid/unpaid status for a
// period. First toggle (no record) creates a 'paid' record; thereafter it
// flips the existing record — a 'pending' (guardian-submitted) record also
// resolves to 'paid' on toggle (equivalent to an admin approval). amount
// always tracks the student's current monthlyFee.
const togglePayment = async (
  actor: IActor,
  studentId: string,
  monthArg?: number,
  yearArg?: number,
) => {
  const { month, year } = resolvePeriod(monthArg, yearArg);

  const student = await Student.findById(studentId)
    .select('teacherRef monthlyFee')
    .lean();
  if (!student) {
    throw Object.assign(new Error('Student not found'), { status: 404 });
  }
  if (!student.teacherRef) {
    throw Object.assign(
      new Error('Student is not assigned to a teacher'),
      { status: 400 },
    );
  }

  const monthlyFee = student.monthlyFee ?? 0;

  let payment = await Payment.findOne({
    studentRef: student._id,
    month,
    year,
  });

  if (!payment) {
    // First toggle marks the student paid.
    payment = await Payment.create({
      studentRef: student._id,
      teacherRef: student.teacherRef,
      month,
      year,
      amount: monthlyFee,
      status: 'paid',
      paidAt: new Date(),
    });
  } else {
    // Flip the existing record. A 'pending' record resolves to 'paid'.
    const wasPending = payment.status === 'pending';
    if (payment.status === 'paid') {
      payment.status = 'unpaid';
      payment.paidAt = undefined;
    } else {
      payment.status = 'paid';
      payment.paidAt = new Date();
    }
    if (wasPending) {
      payment.reviewedBy = new Types.ObjectId(actor.userId);
      payment.reviewedAt = new Date();
    }
    // Keep amount aligned with the student's current monthlyFee.
    payment.amount = monthlyFee;
    await payment.save();
  }

  // Recompute the teacher's stats for the period so the client can update
  // without a full refetch.
  const stats = await computeTeacherStats(
    student.teacherRef as Types.ObjectId,
    month,
    year,
  );

  return { payment, stats };
};

// POST /api/payments/submit — guardian: submit a payment claim (transaction
// ID and/or bank info) for their own student, for the current (or given)
// month/year. Sets status → 'pending' for Super Admin review. Manual only —
// there is no payment gateway integration.
const submitPayment = async (
  actor: IActor,
  payload: {
    paymentMethod?: string;
    feeType?: string;
    feeNote?: string;
    amount?: number;
    senderInfo?: string;
    transactionId?: string;
    bankInfo?: string;
    bankAccountNumber?: string;
    bankAccountHolder?: string;
    screenshotUrl?: string;
    month?: number;
    year?: number;
  },
) => {
  const student = await Student.findOne({ userRef: actor.userId })
    .select('teacherRef monthlyFee')
    .lean();
  if (!student) {
    throw httpError('No student profile is linked to this account', 404);
  }
  if (!student.teacherRef) {
    throw httpError('Student is not assigned to a teacher yet', 400);
  }

  // At least one form of proof — a transaction ID OR a screenshot — is required
  // so the admin has something to verify against.
  if (!payload.transactionId && !payload.screenshotUrl) {
    throw httpError('Provide a transaction ID or a payment screenshot', 400);
  }

  const { month, year } = resolvePeriod(payload.month, payload.year);
  const monthlyFee = student.monthlyFee ?? 0;
  // The guardian may override the amount; fall back to the student's monthly
  // fee. Coerce with Number() because multipart fields arrive as strings (and
  // validateRequest validates without mutating req.body).
  const overrideAmount = Number(payload.amount);
  const amount =
    Number.isFinite(overrideAmount) && overrideAmount > 0
      ? overrideAmount
      : monthlyFee;

  const payment = await Payment.findOneAndUpdate(
    { studentRef: student._id, month, year },
    {
      $set: {
        teacherRef: student.teacherRef,
        amount,
        status: 'pending',
        paymentMethod: payload.paymentMethod,
        feeType: payload.feeType,
        feeNote: payload.feeNote,
        senderInfo: payload.senderInfo,
        transactionId: payload.transactionId,
        bankInfo: payload.bankInfo,
        bankAccountNumber: payload.bankAccountNumber,
        bankAccountHolder: payload.bankAccountHolder,
        screenshotUrl: payload.screenshotUrl,
        submittedAt: new Date(),
        submittedBy: actor.userId,
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return { payment };
};

// How many months past the current one the guardian may pay in advance.
const ADVANCE_MONTHS = 3;

// GET /api/payments/my-payable — guardian: the context needed to render the
// payment form. Returns the auto-filled student/class/teacher/amount plus a
// month list spanning the student's enrolment month → the current month → a
// few future months (advance payment). EVERY month is returned with its status
// and a `payable` flag: months already 'paid' or in 'pending' review come back
// payable:false so the client can show them but keep them DISABLED in the
// dropdown; only genuinely-owed months are selectable. month+year are bundled
// per option so the client never has to reason about the year separately.
const getPayableMonths = async (actor: IActor) => {
  const student = await Student.findOne({ userRef: actor.userId })
    .select('studentId name monthlyFee enrolledAt classRef teacherRef')
    .populate('classRef', 'name')
    .populate({
      path: 'teacherRef',
      select: 'teacherId userRef',
      populate: { path: 'userRef', select: 'name' },
    })
    .lean<{
      _id: Types.ObjectId;
      studentId: string;
      name: string;
      monthlyFee?: number;
      enrolledAt?: Date;
      classRef?: { name?: string } | null;
      teacherRef?: { userRef?: { name?: string } | null } | null;
    }>();
  if (!student) {
    throw httpError('No student profile is linked to this account', 404);
  }

  const now = new Date();
  const enrolled = student.enrolledAt ? new Date(student.enrolledAt) : now;

  // Walk month-by-month from enrolment (clamped to no later than now) up to the
  // current month PLUS a few future months for advance payment. A safety cap
  // keeps a bad enrolledAt from looping.
  let m = enrolled > now ? now.getMonth() + 1 : enrolled.getMonth() + 1;
  let y = enrolled > now ? now.getFullYear() : enrolled.getFullYear();
  // End = current month + ADVANCE_MONTHS (normalised across a year boundary).
  let endM = now.getMonth() + 1 + ADVANCE_MONTHS;
  let endY = now.getFullYear();
  while (endM > 12) {
    endM -= 12;
    endY += 1;
  }

  const periods: { month: number; year: number }[] = [];
  let guard = 0;
  while ((y < endY || (y === endY && m <= endM)) && guard < 120) {
    periods.push({ month: m, year: y });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    guard += 1;
  }

  const existing = periods.length
    ? await Payment.find({
        studentRef: student._id,
        $or: periods.map((p) => ({ month: p.month, year: p.year })),
      })
        .select('month year status rejectionReason')
        .lean()
    : [];

  const recordByPeriod = new Map(
    existing.map((p) => [`${p.year}-${p.month}`, p]),
  );

  // Chronological (oldest → newest) so the oldest due sits at the top and the
  // advance months trail at the bottom. Every month is kept — paid/pending ones
  // ride along with payable:false so the client shows-but-disables them.
  const months = periods.map((p) => {
    const rec = recordByPeriod.get(`${p.year}-${p.month}`);
    const status = rec?.status ?? 'unpaid';
    return {
      month: p.month,
      year: p.year,
      status,
      payable: status !== 'paid' && status !== 'pending',
      // Present only when a prior submission for this month was rejected.
      rejectionReason: rec?.rejectionReason,
    };
  });

  return {
    student: {
      studentId: student.studentId,
      name: student.name,
      className: student.classRef?.name ?? '',
      teacherName: student.teacherRef?.userRef?.name ?? '',
      amount: student.monthlyFee ?? 0,
    },
    months,
  };
};

// GET /api/payments/my-receipts — guardian: every payment record for their own
// linked student, newest first. The receipt view/download is most meaningful
// for confirmed ('paid') ones, but pending/rejected are returned too so the
// guardian sees their full history with each row's current status.
const getMyReceipts = async (actor: IActor) => {
  const student = await Student.findOne({ userRef: actor.userId })
    .select('_id')
    .lean();
  if (!student) {
    throw httpError('No student profile is linked to this account', 404);
  }

  const payments = await Payment.find({ studentRef: student._id })
    .populate({
      path: 'studentRef',
      select: 'studentId name photo phone classRef guardianName guardianPhone',
      populate: { path: 'classRef', select: 'name nameEn' },
    })
    .populate({
      path: 'teacherRef',
      select: 'teacherId userRef',
      populate: { path: 'userRef', select: 'name' },
    })
    .populate('reviewedBy', 'name')
    .sort({ year: -1, month: -1 })
    .lean();

  return payments;
};

// GET /api/payments/submissions — admin: every guardian-submitted payment
// claim, across all teachers — pending, approved, AND rejected. Rows never
// disappear from this list once submitted; only their status changes. Scoped
// to submittedBy != null so admin-toggled (non-guardian) payments never show
// up here — this is a review log, not the raw payment/toggle table.
const getSubmissions = async () => {
  const payments = await Payment.find({ submittedBy: { $ne: null } })
    .populate({
      path: 'studentRef',
      select: 'studentId name photo phone classRef guardianName guardianPhone',
      populate: { path: 'classRef', select: 'name nameEn' },
    })
    .populate({
      path: 'teacherRef',
      select: 'teacherId userRef',
      populate: { path: 'userRef', select: 'name' },
    })
    .populate('reviewedBy', 'name')
    .sort({ submittedAt: -1 })
    .lean();

  return { data: payments };
};

// Shared resolver for approve/reject — loads the payment or 404s.
const loadPendingPayment = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw httpError('Payment not found', 404);
  }
  return payment;
};

// PATCH /api/payments/:id/approve — admin: accept a submitted claim → 'paid'.
const approvePayment = async (actor: IActor, paymentId: string) => {
  const payment = await loadPendingPayment(paymentId);

  payment.status = 'paid';
  payment.paidAt = new Date();
  payment.reviewedBy = new Types.ObjectId(actor.userId);
  payment.reviewedAt = new Date();
  payment.rejectionReason = undefined;
  await payment.save();

  const student = await Student.findById(payment.studentRef)
    .select('userRef')
    .lean();
  if (student?.userRef) {
    await createNotification({
      userRef: student.userRef,
      title: 'পেমেন্ট অনুমোদিত হয়েছে',
      message: 'আপনার জমা দেওয়া পেমেন্ট সুপার অ্যাডমিন অনুমোদন করেছেন।',
      type: 'general',
      meta: { paymentId: payment._id },
    });
  }

  const stats = await computeTeacherStats(
    payment.teacherRef as Types.ObjectId,
    payment.month,
    payment.year,
  );

  return { payment, stats };
};

// PATCH /api/payments/:id/reject — admin: decline a submitted claim → back
// to 'unpaid', with an optional reason the guardian can see.
const rejectPayment = async (
  actor: IActor,
  paymentId: string,
  reason?: string,
) => {
  const payment = await loadPendingPayment(paymentId);

  payment.status = 'unpaid';
  payment.paidAt = undefined;
  payment.reviewedBy = new Types.ObjectId(actor.userId);
  payment.reviewedAt = new Date();
  payment.rejectionReason = reason;
  await payment.save();

  const student = await Student.findById(payment.studentRef)
    .select('userRef')
    .lean();
  if (student?.userRef) {
    await createNotification({
      userRef: student.userRef,
      title: 'পেমেন্ট প্রত্যাখ্যাত হয়েছে',
      message: reason
        ? `আপনার জমা দেওয়া পেমেন্ট প্রত্যাখ্যাত হয়েছে: ${reason}`
        : 'আপনার জমা দেওয়া পেমেন্ট প্রত্যাখ্যাত হয়েছে। আবার চেষ্টা করুন অথবা সাপোর্টে যোগাযোগ করুন।',
      type: 'general',
      meta: { paymentId: payment._id },
    });
  }

  const stats = await computeTeacherStats(
    payment.teacherRef as Types.ObjectId,
    payment.month,
    payment.year,
  );

  return { payment, stats };
};

export const PaymentService = {
  getOverview,
  getTeacherPayments,
  getMyPayments,
  togglePayment,
  submitPayment,
  getPayableMonths,
  getMyReceipts,
  getSubmissions,
  approvePayment,
  rejectPayment,
};
