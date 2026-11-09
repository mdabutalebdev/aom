import { Schema, model } from 'mongoose';
import { IStudent, STUDENT_STATUSES } from './student.interface';

const studentSchema = new Schema<IStudent>(
  {
    userRef: { type: Schema.Types.ObjectId, ref: 'User' },
    studentId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    photo: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    teacherRef: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    classRef: { type: Schema.Types.ObjectId, ref: 'Class' },
    groupRef: { type: Schema.Types.ObjectId, ref: 'Group' },
    guardianName: { type: String, trim: true },
    guardianPhone: { type: String, trim: true },
    address: { type: String, trim: true },
    monthlyFee: { type: Number },
    teacherPayoutAmount: { type: Number },
    admissionRef: { type: Schema.Types.ObjectId, ref: 'Admission' },
    status: {
      type: String,
      enum: STUDENT_STATUSES,
      default: 'active',
    },
    enrolledAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export const Student = model<IStudent>('Student', studentSchema);
