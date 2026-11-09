import { Schema, model } from 'mongoose';
import { ITeacherApplication } from './teacherApplication.interface';

const teacherApplicationSchema = new Schema<ITeacherApplication>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    cvUrl: { type: String, required: true },
    mediaUrl: { type: String, required: true },
    coverLetter: { type: String },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  },
);

export const TeacherApplication = model<ITeacherApplication>(
  'TeacherApplication',
  teacherApplicationSchema,
);
