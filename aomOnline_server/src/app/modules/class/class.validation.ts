import { z } from 'zod';

const milestoneSchema = z.object({
  percent: z.number({ required_error: 'Milestone percent is required' }),
  label: z.string().optional(),
});

// Admin — create a class/level.
export const createClassValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Class name is required' })
      .min(1, 'Class name is required'),
    nameEn: z.string().optional(),
    monthlyFee: z.number({ required_error: 'Monthly fee is required' }),
    order: z.number().optional(),
    milestones: z.array(milestoneSchema).optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

// Admin — update a class/level (all fields optional, at least one required).
export const updateClassValidationSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, 'Class name cannot be empty').optional(),
      nameEn: z.string().optional(),
      monthlyFee: z.number().optional(),
      order: z.number().optional(),
      milestones: z.array(milestoneSchema).optional(),
      description: z.string().optional(),
      icon: z.string().optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided to update',
    }),
});
