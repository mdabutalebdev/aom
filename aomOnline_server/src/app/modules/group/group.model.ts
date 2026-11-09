import { Schema, model } from 'mongoose';
import { IGroup, GROUP_STATUSES } from './group.interface';

const groupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, trim: true },
    classRef: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    teacherRef: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    scheduleDays: { type: [String], default: [] },
    startTime: { type: String, trim: true },
    endTime: { type: String, trim: true },
    monthlyFee: { type: Number, required: true, min: 0 },
    teacherPayout: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: GROUP_STATUSES, default: 'active' },
  },
  { timestamps: true },
);

export const Group = model<IGroup>('Group', groupSchema);
