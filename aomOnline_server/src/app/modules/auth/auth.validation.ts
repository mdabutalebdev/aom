import { z } from 'zod';

// POST /api/auth/register — student self-register.
export const registerValidationSchema = z.object({
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

// POST /api/auth/login
export const loginValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Valid email is required'),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
  }),
});

// POST /api/auth/forgot-password
export const forgotPasswordValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Valid email is required'),
  }),
});

// POST /api/auth/reset-password
export const resetPasswordValidationSchema = z.object({
  body: z.object({
    token: z.string({ required_error: 'Token is required' }).min(1, 'Token is required'),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(6, 'Password must be at least 6 characters'),
  }),
});

// POST /api/auth/change-password
export const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string({ required_error: 'Old password is required' }).min(1, 'Old password is required'),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(6, 'Password must be at least 6 characters'),
  }),
});
