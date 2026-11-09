/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { HomeworkService, IActor } from './homework.service';

// Pull the authenticated actor injected by authMiddleware (req.user).
const getActor = (req: Request): IActor => (req as any).user as IActor;

// POST /api/homework
export const createHomework = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await HomeworkService.createHomework(getActor(req), req.body);
    res.status(201).json({
      success: true,
      message: 'Homework sent successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/homework/teacher
export const getTeacherHomework = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await HomeworkService.getTeacherHomework(
      getActor(req),
      req.query as any,
    );
    res.status(200).json({
      success: true,
      message: 'Homework retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/homework/my
export const getMyHomework = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await HomeworkService.getMyHomework(
      getActor(req),
      req.query as any,
    );
    res.status(200).json({
      success: true,
      message: 'Homework retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/homework/:id — teacher edits their own homework.
export const updateHomework = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await HomeworkService.updateHomework(
      getActor(req),
      req.params.id,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: 'Homework updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/homework/:id — teacher deletes their own homework.
export const deleteHomework = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await HomeworkService.deleteHomework(
      getActor(req),
      req.params.id,
    );
    res.status(200).json({
      success: true,
      message: 'Homework deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/homework/:id/read
export const markHomeworkRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await HomeworkService.markRead(getActor(req), req.params.id);
    res.status(200).json({
      success: true,
      message: 'Homework marked as read',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const HomeworkController = {
  createHomework,
  getTeacherHomework,
  getMyHomework,
  updateHomework,
  deleteHomework,
  markHomeworkRead,
};
