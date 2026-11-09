import { Types } from 'mongoose';
import { Notification } from './notification.model';
import { TNotificationType } from './notification.interface';
import { User } from '../user/user.model';
import { sendEmail, sendWhatsapp } from '../../utils/notifyChannels';

// The subset of req.user the service needs to resolve the actor.
export interface IActor {
  userId: string;
  role: string;
  email?: string;
}

const httpError = (message: string, status: number) =>
  Object.assign(new Error(message), { status });

// Internal-use factory: create a notification for a user. Called by other
// modules (e.g. progress milestone hook) as well as any future producers.
export const createNotification = async (payload: {
  userRef: Types.ObjectId | string;
  title: string;
  message: string;
  type?: TNotificationType;
  meta?: unknown;
}) => {
  return Notification.create({
    userRef: payload.userRef,
    title: payload.title,
    message: payload.message,
    type: payload.type ?? 'general',
    ...(payload.meta !== undefined ? { meta: payload.meta } : {}),
  });
};

// GET /api/notifications?page=&limit=
// Returns only the actor's own notifications (newest first) + unread count.
const getMyNotifications = async (
  actor: IActor,
  pageArg?: number,
  limitArg?: number,
) => {
  const page = Math.max(Number(pageArg) || 1, 1);
  const limit = Math.max(Number(limitArg) || 20, 1);
  const skip = (page - 1) * limit;

  const filter = { userRef: actor.userId };

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, read: false }),
  ]);

  return {
    data: { notifications, unreadCount },
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// PATCH /api/notifications/:id/read — owner only.
const markAsRead = async (actor: IActor, id: string) => {
  const notification = await Notification.findById(id);
  if (!notification) {
    throw httpError('Notification not found', 404);
  }
  if (String(notification.userRef) !== String(actor.userId)) {
    throw httpError('Forbidden: this notification is not yours', 403);
  }

  notification.read = true;
  await notification.save();
  return notification;
};

// PATCH /api/notifications/read-all — mark all of the actor's as read.
const markAllAsRead = async (actor: IActor) => {
  const result = await Notification.updateMany(
    { userRef: actor.userId, read: false },
    { $set: { read: true } },
  );
  return { modified: result.modifiedCount };
};

// POST /api/notifications/broadcast — admin: send one notification to ALL
// active guardians, or a specific selected subset. In-app delivery is a
// single bulk insertMany (not a per-recipient loop). Also fires the
// email/WhatsApp stub channels per recipient (notifyChannels.ts — currently
// logs only until real SMTP/WhatsApp credentials are provided).
const broadcastNotification = async (payload: {
  recipientIds?: string[] | 'all';
  title: string;
  message: string;
}) => {
  const query =
    !payload.recipientIds || payload.recipientIds === 'all'
      ? { role: 'parent', isActive: true }
      : { _id: { $in: payload.recipientIds }, role: 'parent' };

  const recipients = await User.find(query).select('_id email phone').lean();
  if (recipients.length === 0) {
    throw httpError('No matching guardians found to notify', 400);
  }

  await Notification.insertMany(
    recipients.map((r) => ({
      userRef: r._id,
      title: payload.title,
      message: payload.message,
      type: 'general' as TNotificationType,
    })),
  );

  // Best-effort external channels — never block/fail the broadcast on these.
  await Promise.all(
    recipients.map(async (r) => {
      if (r.email) await sendEmail(r.email, payload.title, payload.message);
      if (r.phone) await sendWhatsapp(r.phone, payload.message);
    }),
  );

  return { recipientCount: recipients.length };
};

export const NotificationService = {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  broadcastNotification,
};
