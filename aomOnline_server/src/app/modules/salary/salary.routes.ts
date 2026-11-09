import express from 'express';
import { SalaryController } from './salary.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorize } from '../../middlewares/auth';
import {
  paySalaryValidationSchema,
  bulkPayValidationSchema,
  updateSalaryAmountValidationSchema,
} from './salary.validation';
import { uploadImage } from '../../config/cloudinary';

const router = express.Router();

// Admin — every teacher's salary for one month/year, with summary stats.
router.get(
  '/overview',
  authMiddleware,
  authorize('admin'),
  SalaryController.getOverview,
);

// Teacher — own salary history. Registered before '/history/:teacherId' so
// the literal path can't be captured as a :teacherId param.
router.get(
  '/my-salary',
  authMiddleware,
  authorize('teacher'),
  SalaryController.getMySalary,
);

// Admin (any teacher) / Teacher (own only, service-enforced) — salary history.
router.get(
  '/history/:teacherId',
  authMiddleware,
  authorize('teacher', 'admin'),
  SalaryController.getHistory,
);

// Admin — record one salary disbursement. Multipart so an optional proof
// screenshot can ride along; multer runs before validateRequest.
router.post(
  '/pay',
  authMiddleware,
  authorize('admin'),
  uploadImage.single('screenshot'),
  validateRequest(paySalaryValidationSchema),
  SalaryController.paySalary,
);

// Admin — settle the full outstanding due for many teachers at once.
router.post(
  '/bulk-pay',
  authMiddleware,
  authorize('admin'),
  validateRequest(bulkPayValidationSchema),
  SalaryController.bulkPay,
);

// Admin — override a month's expected salary (bonus / deduction / flat figure).
router.patch(
  '/amount',
  authMiddleware,
  authorize('admin'),
  validateRequest(updateSalaryAmountValidationSchema),
  SalaryController.updateSalaryAmount,
);

// Admin — undo one recorded instalment.
router.delete(
  '/:salaryId/entry/:entryId',
  authMiddleware,
  authorize('admin'),
  SalaryController.deleteEntry,
);

export const SalaryRoutes = router;
