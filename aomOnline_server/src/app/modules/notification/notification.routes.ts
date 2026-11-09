import express from 'express';
import { NotificationController } from './notification.controller';
import { authMiddleware, authorize } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { broadcastNotificationValidationSchema } from './notification.validation';

const router = express.Router();

// Any authenticated role — list my notifications (newest first) + unread count.
router.get('/', authMiddleware, NotificationController.getMyNotifications);

// Any authenticated role — mark all of my notifications as read.
// NOTE: declared before '/:id/read' so 'read-all' is not swallowed by :id.
router.patch('/read-all', authMiddleware, NotificationController.markAllAsRead);

// Owner only — mark a single notification as read.
router.patch('/:id/read', authMiddleware, NotificationController.markAsRead);

// Admin — broadcast a notification to all guardians or a selected subset.
router.post(
  '/broadcast',
  authMiddleware,
  authorize('admin'),
  validateRequest(broadcastNotificationValidationSchema),
  NotificationController.broadcastNotification,
);

export const NotificationRoutes = router;
