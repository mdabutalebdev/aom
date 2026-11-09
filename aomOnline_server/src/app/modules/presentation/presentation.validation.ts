import { z } from 'zod';

// Admin — create a presentation.
export const createPresentationValidationSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(1, 'Title is required'),
    subtitle: z.string().optional(),
    presenterName: z
      .string({ required_error: 'Presenter name is required' })
      .min(1, 'Presenter name is required'),
    youtubeUrl: z
      .string({ required_error: 'YouTube URL is required' })
      .min(1, 'YouTube URL is required'),
    duration: z.string().optional(),
    icon: z.string().optional(),
    order: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

// Admin — update a presentation (all fields optional, at least one required).
export const updatePresentationValidationSchema = z.object({
  body: z
    .object({
      title: z.string().min(1, 'Title cannot be empty').optional(),
      subtitle: z.string().optional(),
      presenterName: z.string().min(1, 'Presenter name cannot be empty').optional(),
      youtubeUrl: z.string().min(1, 'YouTube URL cannot be empty').optional(),
      duration: z.string().optional(),
      icon: z.string().optional(),
      order: z.number().optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided to update',
    }),
});
