import { Schema, model } from 'mongoose';
import { ICertificate } from './certificate.interface';

const certificateSchema = new Schema<ICertificate>(
  {
    studentRef: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    // Optional display overrides for manually created certificates.
    studentName: { type: String, trim: true },
    courseName: { type: String, trim: true },
    // Uploaded certificate image — when set, it IS the certificate.
    imageUrl: { type: String, trim: true },
    classRef: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
    },
    teacherRef: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Certificate = model<ICertificate>('Certificate', certificateSchema);
