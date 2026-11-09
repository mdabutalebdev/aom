import { Schema, model } from 'mongoose';
import { IAdmission, ADMISSION_STATUSES } from './admission.interface';

const admissionSchema = new Schema<IAdmission>(
  {
    studentName: { type: String, required: true, trim: true },
    guardianName: { type: String, required: true, trim: true },
    guardianPhone: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    address: { type: String, required: true, trim: true },
    desiredClass: { type: String, required: true, trim: true },
    preferredTeacherGender: { type: String, trim: true },
    preferredTeachingLanguage: { type: String, trim: true },
    classTime: { type: String, trim: true },
    guardianProfession: { type: String, trim: true },
    guardianTimezone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    previousEducation: { type: String, trim: true },
    photo: { type: String, trim: true },
    note: { type: String, trim: true },
    status: {
      type: String,
      enum: ADMISSION_STATUSES,
      default: 'pending',
    },
    rejectionReason: { type: String, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  },
);

export const Admission = model<IAdmission>('Admission', admissionSchema);
