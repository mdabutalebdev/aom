import { Types } from 'mongoose';

export type TStudentStatus = 'active' | 'inactive';

export const STUDENT_STATUSES: TStudentStatus[] = ['active', 'inactive'];

export interface IStudent {
  userRef?: Types.ObjectId; // ref User — OPTIONAL (profile-only students have none)
  studentId: string; // auto 'AOM' + year + 3-digit seq → AOM2026001, unique
  name: string;
  photo?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date; // age on the class timetable is derived from this

  teacherRef?: Types.ObjectId; // ref Teacher
  classRef?: Types.ObjectId; // ref Class
  groupRef?: Types.ObjectId; // ref Group — set ONLY for group-class students; single students leave it empty
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  monthlyFee?: number; // BDT — derived from classRef.monthlyFee at assign, overridable
  teacherPayoutAmount?: number; // BDT — what the assigned teacher earns for THIS student, set by admin at assign time. Independent of monthlyFee.
  admissionRef?: Types.ObjectId; // ref Admission
  status: TStudentStatus;
  enrolledAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
