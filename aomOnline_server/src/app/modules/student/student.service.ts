import { FilterQuery, Types } from 'mongoose';
import { Student } from './student.model';
import { IStudent } from './student.interface';
import { Class } from '../class/class.model';
import { IMilestone } from '../class/class.interface';
import { Progress } from '../progress/progress.model';
import { Attendance } from '../attendance/attendance.model';
import { TAttendanceStatus } from '../attendance/attendance.interface';
import { Material } from '../material/material.model';
import { IMaterial } from '../material/material.interface';
import { Notification } from '../notification/notification.model';
import { Payment } from '../payment/payment.model';
import { User } from '../user/user.model';
import { Group } from '../group/group.model';
import { createUserAccount } from '../user/user.service';
import {
  resolveMonthYear,
  monthRangeUTC,
  formatDateUTC,
} from '../attendance/attendance.utils';

// The subset of req.user the dashboard aggregation needs.
export interface IActor {
  userId: string;
  role: string;
  email?: string;
}

const httpError = (message: string, status: number) =>
  Object.assign(new Error(message), { status });

interface IListQuery {
  search?: string;
  teacher?: string;
  class?: string;
  status?: string;
  type?: 'single' | 'group'; // single = no group; group = has a group
  group?: string; // a specific group id
  page?: string;
  limit?: string;
}

interface IListResult {
  data: unknown[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Generate the next studentId: 'AOM' + current year + 3-digit sequence within
// that year → AOM2026001, AOM2026002, … Computed from the current max for the
// year's prefix (ids are zero-padded so lexicographic == numeric order).
const generateStudentId = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = `AOM${year}`;

  const last = await Student.findOne({
    studentId: new RegExp(`^${prefix}\\d{3}$`),
  })
    .sort({ studentId: -1 })
    .select('studentId')
    .lean();

  let nextNumber = 1;
  if (last?.studentId) {
    const current = parseInt(last.studentId.replace(prefix, ''), 10);
    if (!Number.isNaN(current)) {
      nextNumber = current + 1;
    }
  }
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
};

// Resolve a class's monthlyFee, or throw 404 if the class does not exist.
const getClassFee = async (classRef: string): Promise<number> => {
  const cls = await Class.findById(classRef).select('monthlyFee').lean();
  if (!cls) {
    throw Object.assign(new Error('Class not found'), { status: 404 });
  }
  return cls.monthlyFee;
};

// A group student inherits its batch's teacher/class/fee (single source of
// truth), so downstream features (payment/attendance/certificate) treat it as
// a normal student. The teacher payout is FLAT per group, so the per-student
// payout is zeroed here — the salary system adds the group's flat payout once.
const groupDefaults = async (
  groupRef?: string,
  explicitFee?: number,
): Promise<Record<string, unknown>> => {
  if (!groupRef) return {};
  const group = await Group.findById(groupRef).select('teacherRef classRef monthlyFee').lean();
  if (!group) {
    throw Object.assign(new Error('Group not found'), { status: 404 });
  }
  return {
    teacherRef: group.teacherRef,
    classRef: group.classRef,
    monthlyFee: explicitFee ?? group.monthlyFee,
    teacherPayoutAmount: 0,
  };
};

// GET /api/students — admin: paginated, filterable list.
const getAllStudents = async (query: IListQuery): Promise<IListResult> => {
  const { search, teacher, class: classId, status, type, group } = query;

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  const filter: FilterQuery<IStudent> = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { guardianName: { $regex: search, $options: 'i' } },
    ];
  }

  if (teacher) {
    filter.teacherRef = teacher;
  }

  if (classId) {
    filter.classRef = classId;
  }

  if (status) {
    filter.status = status;
  }

  // 'single' = students with no group; 'group' = students that belong to one.
  if (type === 'single') {
    filter.groupRef = null;
  } else if (type === 'group') {
    filter.groupRef = { $ne: null };
  }
  if (group) {
    filter.groupRef = group;
  }

  const [data, total] = await Promise.all([
    Student.find(filter)
      .populate('classRef', 'name nameEn')
      .populate({
        path: 'teacherRef',
        select: 'teacherId userRef',
        populate: { path: 'userRef', select: 'name' },
      })
      .populate({
        path: 'groupRef',
        select: 'name scheduleDays startTime endTime monthlyFee',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Student.countDocuments(filter),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// GET /api/students/:id — admin: single student.
const getStudentById = async (id: string): Promise<unknown> => {
  const student = await Student.findById(id)
    .populate('classRef', 'name nameEn')
    .populate({
      path: 'teacherRef',
      select: 'teacherId userRef',
      populate: { path: 'userRef', select: 'name +rawPassword' },
    })
    .populate('userRef', 'email +rawPassword');
  if (!student) {
    throw Object.assign(new Error('Student not found'), { status: 404 });
  }
  return student;
};

// POST /api/students — admin: create a profile (userRef optional).
// If guardianEmail+guardianPassword are supplied, also creates the linked
// guardian login account (role 'parent') — the guardian's login IS
// Student.userRef, there is no separate Guardian model. Rolls back the
// orphaned User if the Student insert fails, mirroring teacher.service.ts.
const createStudent = async (payload: {
  name: string;
  email?: string;
  phone?: string;
  teacherRef?: string;
  classRef?: string;
  groupRef?: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  photo?: string;
  monthlyFee?: number;
  teacherPayoutAmount?: number;
  guardianEmail?: string;
  guardianPassword?: string;
  status?: 'active' | 'inactive';
}): Promise<IStudent> => {
  const { guardianEmail, guardianPassword, ...studentFields } = payload;
  const studentId = await generateStudentId();

  // A group student inherits teacher/class/fee from its batch.
  const groupOverrides = await groupDefaults(
    studentFields.groupRef,
    studentFields.monthlyFee,
  );
  Object.assign(studentFields, groupOverrides);

  // Derive monthlyFee from the class unless an explicit fee (or group) supplied.
  let monthlyFee = studentFields.monthlyFee;
  if (monthlyFee === undefined && studentFields.classRef) {
    monthlyFee = await getClassFee(studentFields.classRef);
  }

  let guardianUserId: Types.ObjectId | undefined;
  if (guardianEmail && guardianPassword) {
    const guardianUser = await createUserAccount({
      name: studentFields.guardianName || studentFields.name,
      email: guardianEmail,
      password: guardianPassword,
      phone: studentFields.guardianPhone,
      role: 'parent',
    });
    guardianUserId = guardianUser._id as Types.ObjectId;
  }

  try {
    const student = await Student.create({
      ...studentFields,
      studentId,
      monthlyFee,
      userRef: guardianUserId,
    });
    return student;
  } catch (error) {
    // Roll back the orphaned guardian User if the profile insert fails.
    if (guardianUserId) {
      await User.findByIdAndDelete(guardianUserId);
    }
    throw error;
  }
};

// PATCH /api/students/:id — admin: update. Reassigning classRef recomputes
// monthlyFee unless an explicit monthlyFee is supplied in the same request.
// If guardianEmail+guardianPassword are supplied and the student has no
// linked account yet, creates+links the guardian login (role 'parent').
const updateStudent = async (
  id: string,
  payload: {
    name?: string;
    email?: string;
    phone?: string;
    teacherRef?: string;
    classRef?: string;
    groupRef?: string;
    guardianName?: string;
    guardianPhone?: string;
    address?: string;
    photo?: string;
    monthlyFee?: number;
    teacherPayoutAmount?: number;
    guardianEmail?: string;
    guardianPassword?: string;
    teacherEmail?: string;
    teacherPassword?: string;
    status?: 'active' | 'inactive';
  },
): Promise<IStudent> => {
  const student = await Student.findById(id);
  if (!student) {
    throw Object.assign(new Error('Student not found'), { status: 404 });
  }

  const { guardianEmail, guardianPassword, teacherEmail, teacherPassword, ...studentFields } = payload;

  const update: Record<string, unknown> = { ...studentFields };

  // A group student inherits teacher/class/fee from its batch.
  if (studentFields.groupRef) {
    Object.assign(update, await groupDefaults(studentFields.groupRef, studentFields.monthlyFee));
  } else if (studentFields.classRef && studentFields.monthlyFee === undefined) {
    // Reassigning the class (single student) recomputes the fee.
    update.monthlyFee = await getClassFee(studentFields.classRef);
  }

  // Create + link a guardian account for a previously profile-only student.
  if (guardianEmail && guardianPassword && !student.userRef) {
    const guardianUser = await createUserAccount({
      name: (studentFields.guardianName ?? student.guardianName) || student.name,
      email: guardianEmail,
      password: guardianPassword,
      phone: studentFields.guardianPhone ?? student.guardianPhone,
      role: 'parent',
    });
    update.userRef = guardianUser._id;
  } else if (student.userRef && (guardianEmail || guardianPassword)) {
    // If account exists, update email or password if provided
    const userToUpdate = await User.findById(student.userRef);
    if (userToUpdate) {
      if (guardianEmail) userToUpdate.email = guardianEmail;
      if (guardianPassword) {
        userToUpdate.password = guardianPassword;
        userToUpdate.rawPassword = guardianPassword;
      }
      await userToUpdate.save();
    }
  }

  // Update teacher credentials if provided and a teacher is assigned
  const effectiveTeacherRef = studentFields.teacherRef || student.teacherRef;
  if (effectiveTeacherRef && (teacherEmail || teacherPassword)) {
    const teacher = await import('../teacher/teacher.model').then(m => m.Teacher.findById(effectiveTeacherRef));
    if (teacher && teacher.userRef) {
      const userToUpdate = await User.findById(teacher.userRef);
      if (userToUpdate) {
        if (teacherEmail) userToUpdate.email = teacherEmail;
        if (teacherPassword) {
          userToUpdate.password = teacherPassword;
          userToUpdate.rawPassword = teacherPassword;
        }
        await userToUpdate.save();
      }
    }
  }

  Object.assign(student, update);
  await student.save();
  return student;
};

// DELETE /api/students/:id — admin: delete a student profile.
const deleteStudent = async (id: string): Promise<IStudent> => {
  const deleted = await Student.findByIdAndDelete(id);
  if (!deleted) {
    throw Object.assign(new Error('Student not found'), { status: 404 });
  }
  return deleted;
};

// Tally a status list into a per-status summary (+ total marked days).
// Mirrors attendance.service's summarize() so counts match that module exactly.
const summarizeAttendance = (statuses: TAttendanceStatus[]) => {
  const summary = { present: 0, absent: 0, leave: 0, holiday: 0, total: 0 };
  for (const s of statuses) {
    summary[s] += 1;
    summary.total += 1;
  }
  return summary;
};

// Shapes for the lean docs we read for the dashboard.
interface IStudentDashboardLean {
  _id: Types.ObjectId;
  studentId: string;
  name: string;
  photo?: string;
  guardianName?: string;
  guardianPhone?: string;
  monthlyFee?: number;
  status: string;
  classRef?: { _id: Types.ObjectId; name?: string; milestones?: IMilestone[] };
  teacherRef?: {
    _id: Types.ObjectId;
    teacherId?: string;
    userRef?: { name?: string };
  };
}

// GET /api/students/me/dashboard?month=&year=
// Consolidated student portal: resolves the logged-in user's Student profile
// (404 if none) and aggregates profile + progress + a full-month attendance
// grid + class-scoped materials + this user's notifications in one call.
const getMyDashboard = async (
  actor: IActor,
  monthArg?: number,
  yearArg?: number,
) => {
  // Resolve the Student owned by this user. A student sees ONLY their own data.
  const student = await Student.findOne({ userRef: actor.userId })
    .select(
      'studentId name photo classRef teacherRef guardianName guardianPhone monthlyFee status',
    )
    .populate('classRef', 'name milestones')
    .populate({
      path: 'teacherRef',
      select: 'teacherId userRef',
      populate: { path: 'userRef', select: 'name' },
    })
    .lean<IStudentDashboardLean>();

  if (!student) {
    throw httpError('No student profile is linked to this account', 404);
  }

  const cls = student.classRef;
  const classRefId = cls?._id ?? null;
  const className = cls?.name;
  const milestones = [...(cls?.milestones ?? [])].sort(
    (a, b) => a.percent - b.percent,
  );

  const teacher = student.teacherRef;
  const teacherId = teacher?.teacherId;
  const teacherName = teacher?.userRef?.name;

  const { month, year } = resolveMonthYear(monthArg, yearArg);
  const { start, end } = monthRangeUTC(month, year);

  // Fetch progress, this month's attendance records, class-scoped materials,
  // this user's notifications, and the CURRENT (real, not browsed) month's
  // payment status concurrently.
  const materialOr: FilterQuery<IMaterial>[] = [{ classRef: null }];
  if (classRefId) {
    materialOr.push({ classRef: classRefId });
  }
  const now = new Date();
  const currentPeriod = {
    month: now.getUTCMonth() + 1,
    year: now.getUTCFullYear(),
  };

  const [progressDoc, attendanceRecords, materials, notifications, unreadCount, paymentDoc] =
    await Promise.all([
      Progress.findOne({ studentRef: student._id })
        .select('percentage completedMilestones note')
        .lean(),
      Attendance.find({
        studentRef: student._id,
        date: { $gte: start, $lt: end },
      })
        .select('date status')
        .lean(),
      Material.find({ isActive: true, $or: materialOr })
        .select('title description fileUrl fileType classRef')
        .populate('classRef', 'name nameEn')
        .sort({ createdAt: -1 })
        .lean(),
      Notification.find({ userRef: actor.userId })
        .select('title message type read createdAt')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Notification.countDocuments({ userRef: actor.userId, read: false }),
      Payment.findOne({
        studentRef: student._id,
        month: currentPeriod.month,
        year: currentPeriod.year,
      })
        .select('status transactionId bankInfo rejectionReason amount')
        .lean(),
    ]);

  // Index the month's records by UTC 'YYYY-MM-DD' for the day-grid lookup.
  const statusByDate = new Map<string, TAttendanceStatus>();
  for (const r of attendanceRecords) {
    statusByDate.set(formatDateUTC(r.date), r.status);
  }

  // Build the FULL month grid: one entry per calendar day (1..daysInMonth),
  // each day's status from the stored record or null. daysInMonth via day 0 of
  // the next month (UTC).
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = formatDateUTC(new Date(Date.UTC(year, month - 1, day)));
    days.push({
      day,
      date,
      status: statusByDate.get(date) ?? null,
    });
  }

  const summary = summarizeAttendance(attendanceRecords.map((r) => r.status));

  return {
    student: {
      _id: student._id,
      studentId: student.studentId,
      name: student.name,
      photo: student.photo,
      classRef: classRefId,
      className,
      teacherId,
      teacherName,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      monthlyFee: student.monthlyFee,
      status: student.status,
    },
    progress: {
      percentage: progressDoc?.percentage ?? 0,
      completedMilestones: progressDoc?.completedMilestones ?? [],
      note: progressDoc?.note ?? '',
      milestones,
      className,
    },
    attendance: {
      month,
      year,
      days,
      summary,
    },
    materials,
    notifications: {
      items: notifications,
      unreadCount,
    },
    payment: {
      month: currentPeriod.month,
      year: currentPeriod.year,
      status: paymentDoc?.status ?? 'unpaid',
      amount: paymentDoc?.amount ?? student.monthlyFee ?? 0,
      transactionId: paymentDoc?.transactionId,
      bankInfo: paymentDoc?.bankInfo,
      rejectionReason: paymentDoc?.rejectionReason,
    },
  };
};

export const StudentService = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  generateStudentId,
  getMyDashboard,
};
