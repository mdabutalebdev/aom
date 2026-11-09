import express from 'express';
import { TestimonialController } from './testimonial.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorize } from '../../middlewares/auth';
import {
  createTestimonialValidationSchema,
  submitTestimonialValidationSchema,
  updateTestimonialValidationSchema,
} from './testimonial.validation';

const router = express.Router();

// PUBLIC — list active, approved testimonials (sorted by order).
router.get('/', TestimonialController.getAllTestimonials);

// PUBLIC — a parent submits a review (created as pending, awaiting approval).
router.post(
  '/submit',
  validateRequest(submitTestimonialValidationSchema),
  TestimonialController.submitTestimonial,
);

// Admin — list ALL testimonials (pending + approved) for the moderation table.
// Declared before '/:id' so 'admin' isn't captured as an id.
router.get(
  '/admin',
  authMiddleware,
  authorize('admin'),
  TestimonialController.getAllTestimonialsAdmin,
);

// PUBLIC — single testimonial.
router.get('/:id', TestimonialController.getTestimonialById);

// Admin — create a testimonial.
router.post(
  '/',
  authMiddleware,
  authorize('admin'),
  validateRequest(createTestimonialValidationSchema),
  TestimonialController.createTestimonial,
);

// Admin — update a testimonial.
router.patch(
  '/:id',
  authMiddleware,
  authorize('admin'),
  validateRequest(updateTestimonialValidationSchema),
  TestimonialController.updateTestimonial,
);

// Admin — delete a testimonial.
router.delete(
  '/:id',
  authMiddleware,
  authorize('admin'),
  TestimonialController.deleteTestimonial,
);

export const TestimonialRoutes = router;
