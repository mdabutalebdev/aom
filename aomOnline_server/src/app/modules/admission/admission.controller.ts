/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { AdmissionService } from './admission.service';

// POST /api/admissions — PUBLIC: submit an admission application.
export const createAdmission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AdmissionService.createAdmission(req.body);
    res.status(201).json({
      success: true,
      message: 'Your admission application has been submitted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admissions/upload-photo — PUBLIC: upload a photo via Cloudinary.
export const uploadAdmissionPhoto = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = (req as any).file;
    if (!file || !file.path) {
      throw Object.assign(new Error('No photo file was uploaded'), {
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

// GET /api/admissions — admin: paginated, filterable list.
export const getAllAdmissions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AdmissionService.getAllAdmissions(req.query as any);
    res.status(200).json({
      success: true,
      message: 'Admissions retrieved successfully',
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

// GET /api/admissions/:id — admin: single application.
export const getAdmissionById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AdmissionService.getAdmissionById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Admission retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admissions/:id/approve — admin: approve + auto-create student User.
export const approveAdmission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AdmissionService.approveAdmission(req.params.id);
    res.status(200).json({
      success: true,
      message:
        'Admission approved. A student account has been created — share the temporary password with the applicant.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admissions/:id/reject — admin: reject with an optional reason.
export const rejectAdmission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AdmissionService.rejectAdmission(
      req.params.id,
      req.body.reason,
    );
    res.status(200).json({
      success: true,
      message: 'Admission rejected successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admissions/:id — admin: delete an application.
export const deleteAdmission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AdmissionService.deleteAdmission(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Admission deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const AdmissionController = {
  createAdmission,
  uploadAdmissionPhoto,
  getAllAdmissions,
  getAdmissionById,
  approveAdmission,
  rejectAdmission,
  deleteAdmission,
};
