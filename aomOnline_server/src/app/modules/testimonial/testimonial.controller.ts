import { Request, Response, NextFunction } from 'express';
import { TestimonialService } from './testimonial.service';

// GET /api/testimonials — PUBLIC: list active testimonials.
export const getAllTestimonials = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await TestimonialService.getAllTestimonials();
    res.status(200).json({
      success: true,
      message: 'Testimonials retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/testimonials/admin — admin: list ALL testimonials for moderation.
export const getAllTestimonialsAdmin = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await TestimonialService.getAllTestimonialsAdmin();
    res.status(200).json({
      success: true,
      message: 'Testimonials retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/testimonials/submit — PUBLIC: a parent submits a review (pending).
export const submitTestimonial = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await TestimonialService.submitTestimonial(req.body);
    res.status(201).json({
      success: true,
      message:
        'Thank you! Your review has been submitted and will appear after approval.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/testimonials/:id — PUBLIC: single testimonial.
export const getTestimonialById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await TestimonialService.getTestimonialById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Testimonial retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/testimonials — admin: create a testimonial.
export const createTestimonial = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await TestimonialService.createTestimonial(req.body);
    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/testimonials/:id — admin: update a testimonial.
export const updateTestimonial = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await TestimonialService.updateTestimonial(
      req.params.id,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/testimonials/:id — admin: delete a testimonial.
export const deleteTestimonial = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await TestimonialService.deleteTestimonial(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const TestimonialController = {
  getAllTestimonials,
  getAllTestimonialsAdmin,
  submitTestimonial,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
