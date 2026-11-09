import { Types } from 'mongoose';

// The madrasa runs 1-to-1 classes on a fixed weekly rhythm, so a schedule is
// stored as a recurring TEMPLATE rather than one row per occurrence. A day's
// timetable is derived on read; only deviations from the template are
// persisted (see IClassSession below).
//
// The alternative — materialising every future session — would need a
// generation job, and editing a student's slot would leave stale rows behind.

export interface IClassSchedule {
  studentRef: Types.ObjectId; // ref Student — required
  teacherRef: Types.ObjectId; // ref Teacher — required
  // 0 = Sunday … 6 = Saturday. A student meeting three times a week has three
  // entries here, all sharing this record's startTime.
  daysOfWeek: number[];
  startTime: string; // 'HH:mm', 24-hour, in the teacher's timezone
  durationMinutes: number; // default 30
  subject?: string; // e.g. 'Hifz (Surah Yaseen)' — what this slot covers
  meetingLink?: string; // per-slot Zoom link; falls back to the teacher's room
  isActive: boolean;
  startDate?: Date; // slot not shown before this day
  endDate?: Date; // slot not shown after this day
  createdAt?: Date;
  updatedAt?: Date;
}

export type TSessionStatus = 'completed' | 'cancelled' | 'rescheduled';

export const SESSION_STATUSES: TSessionStatus[] = [
  'completed',
  'cancelled',
  'rescheduled',
];

// A single dated deviation from the recurring template. Rows only exist when
// something actually differs — a class that ran as planned stores nothing.
export interface IClassSession {
  scheduleRef: Types.ObjectId; // ref ClassSchedule — required
  studentRef: Types.ObjectId; // ref Student — denormalized for direct lookups
  teacherRef: Types.ObjectId; // ref Teacher — denormalized for direct lookups
  date: Date; // start-of-day UTC — the calendar day this applies to
  status: TSessionStatus;
  startTime?: string; // 'HH:mm' — set when status is 'rescheduled'
  note?: string;
  markedBy?: Types.ObjectId; // ref User
  createdAt?: Date;
  updatedAt?: Date;
}

// A slot's computed state on a given day, once the template and any exception
// have been merged.
//
// 'completed' means someone actually marked it done. A slot whose time has
// simply passed with no record is 'ended' — the system has no idea whether it
// ran, and claiming otherwise would put unearned confidence on the screen.
export type TSlotState =
  | 'completed'
  | 'cancelled'
  | 'ongoing'
  | 'upcoming'
  | 'ended';
