import express from 'express';
import { ExamResultController } from './examResult.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorize } from '../../middlewares/auth';
import {
  createExamResultValidationSchema,
  updateExamResultValidationSchema,
} from './examResult.validation';

const router = express.Router();

// Admin — list all result sheets.
router.get('/', authMiddleware, authorize('admin'), ExamResultController.getAllResults);

// Admin — single result sheet.
router.get('/:id', authMiddleware, authorize('admin'), ExamResultController.getResultById);

// Admin — create a result sheet.
router.post(
  '/',
  authMiddleware,
  authorize('admin'),
  validateRequest(createExamResultValidationSchema),
  ExamResultController.createResult,
);

// Admin — update a result sheet.
router.patch(
  '/:id',
  authMiddleware,
  authorize('admin'),
  validateRequest(updateExamResultValidationSchema),
  ExamResultController.updateResult,
);

// Admin — delete a result sheet.
router.delete(
  '/:id',
  authMiddleware,
  authorize('admin'),
  ExamResultController.deleteResult,
);

export const ExamResultRoutes = router;
