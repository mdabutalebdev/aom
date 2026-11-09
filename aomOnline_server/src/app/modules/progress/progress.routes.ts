import express from 'express';
import { ProgressController } from './progress.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorize } from '../../middlewares/auth';
import { updateProgressValidationSchema } from './progress.validation';

const router = express.Router();

// Teacher (or admin w/ ?teacherId=) — roster with each student's progress
// and the milestone ladder of their class.
router.get(
  '/my-students',
  authMiddleware,
  authorize('teacher', 'admin'),
  ProgressController.getMyStudents,
);

// Teacher (own) / admin — upsert a student's progress (fires milestone hook).
router.patch(
  '/student/:studentId',
  authMiddleware,
  authorize('teacher', 'admin'),
  validateRequest(updateProgressValidationSchema),
  ProgressController.updateStudentProgress,
);

// Teacher (own) / admin — promote a student to the next class (by order),
// resetting their progress under the new class.
router.patch(
  '/student/:studentId/promote',
  authMiddleware,
  authorize('teacher', 'admin'),
  ProgressController.promoteStudentClass,
);

// Teacher (own) / admin / the student themselves — read one student's progress.
// The 'student' role is allowed through here; the service enforces self-only.
router.get(
  '/student/:studentId',
  authMiddleware,
  authorize('student', 'teacher', 'admin'),
  ProgressController.getStudentProgress,
);

export const ProgressRoutes = router;
