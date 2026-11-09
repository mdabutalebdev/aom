import express from 'express';
import { MaterialController } from './material.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorize } from '../../middlewares/auth';
import { uploadFile } from '../../config/cloudinary';
import {
  createMaterialValidationSchema,
  updateMaterialValidationSchema,
} from './material.validation';

const router = express.Router();

// Teacher — upload a file (single field: 'file') → cloudinary → { url, fileType }.
router.post(
  '/upload',
  authMiddleware,
  authorize('teacher', 'admin'),
  uploadFile.single('file'),
  MaterialController.uploadMaterialFile,
);

// Student — their downloadable materials (own class OR class-agnostic).
router.get(
  '/my',
  authMiddleware,
  authorize('student', 'teacher', 'admin'),
  MaterialController.getMyMaterials,
);

// Teacher (own materials) / admin (all) — paginated + filterable list.
router.get(
  '/',
  authMiddleware,
  authorize('teacher', 'admin'),
  MaterialController.getMaterials,
);

// Teacher — create a material record from an uploaded fileUrl.
router.post(
  '/',
  authMiddleware,
  authorize('teacher', 'admin'),
  validateRequest(createMaterialValidationSchema),
  MaterialController.createMaterial,
);

// Teacher (own) — update a material.
router.patch(
  '/:id',
  authMiddleware,
  authorize('teacher', 'admin'),
  validateRequest(updateMaterialValidationSchema),
  MaterialController.updateMaterial,
);

// Teacher (own) / admin — delete a material.
router.delete(
  '/:id',
  authMiddleware,
  authorize('teacher', 'admin'),
  MaterialController.deleteMaterial,
);

export const MaterialRoutes = router;
