import { z } from 'zod';

// Admin creates a teacher account (role is forced to 'teacher' in the service).
export const createTeacherValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(1, 'Name is required'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Valid email is required'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
  }),
});

// Any authenticated user — self profile update. The service enforces a
// per-role field whitelist; this schema just validates the shape of
// whatever fields are present (extra fields for the actor's role are
// silently ignored by the service, not rejected here).
export const updateMeValidationSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Name cannot be empty').optional(),
      photo: z.string().optional(),
      phone: z.string().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided to update',
    }),
});

// Admin updates a user (name / phone / role / isActive).
export const updateUserValidationSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Name cannot be empty').optional(),
      phone: z.string().optional(),
      role: z
        .enum(['parent', 'student', 'teacher', 'admin', 'superAdmin'])
        .optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided to update',
    }),
});

// Admin toggles / sets isActive for a user.
export const updateUserStatusValidationSchema = z.object({
  body: z.object({
    isActive: z.boolean({ required_error: 'isActive (boolean) is required' }),
  }),
});
