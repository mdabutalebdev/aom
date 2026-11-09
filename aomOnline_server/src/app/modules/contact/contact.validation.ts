import { z } from 'zod';

// PUBLIC — a visitor submits the contact form.
export const createContactValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(1, 'Name is required'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Valid email is required'),
    phone: z.string().optional(),
    subject: z.string().optional(),
    message: z
      .string({ required_error: 'Message is required' })
      .min(1, 'Message is required'),
  }),
});

// Admin — update a contact submission's status.
export const updateContactStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(['new', 'read', 'replied'], {
      required_error: 'Status is required',
      invalid_type_error: "Status must be one of 'new', 'read', 'replied'",
    }),
  }),
});
