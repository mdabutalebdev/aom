import express from 'express';
import { UserController } from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorize } from '../../middlewares/auth';
import { uploadImage } from '../../config/cloudinary';
import {
  createTeacherValidationSchema,
  updateMeValidationSchema,
  updateUserValidationSchema,
  updateUserStatusValidationSchema,
} from './user.validation';

const router = express.Router();

// Any authenticated user — current profile. Must precede '/:id' style routes.
router.get('/me', authMiddleware, UserController.getMe);

// Any authenticated user — upload a profile photo (field: 'image') → { url }.
router.post(
  '/upload-photo',
  authMiddleware,
  uploadImage.single('image'),
  UserController.uploadPhoto,
);

// Any authenticated user — self profile update (per-role field whitelist,
// enforced in the service — e.g. teachers/guardians cannot change email/phone
// here, and teachers cannot change password anywhere except via Super Admin).
router.patch(
  '/me',
  authMiddleware,
  validateRequest(updateMeValidationSchema),
  UserController.updateMe,
);

// Admin — list users with filters + pagination.
router.get('/', authMiddleware, authorize('admin'), UserController.getAllUsers);

// Admin — create a teacher account.
router.post(
  '/create-teacher',
  authMiddleware,
  authorize('admin'),
  validateRequest(createTeacherValidationSchema),
  UserController.createTeacher,
);

// Admin — toggle isActive.
router.patch(
  '/:id/status',
  authMiddleware,
  authorize('admin'),
  validateRequest(updateUserStatusValidationSchema),
  UserController.updateUserStatus,
);

// Admin — update user (name/phone/role/isActive).
router.patch(
  '/:id',
  authMiddleware,
  authorize('admin'),
  validateRequest(updateUserValidationSchema),
  UserController.updateUser,
);

// Admin — delete user.
router.delete(
  '/:id',
  authMiddleware,
  authorize('admin'),
  UserController.deleteUser,
);

export const UserRoutes = router;
