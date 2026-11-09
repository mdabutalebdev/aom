/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { NotificationService, IActor } from './notification.service';

// Pull the authenticated actor injected by authMiddleware (req.user).
const getActor = (req: Request): IActor => (req as any).user as IActor;

// GET /api/notifications?page=&limit=
export const getMyNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page =
      req.query.page !== undefined ? Number(req.query.page) : undefined;
    const limit =
      req.query.limit !== undefined ? Number(req.query.limit) : undefined;

    const result = await NotificationService.getMyNotifications(
      getActor(req),
      page,
      limit,
    );
    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/:id/read
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await NotificationService.markAsRead(
      getActor(req),
      req.params.id,
    );
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/read-all
export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await NotificationService.markAllAsRead(getActor(req));
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/notifications/broadcast — admin: notify all or selected guardians.
export const broadcastNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await NotificationService.broadcastNotification(req.body);
    res.status(200).json({
      success: true,
      message: `Notification sent to ${result.recipientCount} guardian(s)`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const NotificationController = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  broadcastNotification,
};
