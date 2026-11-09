import { Request, Response, NextFunction } from 'express';
import { SettingsService } from './settings.service';

// GET /api/settings — PUBLIC: returns the settings doc (auto-creates default).
export const getSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await SettingsService.getSettings();
    res.status(200).json({
      success: true,
      message: 'Settings retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/settings — admin: update/upsert the single settings doc.
export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await SettingsService.updateSettings(req.body);
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/settings/upload-hero-image — admin: upload the homepage Hero
// photo via Cloudinary, returns its URL (persisted separately via PATCH).
export const uploadHeroImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// POST /api/settings/upload-image — admin: generic image upload via
// Cloudinary, returns its URL (persisted separately via PATCH, caller
// decides which field it belongs to — e.g. Class Demo comparison photos).
export const uploadSettingsImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// POST /api/settings/upload-hero-video — admin: upload the homepage Hero
// right-panel video (from the admin's PC) → returns its URL. Uses the video
// storage engine (Cloudinary or the local-disk fallback).
export const uploadHeroVideo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const file = (req as any).file;
    if (!file || !file.path) {
      throw Object.assign(new Error('No video file was uploaded'), {
        status: 400,
      });
    }
    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      data: { url: file.path },
    });
  } catch (error) {
    next(error);
  }
};

export const SettingsController = {
  getSettings,
  updateSettings,
  uploadHeroImage,
  uploadSettingsImage,
  uploadHeroVideo,
};
