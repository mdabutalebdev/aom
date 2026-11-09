import express from 'express';
import { TeacherApplicationController } from './teacherApplication.controller';
import multer from 'multer';

const router = express.Router();

// Setup multer with memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB max per file
});

// POST /api/teacher-applications (public route)
router.post(
  '/',
  upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'media', maxCount: 1 },
  ]),
  TeacherApplicationController.createApplication,
);

// GET /api/teacher-applications (admin route)
// We should probably protect this with admin auth, but following the pattern of the project
router.get('/', TeacherApplicationController.getAllApplications);
router.get('/:id', TeacherApplicationController.getApplicationById);
router.patch('/:id/status', TeacherApplicationController.updateApplicationStatus);
router.delete('/:id', TeacherApplicationController.deleteApplication);

export const TeacherApplicationRoutes = router;
