import { Types } from 'mongoose';
import { Message } from './message.model';
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

// POST /api/messages — guardian sends a one-way message to their child's teacher.
const createMessage = async (
  actor: IActor,
  payload: { title: string; body: string },
) => {
  const student = await Student.findOne({ userRef: actor.userId })
    .select('_id name teacherRef')
    .lean();
  if (!student) {
    throw httpError('No student is linked to your account.', 404);
  }
  if (!student.teacherRef) {
    throw httpError('No teacher has been assigned to your child yet.', 400);
  }

  const message = await Message.create({
    studentRef: student._id,
    guardianRef: new Types.ObjectId(actor.userId),
    teacherRef: student.teacherRef,
    title: payload.title,
    body: payload.body,
  });

  // Notify the recipient teacher (the bell + sound are handled client-side).
  // Best-effort: a failure here must never fail the send.
  try {
    const teacher = await Teacher.findById(student.teacherRef)
      .select('userRef')
      .lean();
    if (teacher?.userRef) {
      await createNotification({
        userRef: teacher.userRef,
        title: 'নতুন বার্তা',
        message: `${student.name}: ${payload.title}`,
        type: 'general',
        meta: { messageId: message._id },
      });
    }
  } catch (_error) {
    // Swallow — notifying is best-effort.
  }

  return message;
};

// GET /api/messages/my — guardian: their own sent history.
const getMyMessages = async (actor: IActor, query: IListQuery) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 20, 1);
  const skip = (page - 1) * limit;

  const filter = { guardianRef: actor.userId };
  const [data, total] = await Promise.all([
    Message.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Message.countDocuments(filter),
  ]);

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// GET /api/messages/teacher — teacher: messages sent to them.
const getTeacherMessages = async (actor: IActor, query: IListQuery) => {
  const teacher = await Teacher.findOne({ userRef: actor.userId })
    .select('_id')
    .lean();
  if (!teacher) {
    throw httpError('No teacher profile is linked to your account.', 404);
  }

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 20, 1);
  const skip = (page - 1) * limit;

  const filter = { teacherRef: teacher._id };
  const [data, total, unreadCount] = await Promise.all([
    Message.find(filter)
      .populate('studentRef', 'name studentId')
      .populate('guardianRef', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Message.countDocuments(filter),
    Message.countDocuments({ ...filter, read: false }),
  ]);

  return {
    data,
    unreadCount,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// PATCH /api/messages/:id — guardian edits their own message.
const updateMessage = async (
  actor: IActor,
  id: string,
  payload: { title: string; body: string },
) => {
  const updated = await Message.findOneAndUpdate(
    { _id: id, guardianRef: actor.userId },
    { title: payload.title, body: payload.body },
    { new: true, runValidators: true },
  );
  if (!updated) {
    throw httpError('Message not found.', 404);
  }
  return updated;
};

// DELETE /api/messages/:id — guardian deletes their own message.
const deleteMessage = async (actor: IActor, id: string) => {
  const deleted = await Message.findOneAndDelete({
    _id: id,
    guardianRef: actor.userId,
  });
  if (!deleted) {
    throw httpError('Message not found.', 404);
  }
  return deleted;
};

// PATCH /api/messages/:id/read — teacher marks a received message read.
const markRead = async (actor: IActor, id: string) => {
  const teacher = await Teacher.findOne({ userRef: actor.userId })
    .select('_id')
    .lean();
  if (!teacher) {
    throw httpError('No teacher profile is linked to your account.', 404);
  }

  const updated = await Message.findOneAndUpdate(
    { _id: id, teacherRef: teacher._id },
    { read: true },
    { new: true },
  );
  if (!updated) {
    throw httpError('Message not found.', 404);
  }
  return updated;
};

export const MessageService = {
  createMessage,
  getMyMessages,
  getTeacherMessages,
  updateMessage,
  deleteMessage,
  markRead,
};
