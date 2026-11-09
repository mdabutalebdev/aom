import express from 'express';
import { MessageController } from './message.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorize } from '../../middlewares/auth';
import { createMessageValidationSchema } from './message.validation';

const router = express.Router();

// Guardian (parent / student login) — send a one-way message to the child's teacher.
router.post(
  '/',
  authMiddleware,
  authorize('parent', 'student'),
  validateRequest(createMessageValidationSchema),
  MessageController.createMessage,
);

// Guardian — their own sent-message history.
router.get(
  '/my',
  authMiddleware,
  authorize('parent', 'student'),
  MessageController.getMyMessages,
);

// Teacher — messages sent to them (data table).
router.get(
  '/teacher',
  authMiddleware,
  authorize('teacher'),
  MessageController.getTeacherMessages,
);

// Guardian — edit one of their own messages.
router.patch(
  '/:id',
  authMiddleware,
  authorize('parent', 'student'),
  validateRequest(createMessageValidationSchema),
  MessageController.updateMessage,
);

// Guardian — delete one of their own messages.
router.delete(
  '/:id',
  authMiddleware,
  authorize('parent', 'student'),
  MessageController.deleteMessage,
);

// Teacher — mark a received message read.
router.patch(
  '/:id/read',
  authMiddleware,
  authorize('teacher'),
  MessageController.markMessageRead,
);

export const MessageRoutes = router;
