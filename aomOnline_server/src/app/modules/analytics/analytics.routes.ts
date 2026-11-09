import express from 'express';
import { AnalyticsController } from './analytics.controller';
import { authMiddleware, authorize } from '../../middlewares/auth';

const router = express.Router();

// Admin — dashboard overview (counts, payments, attendance, progress, recents,
// collection trend) for a month/year (defaults to the current period).
router.get(
  '/overview',
  authMiddleware,
  authorize('admin'),
  AnalyticsController.getOverview,
);

// Admin — a single report: type ∈ salary|payment|attendance|progress.
router.get(
  '/report',
  authMiddleware,
  authorize('admin'),
  AnalyticsController.getReport,
);

export const AnalyticsRoutes = router;
