import { Types } from 'mongoose';
import { Attendance } from './attendance.model';
import { TAttendanceStatus } from './attendance.interface';
import { Teacher } from '../teacher/teacher.model';
import { Student } from '../student/student.model';
import {
  normalizeToStartOfDayUTC,
  formatDateUTC,
  resolveMonthYear,
  monthRangeUTC,
} from './attendance.utils';

// The subset of req.user the service needs to resolve the actor.
export interface IActor {
  userId: string;
  role: string;
  email?: string;
}

// A lean Student doc as we select it here.
interface IStudentLean {
  _id: Types.ObjectId;
  studentId: string;
  name: string;
  photo?: string;
  teacherRef?: Types.ObjectId;
  classRef?: Types.ObjectId;
}

const httpError = (message: string, status: number) =>
  Object.assign(new Error(message), { status });

const isAdmin = (role: string) =>
  role === 'admin' || role === 'superAdmin';

// Resolve the acting teacher. For a 'teacher' actor we look up their Teacher
// profile by userRef (403 if none). For admins we return null (no restriction),
// unless a teacherId is supplied — in which case we resolve THAT teacher so the
// admin can act "as" a specific teacher (used by the teacher-scoped endpoints).
const resolveTeacherContext = async (
  actor: IActor,
  teacherId?: string,
): Promise<{ teacher: Types.ObjectId | null }> => {
  if (isAdmin(actor.role)) {
    if (teacherId) {
      const t = await Teacher.findById(teacherId).select('_id').lean();
      if (!t) throw httpError('Teacher not found', 404);
      return { teacher: t._id as Types.ObjectId };
    }
    return { teacher: null };
  }

  // Non-admin → must be a teacher with a profile.
  const teacher = await Teacher.findOne({ userRef: actor.userId })
    .select('_id')
    .lean();
  if (!teacher) {
    throw httpError('No teacher profile is linked to this account', 403);
  }
  return { teacher: teacher._id as Types.ObjectId };
};

// Load a student and enforce ownership. A teacher (or admin acting as a
// teacher) may only touch students whose teacherRef matches. A pure admin
// (teacherScope === null) may touch any student.
const loadOwnedStudent = async (
  studentId: string,
  teacherScope: Types.ObjectId | null,
): Promise<IStudentLean> => {
  const student = await Student.findById(studentId)
    .select('studentId name photo teacherRef classRef')
    .lean<IStudentLean>();
  if (!student) {
    throw httpError('Student not found', 404);
  }
  if (teacherScope) {
    if (
      !student.teacherRef ||
      String(student.teacherRef) !== String(teacherScope)
    ) {
      throw httpError(
        'Forbidden: this student is not assigned to you',
        403,
      );
    }
  }
  return student;
};

// GET /api/attendance/my-students?date=&teacherId=
// Teacher → their students with today's (or ?date's) status (null if unmarked).
// Admin may pass ?teacherId= to view a specific teacher's roster.
const getMyStudents = async (
  actor: IActor,
  dateArg?: string,
  teacherId?: string,
) => {
  const { teacher } = await resolveTeacherContext(actor, teacherId);

  // A pure admin with no teacherId has no single roster — require teacherId.
  if (teacher === null) {
    throw httpError(
      'teacherId is required for admin to list a roster',
      400,
    );
  }

  const date = normalizeToStartOfDayUTC(dateArg);

  const students = await Student.find({ teacherRef: teacher })
    .select('studentId name photo classRef')
    .populate('classRef', 'name')
    .sort({ studentId: 1 })
    .lean();

  const records = await Attendance.find({
    studentRef: { $in: students.map((s) => s._id) },
    date,
  })
    .select('studentRef status')
    .lean();

  const statusByStudent = new Map(
    records.map((r) => [String(r.studentRef), r.status]),
  );

  const rows = students.map((s) => {
    const cls = s.classRef as unknown as { name?: string } | undefined;
    return {
      _id: s._id,
      studentId: s.studentId,
      name: s.name,
      photo: s.photo,
      className: cls?.name,
      status: (statusByStudent.get(String(s._id)) ??
        null) as TAttendanceStatus | null,
    };
  });

  return { date: formatDateUTC(date), students: rows };
};

// POST /api/attendance/mark — upsert one student's attendance for a day.
const markOne = async (
  actor: IActor,
  payload: {
    studentId: string;
    date?: string;
    status: TAttendanceStatus;
    note?: string;
  },
) => {
  const { teacher } = await resolveTeacherContext(actor);
  const student = await loadOwnedStudent(payload.studentId, teacher);

  if (!student.teacherRef) {
    throw httpError('Student is not assigned to a teacher', 400);
  }

  const date = normalizeToStartOfDayUTC(payload.date);

  const record = await Attendance.findOneAndUpdate(
    { studentRef: student._id, date },
    {
      $set: {
        teacherRef: student.teacherRef,
        status: payload.status,
        markedBy: actor.userId,
        ...(payload.note !== undefined ? { note: payload.note } : {}),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return record;
};

// DELETE /api/attendance/student/:studentId?date= — remove one student's mark
// for a day, returning them to "not marked".
//
// Needed because the four statuses can only ever replace each other; without
// this there is no way to undo a mis-tap on a student who was never actually
// meant to be marked that day.
const clearOne = async (
  actor: IActor,
  studentId: string,
  dateArg?: string,
) => {
  const { teacher } = await resolveTeacherContext(actor);
  const student = await loadOwnedStudent(studentId, teacher);

  const date = normalizeToStartOfDayUTC(dateArg);

  await Attendance.deleteOne({ studentRef: student._id, date });

  return { cleared: true, studentId: student._id, date };
};

// POST /api/attendance/bulk — upsert many students' attendance for one day.
// Non-owned students are skipped (denied) rather than aborting the whole batch.
const markBulk = async (
  actor: IActor,
  payload: {
    date?: string;
    records: { studentId: string; status: TAttendanceStatus; note?: string }[];
  },
) => {
  const { teacher } = await resolveTeacherContext(actor);
  const date = normalizeToStartOfDayUTC(payload.date);

  // Fetch the referenced students once and index by id.
  const ids = payload.records.map((r) => r.studentId);
  const students = await Student.find({ _id: { $in: ids } })
    .select('teacherRef')
    .lean<{ _id: Types.ObjectId; teacherRef?: Types.ObjectId }[]>();
  const studentById = new Map(students.map((s) => [String(s._id), s]));

  const ops: Parameters<typeof Attendance.bulkWrite>[0] = [];
  const denied: string[] = [];
  let marked = 0;

  for (const rec of payload.records) {
    const student = studentById.get(rec.studentId);

    // Unknown student, unassigned, or (for a scoped actor) not owned → deny.
    if (!student || !student.teacherRef) {
      denied.push(rec.studentId);
      continue;
    }
    if (teacher && String(student.teacherRef) !== String(teacher)) {
      denied.push(rec.studentId);
      continue;
    }

    ops.push({
      updateOne: {
        filter: { studentRef: student._id, date },
        update: {
          $set: {
            teacherRef: student.teacherRef,
            status: rec.status,
            markedBy: actor.userId,
            ...(rec.note !== undefined ? { note: rec.note } : {}),
          },
        },
        upsert: true,
      },
    });
    marked += 1;
  }

  if (ops.length > 0) {
    await Attendance.bulkWrite(ops);
  }

  return {
    date: formatDateUTC(date),
    marked,
    denied,
    deniedCount: denied.length,
  };
};

// Tally a status list into a per-status summary (+ total marked days).
const summarize = (statuses: TAttendanceStatus[]) => {
  const summary = {
    present: 0,
    absent: 0,
    leave: 0,
    holiday: 0,
    total: 0,
  };
  for (const s of statuses) {
    summary[s] += 1;
    summary.total += 1;
  }
  return summary;
};

// GET /api/attendance/my-summary?month=&year=&teacherId=
// Per-student monthly summary for a teacher's roster.
const getMySummary = async (
  actor: IActor,
  monthArg?: number,
  yearArg?: number,
  teacherId?: string,
) => {
  const { teacher } = await resolveTeacherContext(actor, teacherId);
  if (teacher === null) {
    throw httpError(
      'teacherId is required for admin to view a summary',
      400,
    );
  }

  const { month, year } = resolveMonthYear(monthArg, yearArg);
  const { start, end } = monthRangeUTC(month, year);

  const students = await Student.find({ teacherRef: teacher })
    .select('studentId name')
    .sort({ studentId: 1 })
    .lean<{ _id: Types.ObjectId; studentId: string; name: string }[]>();

  const records = await Attendance.find({
    studentRef: { $in: students.map((s) => s._id) },
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

  const rows = students.map((s) => {
    const summary = summarize(statusesByStudent.get(String(s._id)) ?? []);
    return {
      _id: s._id,
      studentId: s.studentId,
      name: s.name,
      ...summary,
    };
  });

  return { month, year, students: rows };
};

// GET /api/attendance/student/:studentId?month=&year=
// One student's monthly record list + summary. Feeds the Phase-9 calendar.
const getStudentMonth = async (
  actor: IActor,
  studentId: string,
  monthArg?: number,
  yearArg?: number,
) => {
  const { teacher } = await resolveTeacherContext(actor);
  // Ownership: scoped actor → must own the student; admin → any student.
  const student = await loadOwnedStudent(studentId, teacher);

  const { month, year } = resolveMonthYear(monthArg, yearArg);
  const { start, end } = monthRangeUTC(month, year);

  const records = await Attendance.find({
    studentRef: student._id,
    date: { $gte: start, $lt: end },
  })
    .select('date status')
    .sort({ date: 1 })
    .lean();

  const recordRows = records.map((r) => ({
    date: formatDateUTC(r.date),
    status: r.status,
  }));

  const summary = summarize(records.map((r) => r.status));

  return {
    studentId: student.studentId,
    month,
    year,
    records: recordRows,
    summary,
  };
};

export const AttendanceService = {
  getMyStudents,
  markOne,
  clearOne,
  markBulk,
  getMySummary,
  getStudentMonth,
};
