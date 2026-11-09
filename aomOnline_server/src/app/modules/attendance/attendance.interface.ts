import { Types } from 'mongoose';

export type TAttendanceStatus = 'present' | 'absent' | 'leave' | 'holiday';

export const ATTENDANCE_STATUSES: TAttendanceStatus[] = [
  'present',
  'absent',
  'leave',
  'holiday',
];

export interface IAttendance {
  studentRef: Types.ObjectId; // ref Student — required
  teacherRef: Types.ObjectId; // ref Teacher — required (the student's teacher at mark time)
  date: Date; // normalized to start-of-day UTC
  status: TAttendanceStatus; // 'present' | 'absent' | 'leave' | 'holiday' — required
  markedBy?: Types.ObjectId; // ref User — the acting user (req.user.userId)
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
