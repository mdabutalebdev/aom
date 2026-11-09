import { Types } from 'mongoose';

export interface ICertificate {
  studentRef: Types.ObjectId;
  // Display overrides — set when an admin creates a certificate manually and
  // wants a custom name / achievement text instead of the linked records.
  studentName?: string;
  courseName?: string;
  // A ready-made certificate image the admin uploads (designed externally).
  // When present, this image IS the certificate — the built-in template is
  // only used as a fallback for older records that have no image.
  imageUrl?: string;
  // classRef/teacherRef are optional: auto-issued certs set them, but a
  // manually created (dynamic) certificate may rely on courseName instead.
  classRef?: Types.ObjectId;
  teacherRef?: Types.ObjectId;
  issuedAt: Date;
  certificateNumber: string;
}
