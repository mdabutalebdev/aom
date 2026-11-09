import express from 'express';
import { PresentationController } from './presentation.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorize } from '../../middlewares/auth';
import {
  createPresentationValidationSchema,
  updatePresentationValidationSchema,
} from './presentation.validation';

const router = express.Router();

// PUBLIC — list active presentations (sorted by order).
router.get('/', PresentationController.getAllPresentations);

// PUBLIC — single presentation.
router.get('/:id', PresentationController.getPresentationById);

// Admin — create a presentation.
router.post(
  '/',
  authMiddleware,
  authorize('admin'),
  validateRequest(createPresentationValidationSchema),
  PresentationController.createPresentation,
);

// Admin — update a presentation.
router.patch(
  '/:id',
  authMiddleware,
  authorize('admin'),
  validateRequest(updatePresentationValidationSchema),
  PresentationController.updatePresentation,
);

// Admin — delete a presentation.
router.delete(
  '/:id',
  authMiddleware,
  authorize('admin'),
  PresentationController.deletePresentation,
);

export const PresentationRoutes = router;
