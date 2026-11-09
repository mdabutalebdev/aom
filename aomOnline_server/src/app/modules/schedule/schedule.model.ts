import { Schema, model } from 'mongoose';
import {
  IClassSchedule,
  IClassSession,
  SESSION_STATUSES,
} from './schedule.interface';

const classScheduleSchema = new Schema<IClassSchedule>(
  {
    studentRef: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    teacherRef: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    daysOfWeek: {
      type: [Number],
      required: true,
      validate: {
        validator: (days: number[]) =>
          days.length > 0 &&
          days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6),
        message: 'Pick at least one weekday (0 = Sunday … 6 = Saturday)',
      },
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be HH:mm (24-hour)'],
    },
    durationMinutes: { type: Number, default: 30, min: 5, max: 480 },
    subject: { type: String, trim: true },
    meetingLink: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true },
);

// Building a day's timetable queries by teacher; the student view queries by
// student. Both are hot paths on the Upcoming Class screens.
classScheduleSchema.index({ teacherRef: 1, isActive: 1 });
classScheduleSchema.index({ studentRef: 1, isActive: 1 });

export const ClassSchedule = model<IClassSchedule>(
  'ClassSchedule',
  classScheduleSchema,
);

const classSessionSchema = new Schema<IClassSession>(
  {
    scheduleRef: {
      type: Schema.Types.ObjectId,
      ref: 'ClassSchedule',
      required: true,
    },
    studentRef: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    teacherRef: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    date: { type: Date, required: true },
    status: { type: String, enum: SESSION_STATUSES, required: true },
    startTime: {
      type: String,
      trim: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be HH:mm (24-hour)'],
    },
    note: { type: String, trim: true },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

// One deviation per slot per day — marking a class complete twice updates the
// same row instead of stacking duplicates.
classSessionSchema.index({ scheduleRef: 1, date: 1 }, { unique: true });
classSessionSchema.index({ teacherRef: 1, date: 1 });

export const ClassSession = model<IClassSession>(
  'ClassSession',
  classSessionSchema,
);
