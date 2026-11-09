/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { PaymentService, IActor } from './payment.service';

// Pull the authenticated actor injected by authMiddleware (req.user).
const getActor = (req: Request): IActor => (req as any).user as IActor;

// GET /api/payments/overview — admin: teacher salary overview.
export const getOverview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await PaymentService.getOverview(req.query as any);
    res.status(200).json({
      success: true,
      message: 'Payment overview retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/payments/teacher/:teacherId — admin (any) / teacher (own only).
export const getTeacherPayments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const month =
      req.query.month !== undefined ? Number(req.query.month) : undefined;
    const year =
      req.query.year !== undefined ? Number(req.query.year) : undefined;

    const result = await PaymentService.getTeacherPayments(
      getActor(req),
      req.params.teacherId,
      month,
      year,
    );
    res.status(200).json({
      success: true,
      message: 'Teacher payments retrieved successfully',
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/payments/my-students — teacher: own collection sheet.
export const getMyPayments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const month =
      req.query.month !== undefined ? Number(req.query.month) : undefined;
    const year =
      req.query.year !== undefined ? Number(req.query.year) : undefined;

    const result = await PaymentService.getMyPayments(getActor(req), month, year);
    res.status(200).json({
      success: true,
      message: 'Your payments retrieved successfully',
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/payments/toggle — admin: flip a student's paid/unpaid status.
export const togglePayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { studentId, month, year } = req.body;
    const result = await PaymentService.togglePayment(
      getActor(req),
      studentId,
      month,
      year,
    );
    res.status(200).json({
      success: true,
      message: `Payment marked as ${result.payment.status}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/payments/submit — guardian: submit a payment claim. Sent as
// multipart/form-data; the optional screenshot is on req.file (its URL comes
// from the HybridStorage engine — Cloudinary URL or local /uploads path).
export const submitPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const screenshotUrl = (req as any).file?.path as string | undefined;
    const result = await PaymentService.submitPayment(getActor(req), {
      ...req.body,
      screenshotUrl,
    });
    res.status(200).json({
      success: true,
      message: 'Payment claim submitted — awaiting review',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/payments/my-payable — guardian: payment-form context (auto fields +
// the list of still-payable months).
export const getMyPayable = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await PaymentService.getPayableMonths(getActor(req));
    res.status(200).json({
      success: true,
      message: 'Payable months retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/payments/my-receipts — guardian: their own student's payment
// records (receipts), newest first.
export const getMyReceipts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await PaymentService.getMyReceipts(getActor(req));
    res.status(200).json({
      success: true,
      message: 'Your payment receipts retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/payments/pending — admin: every guardian-submitted payment (all
// statuses — rows stay listed after being marked complete).
export const getPendingPayments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await PaymentService.getSubmissions();
    res.status(200).json({
      success: true,
      message: 'Pending payments retrieved successfully',
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/payments/:id/approve — admin: approve a submitted claim.
export const approvePayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await PaymentService.approvePayment(
      getActor(req),
      req.params.id,
    );
    res.status(200).json({
      success: true,
      message: 'Payment approved',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/payments/:id/reject — admin: reject a submitted claim.
export const rejectPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await PaymentService.rejectPayment(
      getActor(req),
      req.params.id,
      req.body?.reason,
    );
    res.status(200).json({
      success: true,
      message: 'Payment rejected',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const PaymentController = {
  getOverview,
  getTeacherPayments,
  getMyPayments,
  togglePayment,
  submitPayment,
  getMyPayable,
  getMyReceipts,
  getPendingPayments,
  approvePayment,
  rejectPayment,
};
