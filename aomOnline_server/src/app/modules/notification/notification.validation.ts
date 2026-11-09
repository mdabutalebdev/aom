import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Admin — broadcast to all guardians, or a specific selected subset.
export const broadcastNotificationValidationSchema = z.object({
  body: z.object({
    recipientIds: z
      .union([
        z.literal('all'),
        z.array(z.string().regex(objectIdRegex, 'recipientIds must be valid ids')),
      ])
      .optional(),
    title: z
      .string({ required_error: 'Title is required' })
      .min(1, 'Title is required'),
    message: z
      .string({ required_error: 'Message is required' })
      .min(1, 'Message is required'),
  }),
});
