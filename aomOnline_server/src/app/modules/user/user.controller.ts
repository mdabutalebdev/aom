/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';

// GET /api/user — admin: paginated, filterable list.
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await UserService.getAllUsers(req.query as any);
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
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

// GET /api/user/me — current authenticated user.
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user?.userId;
    const result = await UserService.getMe(userId);
    res.status(200).json({
      success: true,
      message: 'Current user retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/user/upload-photo — any authenticated user uploads a profile
// image (field: 'image') → { url }. Uses the shared image storage engine
// (Cloudinary or the local-disk fallback).
export const uploadPhoto = async (
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
      message: 'Photo uploaded successfully',
      data: { url: file.path },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/user/me — self profile update (per-role field whitelist).
export const updateMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actor = (req as any).user;
    const result = await UserService.updateMe(actor, req.body);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/user/create-teacher — admin creates a teacher.
export const createTeacher = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await UserService.createTeacher(req.body);
    res.status(201).json({
      success: true,
      message: 'Teacher account created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/user/:id — admin update.
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await UserService.updateUser(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/user/:id/status — admin toggle isActive.
export const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await UserService.updateUserStatus(
      req.params.id,
      req.body.isActive,
    );
    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/user/:id — admin delete.
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await UserService.deleteUser(req.params.id);
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const UserController = {
  getAllUsers,
  getMe,
  uploadPhoto,
  updateMe,
  createTeacher,
  updateUser,
  updateUserStatus,
  deleteUser,
};
