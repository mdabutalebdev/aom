import express from 'express';
import { SettingsController } from './settings.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorize } from '../../middlewares/auth';
import { uploadImage, uploadVideo } from '../../config/cloudinary';
import { updateSettingsValidationSchema } from './settings.validation';

const router = express.Router();

// PUBLIC — returns the settings doc (auto-creates a default if missing).
router.get('/', SettingsController.getSettings);

// Admin — update/upsert the single settings doc.
router.patch(
  '/',
  authMiddleware,
  authorize('admin'),
  validateRequest(updateSettingsValidationSchema),
  SettingsController.updateSettings,
);

// Admin — upload the homepage Hero photo (field: 'image') → returns its URL.
router.post(
  '/upload-hero-image',
  authMiddleware,
  authorize('admin'),
  uploadImage.single('image'),
  SettingsController.uploadHeroImage,
);

// Admin — upload the homepage Hero right-panel video (field: 'video') from the
// admin's PC → returns its URL.
router.post(
  '/upload-hero-video',
  authMiddleware,
  authorize('admin'),
  uploadVideo.single('video'),
  SettingsController.uploadHeroVideo,
);

// Admin — generic image upload (field: 'image') → returns its URL. Used for
// the "Watch Our Live Class Demo" comparison photos (and any future
// Settings-managed image field) — the caller decides which field the
// returned URL gets assigned to.
router.post(
  '/upload-image',
  authMiddleware,
  authorize('admin'),
  uploadImage.single('image'),
  SettingsController.uploadSettingsImage,
);

export const SettingsRoutes = router;
