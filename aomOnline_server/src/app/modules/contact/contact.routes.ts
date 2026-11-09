import express from 'express';
import { ContactController } from './contact.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorize } from '../../middlewares/auth';
import {
  createContactValidationSchema,
  updateContactStatusValidationSchema,
} from './contact.validation';

const router = express.Router();

// PUBLIC — a visitor submits the contact form.
router.post(
  '/',
  validateRequest(createContactValidationSchema),
  ContactController.createContact,
);

// Admin — list contacts with filters + pagination.
router.get(
  '/',
  authMiddleware,
  authorize('admin'),
  ContactController.getAllContacts,
);

// Admin — single submission.
router.get(
  '/:id',
  authMiddleware,
  authorize('admin'),
  ContactController.getContactById,
);

// Admin — update a submission's status.
router.patch(
  '/:id/status',
  authMiddleware,
  authorize('admin'),
  validateRequest(updateContactStatusValidationSchema),
  ContactController.updateContactStatus,
);

// Admin — delete a submission.
router.delete(
  '/:id',
  authMiddleware,
  authorize('admin'),
  ContactController.deleteContact,
);

export const ContactRoutes = router;
