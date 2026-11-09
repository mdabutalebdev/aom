import { z } from 'zod';

// Guardian — send a message to their child's teacher.
export const createMessageValidationSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(1, 'Title is required')
      .max(200, 'Title is too long'),
    body: z
      .string({ required_error: 'Message is required' })
      .trim()
      .min(1, 'Message is required')
      .max(5000, 'Message is too long'),
  }),
});
