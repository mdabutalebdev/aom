import { Schema, model } from 'mongoose';
import { IAchievement } from './achievement.interface';

const achievementSchema = new Schema<IAchievement>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    certificateImage: { type: String, required: true, trim: true },
    icon: { type: String, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

export const Achievement = model<IAchievement>('Achievement', achievementSchema);
