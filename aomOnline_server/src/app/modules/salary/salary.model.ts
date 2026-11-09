import { Schema, model } from 'mongoose';
import {
  ISalary,
  ISalaryEntry,
  SALARY_METHODS,
  SALARY_STATUSES,
} from './salary.interface';

const salaryEntrySchema = new Schema<ISalaryEntry>(
  {
    amount: { type: Number, required: true, min: 0 },
    paidAt: { type: Date, required: true },
    method: { type: String, enum: SALARY_METHODS, required: true },
    purpose: { type: String, trim: true },
    transactionId: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    screenshotUrl: { type: String, trim: true },
    note: { type: String, trim: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: true, timestamps: false },
);

const salarySchema = new Schema<ISalary>(
  {
    teacherRef: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    salaryAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: SALARY_STATUSES,
      default: 'unpaid',
    },
    entries: { type: [salaryEntrySchema], default: [] },
    isAmountOverridden: { type: Boolean, default: false },
    studentCount: { type: Number, default: 0 },
    note: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
);

// One salary record per teacher per month/year.
salarySchema.index({ teacherRef: 1, month: 1, year: 1 }, { unique: true });

// Period lookups drive the overview screen and the profit trend.
salarySchema.index({ year: 1, month: 1 });

export const Salary = model<ISalary>('Salary', salarySchema);
