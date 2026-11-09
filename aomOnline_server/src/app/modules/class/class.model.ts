import { Schema, model } from 'mongoose';
import { IClass, IMilestone, DEFAULT_MILESTONES } from './class.interface';

const milestoneSchema = new Schema<IMilestone>(
  {
    percent: { type: Number, required: true },
    label: { type: String, trim: true },
  },
  { _id: false },
);

const classSchema = new Schema<IClass>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    nameEn: { type: String, trim: true },
    monthlyFee: { type: Number, required: true },
    order: { type: Number, default: 0 },
    milestones: { type: [milestoneSchema], default: () => DEFAULT_MILESTONES },
    description: { type: String, trim: true },
    icon: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

export const Class = model<IClass>('Class', classSchema);
