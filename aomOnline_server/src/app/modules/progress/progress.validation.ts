import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Teacher (own) / admin — upsert a student's progress.
// :studentId is the student's Mongo _id (validated in params).
export const updateProgressValidationSchema = z.object({
  params: z.object({
    studentId: z
      .string({ required_error: 'studentId is required' })
      .regex(objectIdRegex, 'studentId must be a valid id'),
  }),
  body: z.object({
    percentage: z
      .number({
        required_error: 'percentage is required',
        invalid_type_error: 'percentage must be a number',
      })
      .min(0, 'percentage must be >= 0')
      .max(100, 'percentage must be <= 100'),
    classRef: z
      .string()
      .regex(objectIdRegex, 'classRef must be a valid id')
      .optional(),
    // Rich-text (HTML) message the teacher writes for the guardian card.
    note: z.string().max(8000, 'Message is too long').optional(),
  }),
});
