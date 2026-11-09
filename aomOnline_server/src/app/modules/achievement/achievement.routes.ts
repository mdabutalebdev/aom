import express from 'express';
import { AchievementController } from './achievement.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorize } from '../../middlewares/auth';
import { uploadImage } from '../../config/cloudinary';
import {
  createAchievementValidationSchema,
  updateAchievementValidationSchema,
} from './achievement.validation';

const router = express.Router();

// PUBLIC — list active achievements (sorted by order).
router.get('/', AchievementController.getAllAchievements);

// PUBLIC — single achievement.
router.get('/:id', AchievementController.getAchievementById);

// Admin — upload a certificate image (field: 'image') → returns its URL.
router.post(
  '/upload-image',
  authMiddleware,
  authorize('admin'),
  uploadImage.single('image'),
  AchievementController.uploadAchievementImage,
);

// Admin — create an achievement.
router.post(
  '/',
  authMiddleware,
  authorize('admin'),
  validateRequest(createAchievementValidationSchema),
  AchievementController.createAchievement,
);

// Admin — update an achievement.
router.patch(
  '/:id',
  authMiddleware,
  authorize('admin'),
  validateRequest(updateAchievementValidationSchema),
  AchievementController.updateAchievement,
);

// Admin — delete an achievement.
router.delete(
  '/:id',
  authMiddleware,
  authorize('admin'),
  AchievementController.deleteAchievement,
);

export const AchievementRoutes = router;
