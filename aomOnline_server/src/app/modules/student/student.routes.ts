import express from 'express';
import { StudentController } from './student.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorize } from '../../middlewares/auth';
import {
  createStudentValidationSchema,
  updateStudentValidationSchema,
} from './student.validation';

const router = express.Router();

// Student/parent — consolidated dashboard for the logged-in user's own profile.
// MUST be registered before '/:id' so it isn't shadowed by the param route.
router.get(
  '/me/dashboard',
  authMiddleware,
  authorize('student', 'parent'),
  StudentController.getMyDashboard,
);

// Admin — list students with filters + pagination.
router.get(
  '/',
  authMiddleware,
  authorize('admin'),
  StudentController.getAllStudents,
);

// Admin — single student.
router.get(
  '/:id',
  authMiddleware,
  authorize('admin'),
  StudentController.getStudentById,
);

// Admin — create a student profile (userRef optional).
router.post(
  '/',
  authMiddleware,
  authorize('admin'),
  validateRequest(createStudentValidationSchema),
  StudentController.createStudent,
);

// Admin — update a student profile.
router.patch(
  '/:id',
  authMiddleware,
  authorize('admin'),
  validateRequest(updateStudentValidationSchema),
  StudentController.updateStudent,
);

// Admin — delete a student profile.
router.delete(
  '/:id',
  authMiddleware,
  authorize('admin'),
  StudentController.deleteStudent,
);

export const StudentRoutes = router;
