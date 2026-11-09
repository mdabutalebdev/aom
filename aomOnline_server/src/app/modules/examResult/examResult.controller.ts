import { Request, Response, NextFunction } from 'express';
import { ExamResultService } from './examResult.service';

// GET /api/exam-results — admin: list all result sheets.
export const getAllResults = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ExamResultService.getAllResults();
    res.status(200).json({
      success: true,
      message: 'Result sheets retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/exam-results/:id — admin: single result sheet.
export const getResultById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ExamResultService.getResultById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Result sheet retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/exam-results — admin: create a result sheet.
export const createResult = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ExamResultService.createResult(req.body);
    res.status(201).json({
      success: true,
      message: 'Result sheet created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/exam-results/:id — admin: update a result sheet.
export const updateResult = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ExamResultService.updateResult(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Result sheet updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/exam-results/:id — admin: delete a result sheet.
export const deleteResult = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ExamResultService.deleteResult(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Result sheet deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const ExamResultController = {
  getAllResults,
  getResultById,
  createResult,
  updateResult,
  deleteResult,
};
