/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { AttendanceService, IActor } from './attendance.service';

// Pull the authenticated actor injected by authMiddleware (req.user).
const getActor = (req: Request): IActor => (req as any).user as IActor;

// GET /api/attendance/my-students?date=&teacherId=
export const getMyStudents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const date =
      req.query.date !== undefined ? String(req.query.date) : undefined;
    const teacherId =
      req.query.teacherId !== undefined
        ? String(req.query.teacherId)
        : undefined;

    const result = await AttendanceService.getMyStudents(
      getActor(req),
      date,
      teacherId,
    );
    res.status(200).json({
      success: true,
      message: 'Students attendance retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/attendance/mark
export const markAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AttendanceService.markOne(getActor(req), req.body);
    res.status(200).json({
      success: true,
      message: `Attendance marked as ${result.status}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/attendance/student/:studentId?date=
export const clearAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AttendanceService.clearOne(
      getActor(req),
      req.params.studentId,
      req.query.date as string | undefined,
    );
    res.status(200).json({
      success: true,
      message: 'Attendance mark removed',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/attendance/bulk
export const markBulkAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AttendanceService.markBulk(getActor(req), req.body);
    res.status(200).json({
      success: true,
      message: `Attendance marked for ${result.marked} student(s)`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/attendance/my-summary?month=&year=&teacherId=
export const getMySummary = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const month =
      req.query.month !== undefined ? Number(req.query.month) : undefined;
    const year =
      req.query.year !== undefined ? Number(req.query.year) : undefined;
    const teacherId =
      req.query.teacherId !== undefined
        ? String(req.query.teacherId)
        : undefined;

    const result = await AttendanceService.getMySummary(
      getActor(req),
      month,
      year,
      teacherId,
    );
    res.status(200).json({
      success: true,
      message: 'Attendance summary retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/attendance/student/:studentId?month=&year=
export const getStudentMonth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const month =
      req.query.month !== undefined ? Number(req.query.month) : undefined;
    const year =
      req.query.year !== undefined ? Number(req.query.year) : undefined;

    const result = await AttendanceService.getStudentMonth(
      getActor(req),
      req.params.studentId,
      month,
      year,
    );
    res.status(200).json({
      success: true,
      message: 'Student attendance retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const AttendanceController = {
  getMyStudents,
  markAttendance,
  clearAttendance,
  markBulkAttendance,
  getMySummary,
  getStudentMonth,
};
