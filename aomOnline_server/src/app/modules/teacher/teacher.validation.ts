import { z } from 'zod';

// Admin — create a teacher (creates a linked User + Teacher profile).
export const createTeacherValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Teacher name is required' })
      .min(1, 'Teacher name is required'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Valid email is required'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    subject: z.string().optional(),
    designation: z.string().optional(),
    ratePerStudent: z.number({ required_error: 'Rate per student is required' }),
    photo: z.string().optional(),
    address: z.string().optional(),
    bio: z.string().optional(),
    zoomLink: z.string().optional(),
    timezone: z.string().optional(),
  }),
});

// Admin — update a teacher profile (+ optionally linked user name/phone).
export const updateTeacherValidationSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Name cannot be empty').optional(),
      phone: z.string().optional(),
      password: z.string().min(6, 'Password must be at least 6 characters').optional(),
      subject: z.string().optional(),
      designation: z.string().optional(),
      ratePerStudent: z.number().optional(),
      photo: z.string().optional(),
      address: z.string().optional(),
      bio: z.string().optional(),
      zoomLink: z.string().optional(),
      timezone: z.string().optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided to update',
    }),
});
