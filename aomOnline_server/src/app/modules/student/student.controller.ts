/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { StudentService, IActor } from './student.service';

// Pull the authenticated actor injected by authMiddleware (req.user).
const getActor = (req: Request): IActor => (req as any).user as IActor;

// GET /api/students/me/dashboard?month=&year=
// Logged-in student's consolidated portal (profile, progress, attendance grid,
// materials, notifications). Resolves the Student by userRef; 404 if none.
export const getMyDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const month =
      req.query.month !== undefined ? Number(req.query.month) : undefined;
    const year =
      req.query.year !== undefined ? Number(req.query.year) : undefined;

    const result = await StudentService.getMyDashboard(
      getActor(req),
      month,
      year,
    );
    res.status(200).json({
      success: true,
      message: 'Student dashboard retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/students — admin: paginated, filterable list.
export const getAllStudents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await StudentService.getAllStudents(req.query as any);
    res.status(200).json({
      success: true,
      message: 'Students retrieved successfully',
      data: result.data,
      meta: {
        total: result.meta.total,
        page: result.meta.page,
        totalPages: result.meta.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/students/:id — admin: single student.
export const getStudentById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await StudentService.getStudentById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Student retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/students — admin: create a student profile.
export const createStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await StudentService.createStudent(req.body);
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/students/:id — admin: update a student profile.
export const updateStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await StudentService.updateStudent(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/students/:id — admin: delete a student profile.
export const deleteStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await StudentService.deleteStudent(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const StudentController = {
  getMyDashboard,
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
