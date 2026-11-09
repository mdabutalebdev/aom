import { Schema, model } from 'mongoose';
import { ITeacher } from './teacher.interface';

const teacherSchema = new Schema<ITeacher>(
  {
    userRef: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    teacherId: { type: String, required: true, unique: true, trim: true },
    photo: { type: String, trim: true },
    subject: { type: String, trim: true },
    designation: { type: String, trim: true },
    ratePerStudent: { type: Number, required: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    bio: { type: String, trim: true },
    zoomLink: { type: String, trim: true },
    timezone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

export const Teacher = model<ITeacher>('Teacher', teacherSchema);
