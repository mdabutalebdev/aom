import { Request, Response, NextFunction } from 'express';
import { ClassService } from './class.service';

// GET /api/classes — PUBLIC: list active classes.
export const getAllClasses = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ClassService.getAllClasses();
    res.status(200).json({
      success: true,
      message: 'Classes retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/classes/:id — PUBLIC: single class.
export const getClassById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ClassService.getClassById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Class retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/classes — admin: create a class/level.
export const createClass = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ClassService.createClass(req.body);
    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/classes/:id — admin: update a class/level.
export const updateClass = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ClassService.updateClass(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/classes/:id — admin: delete a class/level.
export const deleteClass = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ClassService.deleteClass(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Class deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const ClassController = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
};
