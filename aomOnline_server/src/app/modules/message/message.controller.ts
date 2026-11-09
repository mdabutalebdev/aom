/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { MessageService, IActor } from './message.service';

// Pull the authenticated actor injected by authMiddleware (req.user).
const getActor = (req: Request): IActor => (req as any).user as IActor;

// POST /api/messages
export const createMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await MessageService.createMessage(getActor(req), req.body);
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/messages/my
export const getMyMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await MessageService.getMyMessages(
      getActor(req),
      req.query as any,
    );
    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/messages/teacher
export const getTeacherMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await MessageService.getTeacherMessages(
      getActor(req),
      req.query as any,
    );
    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/messages/:id — guardian edits their own message.
export const updateMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await MessageService.updateMessage(
      getActor(req),
      req.params.id,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/messages/:id — guardian deletes their own message.
export const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await MessageService.deleteMessage(getActor(req), req.params.id);
    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/messages/:id/read
export const markMessageRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await MessageService.markRead(getActor(req), req.params.id);
    res.status(200).json({
      success: true,
      message: 'Message marked as read',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const MessageController = {
  createMessage,
  getMyMessages,
  getTeacherMessages,
  updateMessage,
  deleteMessage,
  markMessageRead,
};
