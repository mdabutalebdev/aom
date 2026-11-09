import express from 'express';
import { TeacherController } from './teacher.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorize } from '../../middlewares/auth';
import {
  createTeacherValidationSchema,
  updateTeacherValidationSchema,
} from './teacher.validation';

const router = express.Router();

// Admin — list teachers with search + pagination.
router.get(
  '/',
  authMiddleware,
  authorize('admin'),
  TeacherController.getAllTeachers,
);

// Admin — single teacher (+ studentCount).
router.get(
  '/:id',
  authMiddleware,
  authorize('admin'),
  TeacherController.getTeacherById,
);

// Admin — create a teacher (creates a linked User + Teacher profile).
router.post(
  '/',
  authMiddleware,
  authorize('admin'),
  validateRequest(createTeacherValidationSchema),
  TeacherController.createTeacher,
);

// Admin — update a teacher profile (+ optionally linked user name/phone).
router.patch(
  '/:id',
  authMiddleware,
  authorize('admin'),
  validateRequest(updateTeacherValidationSchema),
  TeacherController.updateTeacher,
);

// Admin — delete a teacher profile (+ deactivate the linked User).
router.delete(
  '/:id',
  authMiddleware,
  authorize('admin'),
  TeacherController.deleteTeacher,
);

export const TeacherRoutes = router;
