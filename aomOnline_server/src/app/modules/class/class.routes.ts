import express from 'express';
import { ClassController } from './class.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorize } from '../../middlewares/auth';
import {
  createClassValidationSchema,
  updateClassValidationSchema,
} from './class.validation';

const router = express.Router();

// PUBLIC — list active classes (sorted by order).
router.get('/', ClassController.getAllClasses);

// PUBLIC — single class.
router.get('/:id', ClassController.getClassById);

// Admin — create a class/level.
router.post(
  '/',
  authMiddleware,
  authorize('admin'),
  validateRequest(createClassValidationSchema),
  ClassController.createClass,
);

// Admin — update a class/level.
router.patch(
  '/:id',
  authMiddleware,
  authorize('admin'),
  validateRequest(updateClassValidationSchema),
  ClassController.updateClass,
);

// Admin — delete a class/level.
router.delete(
  '/:id',
  authMiddleware,
  authorize('admin'),
  ClassController.deleteClass,
);

export const ClassRoutes = router;
