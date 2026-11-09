import { Types } from 'mongoose';
import { Homework } from './homework.model';
import { Student } from '../student/student.model';
import { Teacher } from '../teacher/teacher.model';
import { createNotification } from '../notification/notification.service';

export interface IActor {
  userId: string;
  role: string;
}

interface IListQuery {
  page?: string;
  limit?: string;
}

const httpError = (message: string, status: number) =>
  Object.assign(new Error(message), { status });

// Resolve the Teacher document for the acting teacher user.
const resolveTeacher = async (actor: IActor) => {
  const teacher = await Teacher.findOne({ userRef: actor.userId })
    .select('_id')
    .lean();
  if (!teacher) {
    throw httpError('No teacher profile is linked to your account.', 404);
  }
  return teacher;
};

// POST /api/homework — teacher sends one-way homework to a student's guardian.
const createHomework = async (
  actor: IActor,
  payload: { studentId: string; title: string; body: string },
) => {
  const teacher = await resolveTeacher(actor);

  // The student must belong to this teacher.
  const student = await Student.findOne({
    _id: payload.studentId,
    teacherRef: teacher._id,
  })
    .select('_id name userRef')
    .lean();
  if (!student) {
    throw httpError('This student is not on your roster.', 404);
  }
  if (!student.userRef) {
    throw httpError(
      'This student has no linked guardian account yet, so homework cannot be delivered.',
      400,
    );
  }

  const homework = await Homework.create({
    studentRef: student._id,
    teacherRef: teacher._id,
    guardianRef: student.userRef,
    title: payload.title,
    body: payload.body,
  });

  // Notify the recipient guardian (the bell + sound are handled client-side).
  // Best-effort: a failure here must never fail the send.
  try {
    await createNotification({
      userRef: student.userRef,
      title: 'নতুন হোমওয়ার্ক',
      message: `${student.name}: ${payload.title}`,
      type: 'general',
      meta: { homeworkId: homework._id },
    });
  } catch (_error) {
    // Swallow — notifying is best-effort.
  }

  return homework;
};

// GET /api/homework/teacher — teacher: their own sent homework history.
const getTeacherHomework = async (actor: IActor, query: IListQuery) => {
  const teacher = await resolveTeacher(actor);

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 20, 1);
  const skip = (page - 1) * limit;

  const filter = { teacherRef: teacher._id };
  const [data, total] = await Promise.all([
    Homework.find(filter)
      .populate('studentRef', 'name studentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Homework.countDocuments(filter),
  ]);

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// GET /api/homework/my — guardian: homework sent to them (read-only inbox).
const getMyHomework = async (actor: IActor, query: IListQuery) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 20, 1);
  const skip = (page - 1) * limit;

  const filter = { guardianRef: actor.userId };
  const [data, total, unreadCount] = await Promise.all([
    Homework.find(filter)
      .populate('studentRef', 'name studentId')
      // Teacher's display name lives on the linked User, so populate through it.
      .populate({ path: 'teacherRef', select: 'userRef', populate: { path: 'userRef', select: 'name' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Homework.countDocuments(filter),
    Homework.countDocuments({ ...filter, read: false }),
  ]);

  return {
    data,
    unreadCount,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// PATCH /api/homework/:id — teacher edits one of their own homework entries.
const updateHomework = async (
  actor: IActor,
  id: string,
  payload: { title: string; body: string },
) => {
  const teacher = await resolveTeacher(actor);
  const updated = await Homework.findOneAndUpdate(
    { _id: id, teacherRef: teacher._id },
    { title: payload.title, body: payload.body },
    { new: true, runValidators: true },
  );
  if (!updated) {
    throw httpError('Homework not found.', 404);
  }
  return updated;
};

// DELETE /api/homework/:id — teacher deletes one of their own homework entries.
const deleteHomework = async (actor: IActor, id: string) => {
  const teacher = await resolveTeacher(actor);
  const deleted = await Homework.findOneAndDelete({
    _id: id,
    teacherRef: teacher._id,
  });
  if (!deleted) {
    throw httpError('Homework not found.', 404);
  }
  return deleted;
};

// PATCH /api/homework/:id/read — guardian marks a received homework read.
const markRead = async (actor: IActor, id: string) => {
  const updated = await Homework.findOneAndUpdate(
    { _id: id, guardianRef: actor.userId },
    { read: true },
    { new: true },
  );
  if (!updated) {
    throw httpError('Homework not found.', 404);
  }
  return updated;
};

export const HomeworkService = {
  createHomework,
  getTeacherHomework,
  getMyHomework,
  updateHomework,
  deleteHomework,
  markRead,
};
