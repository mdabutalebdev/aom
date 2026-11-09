import express from 'express';
import { HomeworkController } from './homework.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorize } from '../../middlewares/auth';
import {
  createHomeworkValidationSchema,
  updateHomeworkValidationSchema,
} from './homework.validation';

const router = express.Router();

// Teacher — send one-way homework to a student's guardian.
router.post(
  '/',
  authMiddleware,
  authorize('teacher'),
  validateRequest(createHomeworkValidationSchema),
  HomeworkController.createHomework,
);

// Teacher — their own sent-homework history (data table).
router.get(
  '/teacher',
  authMiddleware,
  authorize('teacher'),
  HomeworkController.getTeacherHomework,
);

// Guardian (parent / student login) — homework sent to them (read-only inbox).
router.get(
  '/my',
  authMiddleware,
  authorize('parent', 'student'),
  HomeworkController.getMyHomework,
);

// Teacher — edit one of their own homework entries.
router.patch(
  '/:id',
  authMiddleware,
  authorize('teacher'),
  validateRequest(updateHomeworkValidationSchema),
  HomeworkController.updateHomework,
);

// Teacher — delete one of their own homework entries.
router.delete(
  '/:id',
  authMiddleware,
  authorize('teacher'),
  HomeworkController.deleteHomework,
);

// Guardian — mark a received homework read.
router.patch(
  '/:id/read',
  authMiddleware,
  authorize('parent', 'student'),
  HomeworkController.markHomeworkRead,
);

export const HomeworkRoutes = router;
