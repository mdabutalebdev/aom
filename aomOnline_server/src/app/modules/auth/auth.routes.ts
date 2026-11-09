import express from 'express';
import { AuthController } from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware } from '../../middlewares/auth';
import {
  registerValidationSchema,
  loginValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
  changePasswordValidationSchema,
} from './auth.validation';

const router = express.Router();

router.post(
  '/register',
  validateRequest(registerValidationSchema),
  AuthController.register,
);

router.post(
  '/login',
  validateRequest(loginValidationSchema),
  AuthController.login,
);

router.post(
  '/forgot-password',
  validateRequest(forgotPasswordValidationSchema),
  AuthController.forgotPassword,
);

router.post(
  '/reset-password',
  validateRequest(resetPasswordValidationSchema),
  AuthController.resetPassword,
);

router.post(
  '/change-password',
  authMiddleware,
  validateRequest(changePasswordValidationSchema),
  AuthController.changePassword,
);

export const AuthRoutes = router;
