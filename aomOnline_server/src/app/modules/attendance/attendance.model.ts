import { Schema, model } from 'mongoose';
import { IAttendance, ATTENDANCE_STATUSES } from './attendance.interface';

const attendanceSchema = new Schema<IAttendance>(
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
    // Always stored normalized to start-of-day UTC (see attendance.utils.ts).
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ATTENDANCE_STATUSES,
      required: true,
    },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    note: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
);

// One attendance record per student per day.
attendanceSchema.index({ studentRef: 1, date: 1 }, { unique: true });

export const Attendance = model<IAttendance>('Attendance', attendanceSchema);
