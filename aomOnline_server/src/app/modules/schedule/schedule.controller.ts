/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { ScheduleService, IActor } from './schedule.service';

const getActor = (req: Request): IActor => (req as any).user as IActor;

// GET /api/schedules/teachers — admin: teacher cards + today's class counts.
export const getTeacherList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ScheduleService.getTeacherList(req.query as any);
    res.status(200).json({
      success: true,
      message: 'Teachers retrieved successfully',
      data: result.data,
      summary: result.summary,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/schedules/day?teacherId=&date= — one teacher's timetable for a day.
export const getDaySchedule = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ScheduleService.getDaySchedule(
      getActor(req),
      req.query.teacherId as string | undefined,
      req.query.date as string | undefined,
    );
    res.status(200).json({
      success: true,
      message: 'Schedule retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/schedules/my-day?date= — teacher: own timetable for a day.
export const getMyDaySchedule = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ScheduleService.getDaySchedule(
      getActor(req),
      undefined,
      req.query.date as string | undefined,
    );
    res.status(200).json({
      success: true,
      message: 'Your schedule retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/schedules/student/:studentId — every weekly slot for one student.
// GET /api/schedules/my — logged-in guardian/student's own weekly routine.
export const getMyStudentSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actor = (req as any).user;
    const result = await ScheduleService.getMyStudentSchedule(actor);
    res.status(200).json({
      success: true,
      message: 'Class routine retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentSchedules = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ScheduleService.getStudentSchedules(
      req.params.studentId,
    );
    res.status(200).json({
      success: true,
      message: 'Student schedules retrieved successfully',
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/schedules/my-week — teacher: own full weekly routine.
export const getMyWeeklyRoutine = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ScheduleService.getWeeklyRoutine(getActor(req));
    res.status(200).json({
      success: true,
      message: 'Weekly class routine retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/schedules/week/:teacherId — admin: a teacher's full weekly routine.
export const getTeacherWeeklyRoutine = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ScheduleService.getWeeklyRoutine(
      getActor(req),
      req.params.teacherId,
    );
    res.status(200).json({
      success: true,
      message: 'Weekly class routine retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/schedules — admin: add a weekly slot.
export const createSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ScheduleService.createSchedule(getActor(req), req.body);
    res.status(201).json({
      success: true,
      message: 'Class schedule created',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/schedules/:id — admin: edit a weekly slot.
export const updateSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ScheduleService.updateSchedule(
      getActor(req),
      req.params.id,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: 'Class schedule updated',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/schedules/:id — admin: remove a weekly slot.
export const deleteSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ScheduleService.deleteSchedule(
      getActor(req),
      req.params.id,
    );
    res.status(200).json({
      success: true,
      message: 'Class schedule deleted',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/schedules/session — mark one occurrence.
export const markSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ScheduleService.markSession(getActor(req), req.body);
    res.status(200).json({
      success: true,
      message: `Class marked as ${req.body.status}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/schedules/session/:id — undo a mark.
export const clearSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ScheduleService.clearSession(
      getActor(req),
      req.params.id,
    );
    res.status(200).json({
      success: true,
      message: 'Class status cleared',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const ScheduleController = {
  getTeacherList,
  getDaySchedule,
  getMyDaySchedule,
  getStudentSchedules,
  getMyStudentSchedule,
  getMyWeeklyRoutine,
  getTeacherWeeklyRoutine,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  markSession,
  clearSession,
};
