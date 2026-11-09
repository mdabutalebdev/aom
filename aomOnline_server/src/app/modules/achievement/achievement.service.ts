import { Achievement } from './achievement.model';
import { IAchievement } from './achievement.interface';

// GET /api/achievements — PUBLIC: list active achievements, sorted by order.
const getAllAchievements = async (): Promise<IAchievement[]> => {
  return Achievement.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
};

// GET /api/achievements/:id — PUBLIC: single achievement.
const getAchievementById = async (id: string): Promise<IAchievement> => {
  const found = await Achievement.findById(id);
  if (!found) {
    throw Object.assign(new Error('Achievement not found'), { status: 404 });
  }
  return found;
};

// POST /api/achievements — admin: create an achievement.
const createAchievement = async (
  payload: Partial<IAchievement>,
): Promise<IAchievement> => {
  return Achievement.create(payload);
};

// PATCH /api/achievements/:id — admin: update an achievement.
const updateAchievement = async (
  id: string,
  payload: Partial<IAchievement>,
): Promise<IAchievement> => {
  const updated = await Achievement.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    throw Object.assign(new Error('Achievement not found'), { status: 404 });
  }
  return updated;
};

// DELETE /api/achievements/:id — admin: delete an achievement.
const deleteAchievement = async (id: string): Promise<IAchievement> => {
  const deleted = await Achievement.findByIdAndDelete(id);
  if (!deleted) {
    throw Object.assign(new Error('Achievement not found'), { status: 404 });
  }
  return deleted;
};

export const AchievementService = {
  getAllAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
};
