import express from 'express';
import { AttendanceController } from './attendance.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorize } from '../../middlewares/auth';
import {
  markAttendanceValidationSchema,
  bulkAttendanceValidationSchema,
} from './attendance.validation';

const router = express.Router();

// Teacher (or admin w/ ?teacherId=) — roster with per-student status for a day.
router.get(
  '/my-students',
  authMiddleware,
  authorize('teacher', 'admin'),
  AttendanceController.getMyStudents,
);

// Teacher (or admin w/ ?teacherId=) — per-student monthly summary.
router.get(
  '/my-summary',
  authMiddleware,
  authorize('teacher', 'admin'),
  AttendanceController.getMySummary,
);

// Teacher (own student) or admin — a single student's monthly records + summary.
router.get(
  '/student/:studentId',
  authMiddleware,
  authorize('teacher', 'admin'),
  AttendanceController.getStudentMonth,
);

// Teacher/admin — mark one student's attendance for a day (upsert).
router.post(
  '/mark',
  authMiddleware,
  authorize('teacher', 'admin'),
  validateRequest(markAttendanceValidationSchema),
  AttendanceController.markAttendance,
);

// Teacher/admin — remove a student's mark for a day (back to "not marked").
router.delete(
  '/student/:studentId',
  authMiddleware,
  authorize('teacher', 'admin'),
  AttendanceController.clearAttendance,
);

// Teacher/admin — mark many students for one day (upsert; skips non-owned).
router.post(
  '/bulk',
  authMiddleware,
  authorize('teacher', 'admin'),
  validateRequest(bulkAttendanceValidationSchema),
  AttendanceController.markBulkAttendance,
);

export const AttendanceRoutes = router;
