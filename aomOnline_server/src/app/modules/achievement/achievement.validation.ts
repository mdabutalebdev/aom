import { z } from 'zod';

// Admin — create an achievement.
export const createAchievementValidationSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(1, 'Title is required'),
    description: z.string().optional(),
    certificateImage: z
      .string({ required_error: 'Certificate image is required' })
      .min(1, 'Certificate image is required'),
    icon: z.string().optional(),
    order: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

// Admin — update an achievement (all fields optional, at least one required).
export const updateAchievementValidationSchema = z.object({
  body: z
    .object({
      title: z.string().min(1, 'Title cannot be empty').optional(),
      description: z.string().optional(),
      certificateImage: z.string().min(1, 'Certificate image cannot be empty').optional(),
      icon: z.string().optional(),
      order: z.number().optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided to update',
    }),
});
