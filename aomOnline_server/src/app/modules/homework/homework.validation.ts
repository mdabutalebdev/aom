import { z } from 'zod';

// Teacher — send homework to one of their students' guardian.
export const createHomeworkValidationSchema = z.object({
  body: z.object({
    studentId: z
      .string({ required_error: 'Student is required' })
      .trim()
      .min(1, 'Student is required'),
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(1, 'Title is required')
      .max(200, 'Title is too long'),
    body: z
      .string({ required_error: 'Homework is required' })
      .trim()
      .min(1, 'Homework is required')
      .max(5000, 'Homework is too long'),
  }),
});

// Teacher — edit an existing homework (student cannot be changed).
export const updateHomeworkValidationSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(1, 'Title is required')
      .max(200, 'Title is too long'),
    body: z
      .string({ required_error: 'Homework is required' })
      .trim()
      .min(1, 'Homework is required')
      .max(5000, 'Homework is too long'),
  }),
});
