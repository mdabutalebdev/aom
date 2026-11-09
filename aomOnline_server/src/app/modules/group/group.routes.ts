import express from 'express';
import { GroupController } from './group.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorize } from '../../middlewares/auth';
import {
  createGroupValidationSchema,
  updateGroupValidationSchema,
} from './group.validation';

const router = express.Router();

router.get('/', authMiddleware, authorize('admin'), GroupController.getAllGroups);
router.get('/:id', authMiddleware, authorize('admin'), GroupController.getGroupById);

router.post(
  '/',
  authMiddleware,
  authorize('admin'),
  validateRequest(createGroupValidationSchema),
  GroupController.createGroup,
);

router.patch(
  '/:id',
  authMiddleware,
  authorize('admin'),
  validateRequest(updateGroupValidationSchema),
  GroupController.updateGroup,
);

router.delete('/:id', authMiddleware, authorize('admin'), GroupController.deleteGroup);

export const GroupRoutes = router;
