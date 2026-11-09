/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { ProgressService, IActor } from './progress.service';

// Pull the authenticated actor injected by authMiddleware (req.user).
const getActor = (req: Request): IActor => (req as any).user as IActor;

// GET /api/progress/my-students?teacherId=
export const getMyStudents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const teacherId =
      req.query.teacherId !== undefined
        ? String(req.query.teacherId)
        : undefined;

    const result = await ProgressService.getMyStudents(getActor(req), teacherId);
    res.status(200).json({
      success: true,
      message: 'Students progress retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/progress/student/:studentId
export const updateStudentProgress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ProgressService.updateStudentProgress(
      getActor(req),
      req.params.studentId,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: `Progress updated${
        result.notified > 0 ? ` — ${result.notified} milestone(s) notified` : ''
      }`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/progress/student/:studentId
export const getStudentProgress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ProgressService.getStudentProgress(
      getActor(req),
      req.params.studentId,
    );
    res.status(200).json({
      success: true,
      message: 'Student progress retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/progress/student/:studentId/promote
export const promoteStudentClass = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ProgressService.promoteStudentClass(
      getActor(req),
      req.params.studentId,
    );
    res.status(200).json({
      success: true,
      message: `Promoted to ${result.promotedTo.name ?? 'the next class'}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const ProgressController = {
  getMyStudents,
  updateStudentProgress,
  getStudentProgress,
  promoteStudentClass,
};
