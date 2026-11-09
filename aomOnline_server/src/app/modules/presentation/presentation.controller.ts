import { Request, Response, NextFunction } from 'express';
import { PresentationService } from './presentation.service';

// GET /api/presentations — PUBLIC: list active presentations.
export const getAllPresentations = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await PresentationService.getAllPresentations();
    res.status(200).json({
      success: true,
      message: 'Presentations retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/presentations/:id — PUBLIC: single presentation.
export const getPresentationById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await PresentationService.getPresentationById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Presentation retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/presentations — admin: create a presentation.
export const createPresentation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await PresentationService.createPresentation(req.body);
    res.status(201).json({
      success: true,
      message: 'Presentation created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/presentations/:id — admin: update a presentation.
export const updatePresentation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await PresentationService.updatePresentation(
      req.params.id,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: 'Presentation updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/presentations/:id — admin: delete a presentation.
export const deletePresentation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await PresentationService.deletePresentation(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Presentation deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const PresentationController = {
  getAllPresentations,
  getPresentationById,
  createPresentation,
  updatePresentation,
  deletePresentation,
};
