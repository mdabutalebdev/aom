import { Schema, model } from 'mongoose';
import { INotification, NOTIFICATION_TYPES } from './notification.interface';

const notificationSchema = new Schema<INotification>(
  {
    userRef: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: 'general',
    },
    read: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  },
);

// Fast lookup of a user's notifications, newest first.
notificationSchema.index({ userRef: 1, createdAt: -1 });

export const Notification = model<INotification>(
  'Notification',
  notificationSchema,
);
