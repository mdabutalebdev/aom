import express from 'express';
import { AdmissionController } from './admission.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorize } from '../../middlewares/auth';
import { uploadImage } from '../../config/cloudinary';
import {
  createAdmissionValidationSchema,
  rejectAdmissionValidationSchema,
} from './admission.validation';

const router = express.Router();

// PUBLIC — submit an admission application.
router.post(
  '/',
  validateRequest(createAdmissionValidationSchema),
  AdmissionController.createAdmission,
);

// PUBLIC — upload an applicant photo (single field: 'photo') → returns its URL.
router.post(
  '/upload-photo',
  uploadImage.single('photo'),
  AdmissionController.uploadAdmissionPhoto,
);

// Admin — list admissions with filters + pagination.
router.get(
  '/',
  authMiddleware,
  authorize('admin'),
  AdmissionController.getAllAdmissions,
);

// Admin — single application.
router.get(
  '/:id',
  authMiddleware,
  authorize('admin'),
  AdmissionController.getAdmissionById,
);

// Admin — approve an application (auto-creates a student User account).
router.patch(
  '/:id/approve',
  authMiddleware,
  authorize('admin'),
  AdmissionController.approveAdmission,
);

// Admin — reject an application with an optional reason.
router.patch(
  '/:id/reject',
  authMiddleware,
  authorize('admin'),
  validateRequest(rejectAdmissionValidationSchema),
  AdmissionController.rejectAdmission,
);

// Admin — delete an application.
router.delete(
  '/:id',
  authMiddleware,
  authorize('admin'),
  AdmissionController.deleteAdmission,
);

export const AdmissionRoutes = router;
