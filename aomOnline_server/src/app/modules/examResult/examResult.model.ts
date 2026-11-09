import { Schema, model } from 'mongoose';
import { IExamResult, IExamResultRow } from './examResult.interface';

const rowSchema = new Schema<IExamResultRow>(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String, trim: true, default: '' },
    mark1: { type: Number, required: true, min: 0, default: 0 },
    mark2: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
);

const examResultSchema = new Schema<IExamResult>(
  {
    title: { type: String, required: true, trim: true, default: 'Result Of Final Exam' },
    level: { type: String, required: true, trim: true },

    subject1Label: { type: String, required: true, trim: true },
    subject1Max: { type: Number, required: true, min: 0, default: 50 },
    subject2Label: { type: String, required: true, trim: true },
    subject2Max: { type: Number, required: true, min: 0, default: 50 },
    totalMax: { type: Number, required: true, min: 0, default: 100 },

    theme: { type: String, enum: ['teal', 'cyan'], default: 'cyan' },
    rows: { type: [rowSchema], default: [] },
  },
  { timestamps: true },
);

export const ExamResult = model<IExamResult>('ExamResult', examResultSchema);
