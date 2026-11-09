import { Types } from 'mongoose';

export type TAdmissionStatus = 'pending' | 'approved' | 'rejected';

export const ADMISSION_STATUSES: TAdmissionStatus[] = [
  'pending',
  'approved',
  'rejected',
];

export interface IAdmission {
  studentName: string;
  guardianName: string;
  guardianPhone: string;
  email: string;
  address: string;
  desiredClass: string;
  preferredTeacherGender?: string; // 'male' | 'female'
  preferredTeachingLanguage?: string; // 'bengali' | 'english' | 'both'
  classTime?: string; // preferred class time (HH:mm) in the guardian's own timezone
  guardianProfession?: string; // the guardian's occupation
  guardianTimezone?: string; // IANA zone the classTime was entered in, e.g. 'America/New_York'
  dateOfBirth?: Date;
  previousEducation?: string;
  photo?: string;
  note?: string;
  status: TAdmissionStatus;
  rejectionReason?: string;
  // Set on approve — links this admission to the auto-created student User account.
  userId?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
