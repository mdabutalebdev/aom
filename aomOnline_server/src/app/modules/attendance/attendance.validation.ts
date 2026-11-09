import { z } from 'zod';
import { ATTENDANCE_STATUSES } from './attendance.interface';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Teacher/admin — mark one student's attendance for a given day.
// date is optional and defaults to today (server-side).
export const markAttendanceValidationSchema = z.object({
  body: z.object({
    studentId: z
      .string({ required_error: 'studentId is required' })
      .regex(objectIdRegex, 'studentId must be a valid id'),
    date: z
      .string()
      .regex(dateRegex, 'date must be in YYYY-MM-DD format')
      .optional(),
    status: z.enum(ATTENDANCE_STATUSES as [string, ...string[]], {
      required_error: 'status is required',
      invalid_type_error: `status must be one of: ${ATTENDANCE_STATUSES.join(', ')}`,
    }),
    note: z.string().optional(),
  }),
});

// Teacher/admin — mark many students' attendance for a single day.
export const bulkAttendanceValidationSchema = z.object({
  body: z.object({
    date: z
      .string()
      .regex(dateRegex, 'date must be in YYYY-MM-DD format')
      .optional(),
    records: z
      .array(
        z.object({
          studentId: z
            .string({ required_error: 'studentId is required' })
            .regex(objectIdRegex, 'studentId must be a valid id'),
          status: z.enum(ATTENDANCE_STATUSES as [string, ...string[]], {
            required_error: 'status is required',
            invalid_type_error: `status must be one of: ${ATTENDANCE_STATUSES.join(', ')}`,
          }),
          note: z.string().optional(),
        }),
      )
      .min(1, 'records must contain at least one entry'),
  }),
});
