import { Schema, model } from 'mongoose';
import { IMessage } from './message.interface';

const messageSchema = new Schema<IMessage>(
  {
    studentRef: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    guardianRef: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teacherRef: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Message = model<IMessage>('Message', messageSchema);
