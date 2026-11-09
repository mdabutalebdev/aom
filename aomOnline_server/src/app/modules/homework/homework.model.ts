import { Schema, model } from 'mongoose';
import { IHomework } from './homework.interface';

const homeworkSchema = new Schema<IHomework>(
  {
    studentRef: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    teacherRef: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    guardianRef: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Homework = model<IHomework>('Homework', homeworkSchema);
