import { Request, Response, NextFunction } from 'express';
import { GroupService } from './group.service';

export const getAllGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await GroupService.getAllGroups(req.query as any);
    res.status(200).json({ success: true, message: 'Groups retrieved', data });
  } catch (error) {
    next(error);
  }
};

export const getGroupById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await GroupService.getGroupById(req.params.id);
    res.status(200).json({ success: true, message: 'Group retrieved', data });
  } catch (error) {
    next(error);
  }
};

export const createGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await GroupService.createGroup(req.body);
    res.status(201).json({ success: true, message: 'Group created', data });
  } catch (error) {
    next(error);
  }
};

export const updateGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await GroupService.updateGroup(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Group updated', data });
  } catch (error) {
    next(error);
  }
};

export const deleteGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await GroupService.deleteGroup(req.params.id);
    res.status(200).json({ success: true, message: 'Group deleted' });
  } catch (error) {
    next(error);
  }
};

export const GroupController = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
};
