/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { SalaryService, IActor } from './salary.service';

// Pull the authenticated actor injected by authMiddleware (req.user).
const getActor = (req: Request): IActor => (req as any).user as IActor;

// GET /api/salaries/overview — admin: all teachers' salary for one period.
export const getOverview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await SalaryService.getOverview(req.query as any);
    res.status(200).json({
      success: true,
      message: 'Salary overview retrieved successfully',
      data: result.data,
      summary: result.summary,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/salaries/pay — admin: record one disbursement.
export const paySalary = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const screenshotUrl = (req as any).file?.path as string | undefined;
    const result = await SalaryService.paySalary(getActor(req), {
      ...req.body,
      screenshotUrl,
    });
    res.status(200).json({
      success: true,
      message: 'Salary payment recorded',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/salaries/bulk-pay — admin: settle every outstanding due.
export const bulkPay = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await SalaryService.bulkPay(getActor(req), req.body);
    res.status(200).json({
      success: true,
      message: `Recorded salary payments for ${result.paidCount} teacher(s)`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/salaries/amount — admin: override a month's expected salary.
export const updateSalaryAmount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await SalaryService.updateSalaryAmount(
      getActor(req),
      req.body,
    );
    res.status(200).json({
      success: true,
      message: 'Salary amount updated',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/salaries/:salaryId/entry/:entryId — admin: undo one instalment.
export const deleteEntry = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await SalaryService.deleteEntry(
      getActor(req),
      req.params.salaryId,
      req.params.entryId,
    );
    res.status(200).json({
      success: true,
      message: 'Salary payment entry removed',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/salaries/history/:teacherId — admin (any teacher).
export const getHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const limit =
      req.query.limit !== undefined ? Number(req.query.limit) : undefined;
    const result = await SalaryService.getHistory(
      getActor(req),
      req.params.teacherId,
      limit,
    );
    res.status(200).json({
      success: true,
      message: 'Salary history retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/salaries/my-salary — teacher: own salary history only.
export const getMySalary = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const limit =
      req.query.limit !== undefined ? Number(req.query.limit) : undefined;
    const result = await SalaryService.getHistory(
      getActor(req),
      undefined,
      limit,
    );
    res.status(200).json({
      success: true,
      message: 'Your salary history retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const SalaryController = {
  getOverview,
  paySalary,
  bulkPay,
  updateSalaryAmount,
  deleteEntry,
  getHistory,
  getMySalary,
};
