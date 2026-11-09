import { Schema, model } from 'mongoose';
import { IPayment, PAYMENT_STATUSES } from './payment.interface';

const paymentSchema = new Schema<IPayment>(
  {
    studentRef: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    teacherRef: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'unpaid',
    },
    paidAt: { type: Date },
    paymentMethod: { type: String, trim: true },
    feeType: { type: String, trim: true },
    feeNote: { type: String, trim: true },
    senderInfo: { type: String, trim: true },
    transactionId: { type: String, trim: true },
    bankInfo: { type: String, trim: true },
    bankAccountNumber: { type: String, trim: true },
    bankAccountHolder: { type: String, trim: true },
    screenshotUrl: { type: String, trim: true },
    submittedAt: { type: Date },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
);

// One payment record per student per month/year.
paymentSchema.index({ studentRef: 1, month: 1, year: 1 }, { unique: true });

export const Payment = model<IPayment>('Payment', paymentSchema);
