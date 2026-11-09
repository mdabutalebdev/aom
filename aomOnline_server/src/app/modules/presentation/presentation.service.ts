import { Presentation } from './presentation.model';
import { IPresentation } from './presentation.interface';

// GET /api/presentations — PUBLIC: list active presentations, sorted by order.
const getAllPresentations = async (): Promise<IPresentation[]> => {
  return Presentation.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
};

// GET /api/presentations/:id — PUBLIC: single presentation.
const getPresentationById = async (id: string): Promise<IPresentation> => {
  const found = await Presentation.findById(id);
  if (!found) {
    throw Object.assign(new Error('Presentation not found'), { status: 404 });
  }
  return found;
};

// POST /api/presentations — admin: create a presentation.
const createPresentation = async (
  payload: Partial<IPresentation>,
): Promise<IPresentation> => {
  return Presentation.create(payload);
};

// PATCH /api/presentations/:id — admin: update a presentation.
const updatePresentation = async (
  id: string,
  payload: Partial<IPresentation>,
): Promise<IPresentation> => {
  const updated = await Presentation.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    throw Object.assign(new Error('Presentation not found'), { status: 404 });
  }
  return updated;
};

// DELETE /api/presentations/:id — admin: delete a presentation.
const deletePresentation = async (id: string): Promise<IPresentation> => {
  const deleted = await Presentation.findByIdAndDelete(id);
  if (!deleted) {
    throw Object.assign(new Error('Presentation not found'), { status: 404 });
  }
  return deleted;
};

export const PresentationService = {
  getAllPresentations,
  getPresentationById,
  createPresentation,
  updatePresentation,
  deletePresentation,
};
