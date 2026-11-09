import { Types } from 'mongoose';

export type TPaymentStatus = 'paid' | 'unpaid' | 'pending';

export const PAYMENT_STATUSES: TPaymentStatus[] = ['paid', 'unpaid', 'pending'];

export interface IPayment {
  studentRef: Types.ObjectId; // ref Student — required
  teacherRef: Types.ObjectId; // ref Teacher — required (denormalized from the student's teacher)
  month: number; // 1-12 — required
  year: number; // e.g. 2026 — required
  amount: number; // BDT — the student's monthlyFee captured at pay time
  status: TPaymentStatus; // 'paid' | 'unpaid' | 'pending' — default 'unpaid'
  paidAt?: Date; // set when status → 'paid', unset otherwise
  // Guardian-submitted payment claim (manual — no payment gateway).
  paymentMethod?: string; // e.g. bKash / Nagad / Rocket / Bank
  feeType?: string; // 'Monthly Fee' | 'Admission + Monthly Fee' | 'Other'
  feeNote?: string; // free text when feeType === 'Other'
  senderInfo?: string; // sender's number / account the payment came from
  transactionId?: string;
  bankInfo?: string; // legacy free-text bank field (kept for old records)
  bankAccountNumber?: string; // bank transfer — sender's account number
  bankAccountHolder?: string; // bank transfer — account holder's name
  screenshotUrl?: string; // uploaded proof-of-payment image URL
  submittedAt?: Date;
  submittedBy?: Types.ObjectId; // ref User (the guardian)
  // Super Admin review of a guardian's submitted claim.
  reviewedBy?: Types.ObjectId; // ref User (the admin)
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
