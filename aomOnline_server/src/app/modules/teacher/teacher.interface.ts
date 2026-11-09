import { Types } from 'mongoose';

export interface ITeacher {
  userRef: Types.ObjectId; // ref User — required, unique. Name/email come from here.
  teacherId: string; // auto 'TCH-001', unique
  photo?: string;
  subject?: string; // e.g. 'Quran' — what they teach
  designation?: string; // e.g. 'Quran Teacher' — job title shown on salary screens
  ratePerStudent: number; // BDT — fallback payout when a student has no
  // teacherPayoutAmount of its own; see teacher.utils.ts
  phone?: string; // also used for the WhatsApp link on the class timetable
  address?: string;
  bio?: string;
  zoomLink?: string; // personal meeting room, joined from the timetable header
  timezone?: string; // IANA zone the schedule times are written in
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // NOTE: `assignedStudents` is DERIVED (counted from Student.teacherRef), not stored.
}
