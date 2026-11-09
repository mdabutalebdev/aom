import { Schema, model } from 'mongoose';
import { IProgress } from './progress.interface';

const progressSchema = new Schema<IProgress>(
  {
    studentRef: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      unique: true,
    },
    classRef: { type: Schema.Types.ObjectId, ref: 'Class' },
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    completedMilestones: { type: [Number], default: [] },
    note: { type: String, trim: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  },
);

export const Progress = model<IProgress>('Progress', progressSchema);
