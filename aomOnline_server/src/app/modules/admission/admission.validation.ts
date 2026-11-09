import { z } from 'zod';

// PUBLIC — a prospective student/guardian submits an admission application.
export const createAdmissionValidationSchema = z.object({
  body: z.object({
    studentName: z
      .string({ required_error: 'Student name is required' })
      .min(1, 'Student name is required'),
    guardianName: z
      .string({ required_error: 'Guardian name is required' })
      .min(1, 'Guardian name is required'),
    guardianPhone: z
      .string({ required_error: 'Guardian phone is required' })
      .min(1, 'Guardian phone is required'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Valid email is required'),
    address: z
      .string({ required_error: 'Address is required' })
      .min(1, 'Address is required'),
    desiredClass: z
      .string({ required_error: 'Desired class is required' })
      .min(1, 'Desired class is required'),
    preferredTeacherGender: z.enum(['male', 'female']).optional(),
    preferredTeachingLanguage: z.enum(['bengali', 'english', 'both']).optional(),
    classTime: z.string().optional(),
    guardianProfession: z.string().optional(),
    guardianTimezone: z.string().optional(),
    dateOfBirth: z.coerce.date().optional(),
    previousEducation: z.string().optional(),
    photo: z.string().url('Photo must be a valid URL').optional(),
    note: z.string().optional(),
  }),
});

// Admin — reject an admission with an optional reason.
export const rejectAdmissionValidationSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
  }),
});
