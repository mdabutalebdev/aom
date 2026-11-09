/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { ContactService } from './contact.service';

// POST /api/contacts — PUBLIC: submit the contact form.
export const createContact = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ContactService.createContact(req.body);
    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/contacts — admin: paginated, filterable list.
export const getAllContacts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ContactService.getAllContacts(req.query as any);
    res.status(200).json({
      success: true,
      message: 'Contacts retrieved successfully',
      data: result.data,
      meta: {
        total: result.meta.total,
        page: result.meta.page,
        totalPages: result.meta.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/contacts/:id — admin: single submission.
export const getContactById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ContactService.getContactById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Contact retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/contacts/:id/status — admin: update status.
export const updateContactStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ContactService.updateContactStatus(
      req.params.id,
      req.body.status,
    );
    res.status(200).json({
      success: true,
      message: 'Contact status updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/contacts/:id — admin: delete a submission.
export const deleteContact = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await ContactService.deleteContact(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const ContactController = {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
};
