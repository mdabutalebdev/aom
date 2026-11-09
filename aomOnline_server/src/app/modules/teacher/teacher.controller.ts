/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { TeacherService } from './teacher.service';

// GET /api/teachers — admin: paginated, searchable list.
export const getAllTeachers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await TeacherService.getAllTeachers(req.query as any);
    res.status(200).json({
      success: true,
      message: 'Teachers retrieved successfully',
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

// GET /api/teachers/:id — admin: single teacher.
export const getTeacherById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await TeacherService.getTeacherById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Teacher retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/teachers — admin: create a teacher (User + profile).
export const createTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await TeacherService.createTeacher(req.body);
    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/teachers/:id — admin: update profile (+ linked user).
export const updateTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await TeacherService.updateTeacher(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/teachers/:id — admin: delete profile + deactivate user.
export const deleteTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await TeacherService.deleteTeacher(req.params.id);
    res.status(200).json({
      success: true,
      message:
        'Teacher deleted successfully. The linked login account has been deactivated.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const TeacherController = {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
};
