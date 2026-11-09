import { z } from 'zod';

const rowSchema = z.object({
  name: z.string({ required_error: 'Student name is required' }).min(1, 'Student name is required'),
  country: z.string().optional(),
  mark1: z.number({ required_error: 'Mark is required' }).min(0, 'Mark cannot be negative'),
  mark2: z.number({ required_error: 'Mark is required' }).min(0, 'Mark cannot be negative'),
});

// Admin — create an exam result sheet.
export const createExamResultValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    level: z.string({ required_error: 'Level is required' }).min(1, 'Level is required'),
    subject1Label: z
      .string({ required_error: 'Subject 1 label is required' })
      .min(1, 'Subject 1 label is required'),
    subject1Max: z.number({ required_error: 'Subject 1 total is required' }).min(0),
    subject2Label: z
      .string({ required_error: 'Subject 2 label is required' })
      .min(1, 'Subject 2 label is required'),
    subject2Max: z.number({ required_error: 'Subject 2 total is required' }).min(0),
    totalMax: z.number().min(0).optional(),
    theme: z.enum(['teal', 'cyan']).optional(),
    rows: z.array(rowSchema).optional(),
  }),
});

// Admin — update an exam result sheet (all optional, at least one field).
export const updateExamResultValidationSchema = z.object({
  body: z
    .object({
      title: z.string().optional(),
      level: z.string().min(1, 'Level cannot be empty').optional(),
      subject1Label: z.string().min(1).optional(),
      subject1Max: z.number().min(0).optional(),
      subject2Label: z.string().min(1).optional(),
      subject2Max: z.number().min(0).optional(),
      totalMax: z.number().min(0).optional(),
      theme: z.enum(['teal', 'cyan']).optional(),
      rows: z.array(rowSchema).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided to update',
    }),
});
