import { Testimonial } from './testimonial.model';
import { ITestimonial } from './testimonial.interface';

// GET /api/testimonials — PUBLIC: list active, APPROVED testimonials, sorted by
// order. `status: { $ne: 'pending' }` keeps legacy docs (no status field) and
// approved ones visible while hiding pending parent submissions.
const getAllTestimonials = async (): Promise<ITestimonial[]> => {
  return Testimonial.find({
    isActive: true,
    status: { $ne: 'pending' },
  }).sort({ order: 1, createdAt: 1 });
};

// GET /api/testimonials/admin — admin: list ALL testimonials (pending first),
// for the moderation data table.
const getAllTestimonialsAdmin = async (): Promise<ITestimonial[]> => {
  return Testimonial.find().sort({ status: 1, order: 1, createdAt: -1 });
};

// POST /api/testimonials/submit — PUBLIC: a parent submits a review. Always
// created as pending + source 'parent' regardless of any client input.
const submitTestimonial = async (
  payload: Partial<ITestimonial>,
): Promise<ITestimonial> => {
  return Testimonial.create({
    reviewerName: payload.reviewerName,
    location: payload.location,
    youtubeUrl: payload.youtubeUrl,
    quoteText: payload.quoteText,
    duration: payload.duration,
    status: 'pending',
    source: 'parent',
    isActive: true,
  });
};

// GET /api/testimonials/:id — PUBLIC: single testimonial.
const getTestimonialById = async (id: string): Promise<ITestimonial> => {
  const found = await Testimonial.findById(id);
  if (!found) {
    throw Object.assign(new Error('Testimonial not found'), { status: 404 });
  }
  return found;
};

// POST /api/testimonials — admin: create a testimonial. Admin-authored reviews
// are approved + editable by default.
const createTestimonial = async (
  payload: Partial<ITestimonial>,
): Promise<ITestimonial> => {
  return Testimonial.create({
    ...payload,
    status: payload.status ?? 'approved',
    source: payload.source ?? 'admin',
  });
};

// PATCH /api/testimonials/:id — admin: update a testimonial.
const updateTestimonial = async (
  id: string,
  payload: Partial<ITestimonial>,
): Promise<ITestimonial> => {
  const updated = await Testimonial.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    throw Object.assign(new Error('Testimonial not found'), { status: 404 });
  }
  return updated;
};

// DELETE /api/testimonials/:id — admin: delete a testimonial.
const deleteTestimonial = async (id: string): Promise<ITestimonial> => {
  const deleted = await Testimonial.findByIdAndDelete(id);
  if (!deleted) {
    throw Object.assign(new Error('Testimonial not found'), { status: 404 });
  }
  return deleted;
};

export const TestimonialService = {
  getAllTestimonials,
  getAllTestimonialsAdmin,
  submitTestimonial,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
