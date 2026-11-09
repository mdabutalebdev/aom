import { Class } from './class.model';
import { IClass } from './class.interface';

// GET /api/classes — PUBLIC: list active classes, sorted by order.
const getAllClasses = async (): Promise<IClass[]> => {
  return Class.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
};

// GET /api/classes/:id — PUBLIC: single class.
const getClassById = async (id: string): Promise<IClass> => {
  const found = await Class.findById(id);
  if (!found) {
    throw Object.assign(new Error('Class not found'), { status: 404 });
  }
  return found;
};

// POST /api/classes — admin: create a class/level.
const createClass = async (payload: Partial<IClass>): Promise<IClass> => {
  return Class.create(payload);
};

// PATCH /api/classes/:id — admin: update a class/level.
const updateClass = async (
  id: string,
  payload: Partial<IClass>,
): Promise<IClass> => {
  const updated = await Class.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    throw Object.assign(new Error('Class not found'), { status: 404 });
  }
  return updated;
};

// DELETE /api/classes/:id — admin: delete a class/level.
const deleteClass = async (id: string): Promise<IClass> => {
  const deleted = await Class.findByIdAndDelete(id);
  if (!deleted) {
    throw Object.assign(new Error('Class not found'), { status: 404 });
  }
  return deleted;
};

export const ClassService = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
};
