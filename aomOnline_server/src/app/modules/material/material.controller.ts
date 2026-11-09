/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { MaterialService, IActor } from './material.service';
import { inferFileType } from './material.interface';

// Pull the authenticated actor injected by authMiddleware (req.user).
const getActor = (req: Request): IActor => (req as any).user as IActor;

// POST /api/materials/upload — teacher: uploadFile.single('file') → cloudinary.
// Returns the uploaded file's URL + inferred fileType. 400 if no file arrived.
export const uploadMaterialFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = (req as any).file as
      | { path?: string; secure_url?: string; originalname?: string }
      | undefined;

    if (!file || !(file.path || file.secure_url)) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Attach a file under the "file" field.',
      });
    }

    const url = (file.secure_url || file.path) as string;
    const fileType = inferFileType(file.originalname || url);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: { url, fileType },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/materials?class=&type=&page=&limit=
export const getMaterials = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await MaterialService.getMaterials(getActor(req), {
      class: req.query.class as string | undefined,
      type: req.query.type as string | undefined,
      page: req.query.page as string | undefined,
      limit: req.query.limit as string | undefined,
    });
    res.status(200).json({
      success: true,
      message: 'Materials retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/materials/my — student's downloadable materials.
export const getMyMaterials = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await MaterialService.getMyMaterials(getActor(req));
    res.status(200).json({
      success: true,
      message: 'Materials retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/materials — teacher: create a material record.
export const createMaterial = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await MaterialService.createMaterial(getActor(req), req.body);
    res.status(201).json({
      success: true,
      message: 'Material created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/materials/:id — teacher (own).
export const updateMaterial = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await MaterialService.updateMaterial(
      getActor(req),
      req.params.id,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: 'Material updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/materials/:id — teacher (own) / admin.
export const deleteMaterial = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await MaterialService.deleteMaterial(
      getActor(req),
      req.params.id,
    );
    res.status(200).json({
      success: true,
      message: 'Material deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const MaterialController = {
  uploadMaterialFile,
  getMaterials,
  getMyMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
};
