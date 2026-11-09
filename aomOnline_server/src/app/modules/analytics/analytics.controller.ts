import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';

// GET /api/analytics/overview?month=&year= — admin: dashboard summary.
export const getOverview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const month =
      req.query.month !== undefined ? Number(req.query.month) : undefined;
    const year =
      req.query.year !== undefined ? Number(req.query.year) : undefined;

    const result = await AnalyticsService.getOverview(month, year);
    res.status(200).json({
      success: true,
      message: 'Analytics overview retrieved successfully',
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/report?type=&month=&year= — admin: a single report.
export const getReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const type = String(req.query.type ?? '');
    const month =
      req.query.month !== undefined ? Number(req.query.month) : undefined;
    const year =
      req.query.year !== undefined ? Number(req.query.year) : undefined;

    const result = await AnalyticsService.getReport(type, month, year);
    res.status(200).json({
      success: true,
      message: 'Analytics report retrieved successfully',
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const AnalyticsController = {
  getOverview,
  getReport,
};
