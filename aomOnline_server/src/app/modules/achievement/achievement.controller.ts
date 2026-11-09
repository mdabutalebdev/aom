/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { AchievementService } from './achievement.service';

// GET /api/achievements — PUBLIC: list active achievements.
export const getAllAchievements = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AchievementService.getAllAchievements();
    res.status(200).json({
      success: true,
      message: 'Achievements retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/achievements/:id — PUBLIC: single achievement.
export const getAchievementById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AchievementService.getAchievementById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Achievement retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/achievements — admin: create an achievement.
export const createAchievement = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AchievementService.createAchievement(req.body);
    res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/achievements/:id — admin: update an achievement.
export const updateAchievement = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AchievementService.updateAchievement(
      req.params.id,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: 'Achievement updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/achievements/:id — admin: delete an achievement.
export const deleteAchievement = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AchievementService.deleteAchievement(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Achievement deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/achievements/upload-image — admin: upload a certificate image via
// Cloudinary (or local-disk fallback), returns its URL.
export const uploadAchievementImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = (req as any).file;
    if (!file || !file.path) {
      throw Object.assign(new Error('No image file was uploaded'), {
        status: 400,
      });
    }
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: { url: file.path },
    });
  } catch (error) {
    next(error);
  }
};

export const AchievementController = {
  getAllAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  uploadAchievementImage,
};
