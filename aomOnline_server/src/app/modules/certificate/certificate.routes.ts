import express from 'express';
import { CertificateController } from './certificate.controller';
import { authMiddleware, authorize } from '../../middlewares/auth';

const router = express.Router();

router.get(
  '/',
  authMiddleware,
  authorize('superAdmin', 'admin', 'teacher'),
  CertificateController.getAllCertificates,
);

router.post(
  '/',
  authMiddleware,
  authorize('superAdmin', 'admin', 'teacher'),
  CertificateController.createCertificate,
);

router.get(
  '/student/:studentId',
  authMiddleware,
  authorize('superAdmin', 'admin', 'teacher', 'guardian', 'parent'),
  CertificateController.getMyCertificates,
);

router.post(
  '/student/:studentId/issue',
  authMiddleware,
  authorize('superAdmin', 'admin', 'teacher'),
  CertificateController.issueCertificate,
);

router.patch(
  '/:id',
  authMiddleware,
  authorize('superAdmin', 'admin', 'teacher'),
  CertificateController.updateCertificate,
);

router.delete(
  '/:id',
  authMiddleware,
  authorize('superAdmin', 'admin'),
  CertificateController.deleteCertificate,
);

export const CertificateRoutes = router;
