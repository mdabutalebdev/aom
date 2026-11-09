import { Types } from 'mongoose';

export interface IProgress {
  studentRef: Types.ObjectId; // ref Student — unique, required (one doc per student)
  classRef?: Types.ObjectId; // ref Class
  percentage: number; // 0–100, default 0
  completedMilestones: number[]; // percents crossed, default []
  note?: string;
  updatedBy?: Types.ObjectId; // ref User — the acting teacher/admin
  createdAt?: Date;
  updatedAt?: Date;
}
