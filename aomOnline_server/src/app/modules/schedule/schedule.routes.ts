import express from 'express';
import { ScheduleController } from './schedule.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorize } from '../../middlewares/auth';
import {
  createScheduleValidationSchema,
  updateScheduleValidationSchema,
  markSessionValidationSchema,
} from './schedule.validation';

const router = express.Router();

// Admin — teacher cards for the Upcoming Class index.
router.get(
  '/teachers',
  authMiddleware,
  authorize('admin'),
  ScheduleController.getTeacherList,
);

// Teacher — own timetable. Registered before any ':id' route so the literal
// paths can't be captured as params.
router.get(
  '/my-day',
  authMiddleware,
  authorize('teacher'),
  ScheduleController.getMyDaySchedule,
);

// Admin (any teacher) / Teacher (own only, service-enforced) — day timetable.
router.get(
  '/day',
  authMiddleware,
  authorize('teacher', 'admin'),
  ScheduleController.getDaySchedule,
);

// Guardian/student — the logged-in user's own weekly class routine.
router.get(
  '/my',
  authMiddleware,
  authorize('student', 'parent'),
  ScheduleController.getMyStudentSchedule,
);

// Teacher — own full weekly routine (Sun–Sat grid). Literal path before params.
router.get(
  '/my-week',
  authMiddleware,
  authorize('teacher'),
  ScheduleController.getMyWeeklyRoutine,
);

// Admin — a chosen teacher's full weekly routine.
router.get(
  '/week/:teacherId',
  authMiddleware,
  authorize('admin'),
  ScheduleController.getTeacherWeeklyRoutine,
);

// Admin — every weekly slot for one student.
router.get(
  '/student/:studentId',
  authMiddleware,
  authorize('admin'),
  ScheduleController.getStudentSchedules,
);

// Admin/Teacher — mark one dated occurrence completed/cancelled/rescheduled.
router.patch(
  '/session',
  authMiddleware,
  authorize('teacher', 'admin'),
  validateRequest(markSessionValidationSchema),
  ScheduleController.markSession,
);

// Admin/Teacher — undo a mark.
router.delete(
  '/session/:id',
  authMiddleware,
  authorize('teacher', 'admin'),
  ScheduleController.clearSession,
);

// Admin — create a weekly slot.
router.post(
  '/',
  authMiddleware,
  authorize('admin'),
  validateRequest(createScheduleValidationSchema),
  ScheduleController.createSchedule,
);

// Admin — edit a weekly slot.
router.patch(
  '/:id',
  authMiddleware,
  authorize('admin'),
  validateRequest(updateScheduleValidationSchema),
  ScheduleController.updateSchedule,
);

// Admin — remove a weekly slot.
router.delete(
  '/:id',
  authMiddleware,
  authorize('admin'),
  ScheduleController.deleteSchedule,
);

export const ScheduleRoutes = router;
