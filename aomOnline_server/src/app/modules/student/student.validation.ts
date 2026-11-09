import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Admin — create a student profile (userRef optional; no login required).
export const createStudentValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Student name is required' })
      .min(1, 'Student name is required'),
    email: z.string().email('Valid email is required').optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    teacherRef: z
      .string()
      .regex(objectIdRegex, 'teacherRef must be a valid id')
      .optional(),
    classRef: z
      .string()
      .regex(objectIdRegex, 'classRef must be a valid id')
      .optional(),
    groupRef: z
      .string()
      .regex(objectIdRegex, 'groupRef must be a valid id')
      .optional(),
    guardianName: z.string().optional(),
    guardianPhone: z.string().optional(),
    address: z.string().optional(),
    photo: z.string().optional(),
    monthlyFee: z.number().optional(),
    teacherPayoutAmount: z.number().optional(),
    guardianEmail: z.string().email('Valid guardian email is required').optional(),
    guardianPassword: z
      .string()
      .min(6, 'Guardian password must be at least 6 characters')
      .optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }).refine(
    (data) => !(data.guardianEmail && !data.guardianPassword) && !(data.guardianPassword && !data.guardianEmail),
    { message: 'guardianEmail and guardianPassword must be provided together' },
  ),
});

// Admin — update a student profile.
export const updateStudentValidationSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Name cannot be empty').optional(),
      email: z.string().email('Valid email is required').optional(),
      phone: z.string().optional(),
      dateOfBirth: z.string().optional(),
      teacherRef: z
        .string()
        .regex(objectIdRegex, 'teacherRef must be a valid id')
        .optional(),
      classRef: z
        .string()
        .regex(objectIdRegex, 'classRef must be a valid id')
        .optional(),
      groupRef: z
        .string()
        .regex(objectIdRegex, 'groupRef must be a valid id')
        .optional(),
      guardianName: z.string().optional(),
      guardianPhone: z.string().optional(),
      address: z.string().optional(),
      photo: z.string().optional(),
      monthlyFee: z.number().optional(),
      teacherPayoutAmount: z.number().optional(),
      teacherEmail: z.string().email('Valid teacher email is required').optional(),
      teacherPassword: z.string().min(6, 'Teacher password must be at least 6 characters').optional(),
      guardianEmail: z.string().email('Valid guardian email is required').optional(),
      guardianPassword: z
        .string()
        .min(6, 'Guardian password must be at least 6 characters')
        .optional(),
      status: z.enum(['active', 'inactive']).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided to update',
    }),
});
