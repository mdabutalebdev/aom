import { Request, Response, NextFunction } from 'express';
import { TeacherApplicationService } from './teacherApplication.service';
import { cloudinary } from '../../config/cloudinary';

import fs from 'fs';
import path from 'path';

// Helper to upload buffer to cloudinary or save locally
const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder: string,
  resourceType: 'auto' | 'raw' | 'video' = 'auto',
  originalName: string = 'file'
): Promise<{ secure_url: string }> => {
  return new Promise((resolve, reject) => {
    // If Cloudinary is not configured, save locally
    if (!cloudinary.config().cloud_name) {
      console.warn('Cloudinary not configured. Saving file locally instead.');
      // Use local project directory instead of volatile OS tmpdir
      const uploadsDir = path.join(process.cwd(), 'uploads', folder);
      
      // Ensure directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const ext = path.extname(originalName) || '';
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const filePath = path.join(uploadsDir, filename);

      fs.writeFile(filePath, buffer, (err) => {
        if (err) return reject(err);
        // Using generic localhost URL for development fallback
        const API_URL = process.env.API_URL || 'http://localhost:5000';
        return resolve({ secure_url: `${API_URL}/uploads/${folder}/${filename}` });
      });
      return;
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `aom-online-madrasa/${folder}`,
        resource_type: resourceType,
        public_id: `${uniqueSuffix}`,
      },
      (error, result) => {
        if (error) return reject(error);
        if (result) return resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

const createApplication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files?.cv || !files?.media) {
      return res.status(400).json({
        success: false,
        message: 'Both CV and Media (Audio/Video) files are required.',
      });
    }

    const cvFile = files.cv[0];
    const mediaFile = files.media[0];

    // Upload CV (Raw/Auto)
    const cvUpload = await uploadBufferToCloudinary(cvFile.buffer, 'teacher_cv', 'auto', cvFile.originalname);
    
    // Upload Media (Video/Audio)
    const mediaUpload = await uploadBufferToCloudinary(mediaFile.buffer, 'teacher_media', 'video', mediaFile.originalname);

    const payload = {
      ...req.body,
      cvUrl: cvUpload.secure_url,
      mediaUrl: mediaUpload.secure_url,
    };

    const result = await TeacherApplicationService.createApplication(payload);
    
    res.status(201).json({
      success: true,
      message: 'Teacher application submitted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllApplications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await TeacherApplicationService.getAllApplications();
    res.status(200).json({
      success: true,
      message: 'Applications retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getApplicationById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await TeacherApplicationService.getApplicationById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Application retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status } = req.body;
    const result = await TeacherApplicationService.updateApplicationStatus(req.params.id, status);
    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteApplication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await TeacherApplicationService.deleteApplication(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const TeacherApplicationController = {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
};
