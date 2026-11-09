import { z } from 'zod';

// Admin — create a testimonial.
export const createTestimonialValidationSchema = z.object({
  body: z.object({
    reviewerName: z
      .string({ required_error: 'Reviewer name is required' })
      .min(1, 'Reviewer name is required'),
    location: z.string().optional(),
    youtubeUrl: z
      .string({ required_error: 'YouTube URL is required' })
      .min(1, 'YouTube URL is required'),
    quoteText: z
      .string({ required_error: 'Quote text is required' })
      .min(1, 'Quote text is required'),
    duration: z.string().optional(),
    order: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

// PUBLIC — a parent submits a review from the homepage. No order/status/source
// are accepted from the public: the server forces status='pending',
// source='parent'.
export const submitTestimonialValidationSchema = z.object({
  body: z.object({
    reviewerName: z
      .string({ required_error: 'Your name is required' })
      .min(1, 'Your name is required'),
    location: z.string().optional(),
    youtubeUrl: z
      .string({ required_error: 'YouTube URL is required' })
      .min(1, 'YouTube URL is required'),
    quoteText: z
      .string({ required_error: 'Review text is required' })
      .min(1, 'Review text is required'),
    duration: z.string().optional(),
  }),
});

// Admin — update a testimonial (all fields optional, at least one required).
export const updateTestimonialValidationSchema = z.object({
  body: z
    .object({
      reviewerName: z.string().min(1, 'Reviewer name cannot be empty').optional(),
      location: z.string().optional(),
      youtubeUrl: z.string().min(1, 'YouTube URL cannot be empty').optional(),
      quoteText: z.string().min(1, 'Quote text cannot be empty').optional(),
      duration: z.string().optional(),
      order: z.number().optional(),
      isActive: z.boolean().optional(),
      status: z.enum(['pending', 'approved']).optional(),
      source: z.enum(['parent', 'admin']).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided to update',
    }),
});
