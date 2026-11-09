import { z } from 'zod';
import { SESSION_STATUSES } from './schedule.interface';

const timeField = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:mm (24-hour)');

const daysField = z
  .array(z.number().int().min(0, 'Day must be 0-6').max(6, 'Day must be 0-6'))
  .min(1, 'Pick at least one weekday');

// Admin — create a weekly class slot for a student.
export const createScheduleValidationSchema = z.object({
  body: z.object({
    studentId: z
      .string({ required_error: 'studentId is required' })
      .min(1, 'studentId is required'),
    daysOfWeek: daysField,
    startTime: timeField,
    durationMinutes: z.number().int().min(5).max(480).optional(),
    subject: z.string().optional(),
    meetingLink: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

// Admin — edit a weekly class slot.
export const updateScheduleValidationSchema = z.object({
  body: z
    .object({
      daysOfWeek: daysField.optional(),
      startTime: timeField.optional(),
      durationMinutes: z.number().int().min(5).max(480).optional(),
      subject: z.string().optional(),
      meetingLink: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided to update',
    }),
});

// Admin/Teacher — mark one dated occurrence.
export const markSessionValidationSchema = z.object({
  body: z
    .object({
      scheduleId: z
        .string({ required_error: 'scheduleId is required' })
        .min(1, 'scheduleId is required'),
      date: z
        .string({ required_error: 'date is required' })
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
      status: z.enum(SESSION_STATUSES as [string, ...string[]], {
        required_error: 'status is required',
        invalid_type_error: `Status must be one of: ${SESSION_STATUSES.join(', ')}`,
      }),
      startTime: timeField.optional(),
      note: z.string().optional(),
    })
    .refine(
      (data) => data.status !== 'rescheduled' || Boolean(data.startTime),
      { message: 'A new start time is required to reschedule' },
    ),
});
