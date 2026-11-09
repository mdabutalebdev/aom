import { FilterQuery, Types } from 'mongoose';
import { ClassSchedule, ClassSession } from './schedule.model';
import {
  IClassSchedule,
  TSessionStatus,
  TSlotState,
} from './schedule.interface';
import { Teacher } from '../teacher/teacher.model';
import { ITeacher } from '../teacher/teacher.interface';
import { Student } from '../student/student.model';
import { User } from '../user/user.model';
import {
  normalizeToStartOfDayUTC,
  formatDateUTC,
} from '../attendance/attendance.utils';
import {
  DEFAULT_TIMEZONE,
  ageFromDateOfBirth,
  minutesToTime,
  nowInZone,
  timeToMinutes,
} from './schedule.utils';

export interface IActor {
  userId: string;
  role: string;
  email?: string;
}

const httpError = (message: string, status: number) =>
  Object.assign(new Error(message), { status });

const isAdmin = (role: string) => role === 'admin' || role === 'superAdmin';

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

// Admins may name any teacher; a teacher resolves to their own profile and
// may not read another's timetable.
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
    throw httpError('You can only view your own schedule', 403);
  }
  return own;
};

// Does a recurring slot apply on this calendar day?
const appliesOn = (schedule: IClassSchedule, date: Date): boolean => {
  if (!schedule.isActive) return false;
  if (!schedule.daysOfWeek.includes(date.getUTCDay())) return false;
  if (schedule.startDate && date < normalizeToStartOfDayUTC(schedule.startDate)) {
    return false;
  }
  if (schedule.endDate && date > normalizeToStartOfDayUTC(schedule.endDate)) {
    return false;
  }
  return true;
};

// Merge the template's state with the clock and any stored exception.
const deriveState = (
  startMinutes: number,
  durationMinutes: number,
  exceptionStatus: TSessionStatus | undefined,
  isToday: boolean,
  isPastDay: boolean,
  nowMinutes: number,
): TSlotState => {
  if (exceptionStatus === 'cancelled') return 'cancelled';
  if (exceptionStatus === 'completed') return 'completed';

  // Nothing recorded — fall back to the clock.
  if (isPastDay) return 'ended';
  if (!isToday) return 'upcoming';

  const endMinutes = startMinutes + durationMinutes;
  if (nowMinutes >= endMinutes) return 'ended';
  if (nowMinutes >= startMinutes) return 'ongoing';
  return 'upcoming';
};

interface IStudentLean {
  _id: Types.ObjectId;
  studentId?: string;
  name?: string;
  photo?: string;
  dateOfBirth?: Date;
  guardianName?: string;
  guardianPhone?: string;
}

// GET /api/schedules/day?teacherId=&date= — one teacher's timetable for a day.
const getDaySchedule = async (
  actor: IActor,
  teacherId?: string,
  dateArg?: string,
) => {
  const teacher = await resolveTeacherScope(actor, teacherId);
  const timezone = teacher.timezone || DEFAULT_TIMEZONE;

  const { dateKey: todayKey, minutes: nowMinutes } = nowInZone(timezone);
  const date = normalizeToStartOfDayUTC(dateArg ?? todayKey);
  const dateKey = formatDateUTC(date);

  const isToday = dateKey === todayKey;
  const isPastDay = dateKey < todayKey;

  const schedules = await ClassSchedule.find({ teacherRef: teacher._id }).lean<
    (IClassSchedule & { _id: Types.ObjectId })[]
  >();

  const applicable = schedules.filter((s) => appliesOn(s, date));

  const [students, exceptions, studentCount] = await Promise.all([
    Student.find({ _id: { $in: applicable.map((s) => s.studentRef) } })
      .select('studentId name photo dateOfBirth guardianName guardianPhone')
      .lean<IStudentLean[]>(),
    ClassSession.find({
      scheduleRef: { $in: applicable.map((s) => s._id) },
      date,
    }).lean(),
    Student.countDocuments({ teacherRef: teacher._id }),
  ]);

  const studentById = new Map(students.map((s) => [String(s._id), s]));
  const exceptionBySchedule = new Map(
    exceptions.map((e) => [String(e.scheduleRef), e]),
  );

  const rows = applicable
    .map((s) => {
      const exception = exceptionBySchedule.get(String(s._id));
      const student = studentById.get(String(s.studentRef));

      // A rescheduled session overrides the template's time for this day only.
      const startTime = exception?.startTime || s.startTime;
      const startMinutes = timeToMinutes(startTime);
      const duration = s.durationMinutes ?? 30;

      return {
        scheduleId: s._id,
        sessionId: exception?._id ?? null,
        studentRef: s.studentRef,
        studentId: student?.studentId ?? '',
        studentName: student?.name ?? 'Unknown student',
        studentPhoto: student?.photo ?? '',
        studentAge: ageFromDateOfBirth(student?.dateOfBirth),
        guardianName: student?.guardianName ?? '',
        guardianPhone: student?.guardianPhone ?? '',
        subject: s.subject ?? '',
        startTime,
        endTime: minutesToTime(startMinutes + duration),
        durationMinutes: duration,
        meetingLink: s.meetingLink || teacher.zoomLink || '',
        isRescheduled: Boolean(exception?.startTime),
        note: exception?.note ?? '',
        state: deriveState(
          startMinutes,
          duration,
          exception?.status as TSessionStatus | undefined,
          isToday,
          isPastDay,
          nowMinutes,
        ),
        startMinutes,
      };
    })
    .sort((a, b) => a.startMinutes - b.startMinutes);

  return {
    teacher: {
      _id: teacher._id,
      teacherId: teacher.teacherId,
      name: teacher.userRef?.name ?? '',
      email: teacher.userRef?.email ?? '',
      phone: teacher.phone || teacher.userRef?.phone || '',
      photo: teacher.userRef?.photo || teacher.photo || '',
      designation: teacher.designation ?? '',
      subject: teacher.subject ?? '',
      zoomLink: teacher.zoomLink ?? '',
      timezone,
      studentCount,
    },
    date: dateKey,
    isToday,
    todayClassCount: rows.length,
    rows,
  };
};

interface ITeacherListQuery {
  search?: string;
  date?: string;
}

// GET /api/schedules/teachers — admin: the Upcoming Class index. Each teacher
// with their class count for the day, their next class, and how many are
// running right now — plus a madrasa-wide summary for the stat cards.
const getTeacherList = async (query: ITeacherListQuery) => {
  const search = (query.search ?? '').trim();

  const filter: FilterQuery<ITeacher> = {};
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const matchedUsers = await User.find({ $or: [{ name: rx }, { email: rx }] })
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

  const teacherIds = teachers.map((t) => t._id);

  const schedules = await ClassSchedule.find({
    teacherRef: { $in: teacherIds },
    isActive: true,
  }).lean<(IClassSchedule & { _id: Types.ObjectId })[]>();

  // Cancelled/completed marks must not count toward "live" or "next class",
  // so the day's exceptions are needed here too.
  const exceptionDates = new Set<string>();
  const perTeacherDate = new Map<string, Date>();
  for (const t of teachers) {
    const tz = t.timezone || DEFAULT_TIMEZONE;
    const { dateKey } = nowInZone(tz);
    const date = normalizeToStartOfDayUTC(query.date ?? dateKey);
    perTeacherDate.set(String(t._id), date);
    exceptionDates.add(date.toISOString());
  }

  const exceptions = await ClassSession.find({
    teacherRef: { $in: teacherIds },
    date: { $in: [...exceptionDates].map((d) => new Date(d)) },
  }).lean();

  const exceptionByKey = new Map(
    exceptions.map((e) => [
      `${String(e.scheduleRef)}|${e.date.toISOString()}`,
      e,
    ]),
  );

  const studentCounts = await Promise.all(
    teacherIds.map((id) => Student.countDocuments({ teacherRef: id })),
  );

  const rows = teachers.map((t, i) => {
    const timezone = t.timezone || DEFAULT_TIMEZONE;
    const { dateKey: todayKey, minutes: nowMinutes } = nowInZone(timezone);
    const date = perTeacherDate.get(String(t._id))!;
    const dateKey = formatDateUTC(date);
    const isToday = dateKey === todayKey;
    const isPastDay = dateKey < todayKey;

    const mine = schedules.filter(
      (s) => String(s.teacherRef) === String(t._id),
    );
    const todays = mine.filter((s) => appliesOn(s, date));

    const slots = todays
      .map((s) => {
        const exception = exceptionByKey.get(
          `${String(s._id)}|${date.toISOString()}`,
        );
        const startTime = exception?.startTime || s.startTime;
        const startMinutes = timeToMinutes(startTime);
        return {
          startTime,
          startMinutes,
          state: deriveState(
            startMinutes,
            s.durationMinutes ?? 30,
            exception?.status as TSessionStatus | undefined,
            isToday,
            isPastDay,
            nowMinutes,
          ),
        };
      })
      .sort((a, b) => a.startMinutes - b.startMinutes);

    const next = slots.find((s) => s.state === 'upcoming');
    const liveCount = slots.filter((s) => s.state === 'ongoing').length;

    return {
      _id: t._id,
      teacherId: t.teacherId,
      name: t.userRef?.name ?? '',
      email: t.userRef?.email ?? '',
      photo: t.userRef?.photo || t.photo || '',
      designation: t.designation ?? '',
      subject: t.subject ?? '',
      phone: t.phone || t.userRef?.phone || '',
      zoomLink: t.zoomLink ?? '',
      timezone,
      isActive: t.isActive,
      studentCount: studentCounts[i],
      weeklyClassCount: mine.reduce((sum, s) => sum + s.daysOfWeek.length, 0),
      dayClassCount: todays.length,
      liveCount,
      nextClassTime: next?.startTime ?? null,
      // Only meaningful for today — a future date has no "minutes from now".
      nextClassInMinutes:
        next && isToday ? next.startMinutes - nowMinutes : null,
    };
  });

  // Earliest upcoming class across everyone. Teachers can sit in different
  // zones, so compare by minutes-from-now rather than by wall-clock time.
  const withNext = rows.filter(
    (r) => r.nextClassInMinutes !== null && r.nextClassInMinutes >= 0,
  );
  const soonest = withNext.sort(
    (a, b) => (a.nextClassInMinutes ?? 0) - (b.nextClassInMinutes ?? 0),
  )[0];

  return {
    data: rows,
    summary: {
      totalTeachers: rows.length,
      activeTeachers: rows.filter((r) => r.isActive).length,
      todayClasses: rows.reduce((sum, r) => sum + r.dayClassCount, 0),
      liveClasses: rows.reduce((sum, r) => sum + r.liveCount, 0),
      nextClassTime: soonest?.nextClassTime ?? null,
      nextClassInMinutes: soonest?.nextClassInMinutes ?? null,
      nextClassTeacher: soonest?.name ?? '',
    },
  };
};

interface IScheduleInput {
  studentId: string;
  daysOfWeek: number[];
  startTime: string;
  durationMinutes?: number;
  subject?: string;
  meetingLink?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

// POST /api/schedules — admin: add a weekly slot for a student.
// The teacher is taken from the student's current assignment rather than the
// request, so a slot can never be filed under a teacher who doesn't teach them.
const createSchedule = async (actor: IActor, input: IScheduleInput) => {
  if (!Types.ObjectId.isValid(input.studentId)) {
    throw httpError('Invalid student id', 400);
  }

  const student = await Student.findById(input.studentId)
    .select('teacherRef name')
    .lean();
  if (!student) throw httpError('Student not found', 404);
  if (!student.teacherRef) {
    throw httpError(
      'Assign a teacher to this student before scheduling classes',
      400,
    );
  }

  const schedule = await ClassSchedule.create({
    studentRef: student._id,
    teacherRef: student.teacherRef,
    daysOfWeek: input.daysOfWeek,
    startTime: input.startTime,
    durationMinutes: input.durationMinutes ?? 30,
    subject: input.subject,
    meetingLink: input.meetingLink,
    startDate: input.startDate ? new Date(input.startDate) : undefined,
    endDate: input.endDate ? new Date(input.endDate) : undefined,
    isActive: input.isActive ?? true,
  });

  return { schedule };
};

// PATCH /api/schedules/:id — admin: edit a weekly slot.
const updateSchedule = async (
  actor: IActor,
  id: string,
  input: Partial<IScheduleInput>,
) => {
  if (!Types.ObjectId.isValid(id)) throw httpError('Invalid schedule id', 400);

  const schedule = await ClassSchedule.findById(id);
  if (!schedule) throw httpError('Schedule not found', 404);

  if (input.daysOfWeek !== undefined) schedule.daysOfWeek = input.daysOfWeek;
  if (input.startTime !== undefined) schedule.startTime = input.startTime;
  if (input.durationMinutes !== undefined) {
    schedule.durationMinutes = input.durationMinutes;
  }
  if (input.subject !== undefined) schedule.subject = input.subject;
  if (input.meetingLink !== undefined) schedule.meetingLink = input.meetingLink;
  if (input.isActive !== undefined) schedule.isActive = input.isActive;
  if (input.startDate !== undefined) {
    schedule.startDate = input.startDate ? new Date(input.startDate) : undefined;
  }
  if (input.endDate !== undefined) {
    schedule.endDate = input.endDate ? new Date(input.endDate) : undefined;
  }

  // Keep the denormalized teacher in step with the student's current
  // assignment, otherwise a reassigned student's slot stays on the old
  // teacher's timetable.
  const student = await Student.findById(schedule.studentRef)
    .select('teacherRef')
    .lean();
  if (student?.teacherRef) schedule.teacherRef = student.teacherRef;

  await schedule.save();
  return { schedule };
};

// DELETE /api/schedules/:id — admin: remove a weekly slot and its exceptions.
const deleteSchedule = async (actor: IActor, id: string) => {
  if (!Types.ObjectId.isValid(id)) throw httpError('Invalid schedule id', 400);

  const schedule = await ClassSchedule.findByIdAndDelete(id);
  if (!schedule) throw httpError('Schedule not found', 404);

  // Exceptions reference a slot that no longer exists — drop them too.
  await ClassSession.deleteMany({ scheduleRef: schedule._id });

  return { deleted: true };
};

// GET /api/schedules/student/:studentId — every weekly slot for one student.
const getStudentSchedules = async (studentId: string) => {
  if (!Types.ObjectId.isValid(studentId)) {
    throw httpError('Invalid student id', 400);
  }
  const schedules = await ClassSchedule.find({ studentRef: studentId })
    .sort({ startTime: 1 })
    .lean();
  return { data: schedules };
};

// GET /api/schedules/my — the logged-in guardian/student's own weekly routine.
const getMyStudentSchedule = async (actor: IActor) => {
  const student = await Student.findOne({ userRef: actor.userId })
    .select('_id name')
    .lean();
  if (!student) {
    throw httpError('No student is linked to your account', 404);
  }
  const schedules = await ClassSchedule.find({
    studentRef: student._id,
    isActive: true,
  })
    .populate({
      path: 'teacherRef',
      select: 'userRef',
      populate: { path: 'userRef', select: 'name' },
    })
    .sort({ startTime: 1 })
    .lean();
  return { student: { name: student.name }, data: schedules };
};

// GET /api/schedules/my-week (teacher, own) and /week/:teacherId (admin) —
// a teacher's full weekly recurring routine: every active slot with the
// student it belongs to. The client groups these into a Sun–Sat grid.
const getWeeklyRoutine = async (actor: IActor, teacherId?: string) => {
  const teacher = await resolveTeacherScope(actor, teacherId);

  const schedules = await ClassSchedule.find({
    teacherRef: teacher._id,
    isActive: true,
  })
    .sort({ startTime: 1 })
    .lean<(IClassSchedule & { _id: Types.ObjectId })[]>();

  const students = await Student.find({
    _id: { $in: schedules.map((s) => s.studentRef) },
  })
    .select('studentId name')
    .lean<IStudentLean[]>();
  const studentById = new Map(students.map((s) => [String(s._id), s]));

  const data = schedules.map((s) => {
    const student = studentById.get(String(s.studentRef));
    const duration = s.durationMinutes ?? 30;
    return {
      _id: s._id,
      daysOfWeek: s.daysOfWeek,
      startTime: s.startTime,
      endTime: minutesToTime(timeToMinutes(s.startTime) + duration),
      durationMinutes: duration,
      subject: s.subject ?? '',
      meetingLink: s.meetingLink || teacher.zoomLink || '',
      studentId: student?.studentId ?? '',
      studentName: student?.name ?? 'Unknown student',
    };
  });

  return {
    teacher: {
      _id: teacher._id,
      teacherId: teacher.teacherId,
      name: teacher.userRef?.name ?? '',
      subject: teacher.subject ?? '',
      timezone: teacher.timezone || DEFAULT_TIMEZONE,
    },
    data,
  };
};

interface IMarkInput {
  scheduleId: string;
  date: string;
  status: TSessionStatus;
  startTime?: string;
  note?: string;
}

// PATCH /api/schedules/session — mark one dated occurrence completed,
// cancelled or rescheduled. Upserts so re-marking updates rather than stacks.
const markSession = async (actor: IActor, input: IMarkInput) => {
  if (!Types.ObjectId.isValid(input.scheduleId)) {
    throw httpError('Invalid schedule id', 400);
  }

  const schedule = await ClassSchedule.findById(input.scheduleId).lean();
  if (!schedule) throw httpError('Schedule not found', 404);

  // A teacher may only mark their own classes.
  if (!isAdmin(actor.role)) {
    const own = await Teacher.findOne({ userRef: actor.userId })
      .select('_id')
      .lean();
    if (!own || String(own._id) !== String(schedule.teacherRef)) {
      throw httpError('You can only update your own classes', 403);
    }
  }

  if (input.status === 'rescheduled' && !input.startTime) {
    throw httpError('A new start time is required to reschedule', 400);
  }

  const date = normalizeToStartOfDayUTC(input.date);

  const session = await ClassSession.findOneAndUpdate(
    { scheduleRef: schedule._id, date },
    {
      scheduleRef: schedule._id,
      studentRef: schedule.studentRef,
      teacherRef: schedule.teacherRef,
      date,
      status: input.status,
      startTime: input.status === 'rescheduled' ? input.startTime : undefined,
      note: input.note,
      markedBy: new Types.ObjectId(actor.userId),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return { session };
};

// DELETE /api/schedules/session/:id — undo a mark, returning the day to
// whatever the template + clock imply.
const clearSession = async (actor: IActor, id: string) => {
  if (!Types.ObjectId.isValid(id)) throw httpError('Invalid session id', 400);

  const session = await ClassSession.findById(id);
  if (!session) throw httpError('Session record not found', 404);

  if (!isAdmin(actor.role)) {
    const own = await Teacher.findOne({ userRef: actor.userId })
      .select('_id')
      .lean();
    if (!own || String(own._id) !== String(session.teacherRef)) {
      throw httpError('You can only update your own classes', 403);
    }
  }

  await session.deleteOne();
  return { cleared: true };
};

export const ScheduleService = {
  getDaySchedule,
  getTeacherList,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getStudentSchedules,
  getMyStudentSchedule,
  getWeeklyRoutine,
  markSession,
  clearSession,
};
