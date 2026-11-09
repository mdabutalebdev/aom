import { Request, Response, NextFunction } from 'express';
import { CertificateService } from './certificate.service';

// Pull the authenticated actor injected by authMiddleware (req.user).
const getActor = (req: Request) => {
  const user = (req as any).user || {};
  return { userId: user.userId as string, role: user.role as string };
};

const getMyCertificates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId } = req.params;
    const result = await CertificateService.getMyCertificates(studentId);

    res.status(200).json({
      success: true,
      message: 'Certificates fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllCertificates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CertificateService.getAllCertificates(getActor(req), req.query);

    res.status(200).json({
      success: true,
      message: 'All certificates fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const issueCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId } = req.params;
    const result = await CertificateService.issueCertificate(studentId);

    res.status(201).json({
      success: true,
      message: 'Certificate issued successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const createCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CertificateService.createCertificate(req.body);

    res.status(201).json({
      success: true,
      message: 'Certificate created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await CertificateService.updateCertificate(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Certificate updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await CertificateService.deleteCertificate(id);

    res.status(200).json({
      success: true,
      message: 'Certificate deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const CertificateController = {
  getMyCertificates,
  getAllCertificates,
  issueCertificate,
  createCertificate,
  updateCertificate,
  deleteCertificate,
};
