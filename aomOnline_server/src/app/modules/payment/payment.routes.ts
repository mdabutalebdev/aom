import express from 'express';
import { PaymentController } from './payment.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorize } from '../../middlewares/auth';
import {
  togglePaymentValidationSchema,
  submitPaymentValidationSchema,
  rejectPaymentValidationSchema,
} from './payment.validation';
import { uploadImage } from '../../config/cloudinary';

const router = express.Router();

// Admin — teacher salary overview (next month) with search + pagination.
router.get(
  '/overview',
  authMiddleware,
  authorize('admin'),
  PaymentController.getOverview,
);

// Admin — every payment claim awaiting review. MUST be registered before
// '/teacher/:teacherId' so 'pending' isn't captured as a :teacherId param.
router.get(
  '/pending',
  authMiddleware,
  authorize('admin'),
  PaymentController.getPendingPayments,
);

// Admin (any teacher) / Teacher (own only, service-enforced) — a single
// teacher's collection sheet for a month/year.
router.get(
  '/teacher/:teacherId',
  authMiddleware,
  authorize('teacher', 'admin'),
  PaymentController.getTeacherPayments,
);

// Teacher — self-resolving version of the above (no :teacherId needed).
router.get(
  '/my-students',
  authMiddleware,
  authorize('teacher'),
  PaymentController.getMyPayments,
);

// Guardian — their own student's payment receipts (all statuses), newest first.
router.get(
  '/my-receipts',
  authMiddleware,
  authorize('parent'),
  PaymentController.getMyReceipts,
);

// Guardian — the payment form's context: auto student/class/teacher/amount
// plus the list of still-payable (unpaid) months from enrolment to now.
router.get(
  '/my-payable',
  authMiddleware,
  authorize('parent'),
  PaymentController.getMyPayable,
);

// Admin — toggle a student's paid/unpaid status for a month/year.
router.patch(
  '/toggle',
  authMiddleware,
  authorize('admin'),
  validateRequest(togglePaymentValidationSchema),
  PaymentController.togglePayment,
);

// Guardian — submit a payment claim (transaction ID / bank info) for their
// own student → status 'pending'.
router.post(
  '/submit',
  authMiddleware,
  authorize('parent'),
  // Multer must run BEFORE validateRequest so the multipart text fields are
  // parsed into req.body (and the screenshot into req.file) first.
  uploadImage.single('screenshot'),
  validateRequest(submitPaymentValidationSchema),
  PaymentController.submitPayment,
);

// Admin — approve a submitted claim → 'paid'.
router.patch(
  '/:id/approve',
  authMiddleware,
  authorize('admin'),
  PaymentController.approvePayment,
);

// Admin — reject a submitted claim → back to 'unpaid'.
router.patch(
  '/:id/reject',
  authMiddleware,
  authorize('admin'),
  validateRequest(rejectPaymentValidationSchema),
  PaymentController.rejectPayment,
);

export const PaymentRoutes = router;
