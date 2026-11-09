import { Types } from 'mongoose';

export type TSalaryStatus = 'paid' | 'partial' | 'unpaid';

export const SALARY_STATUSES: TSalaryStatus[] = ['paid', 'partial', 'unpaid'];

export type TSalaryMethod =
  | 'cash'
  | 'bank'
  | 'bkash'
  | 'nagad'
  | 'rocket'
  | 'other';

export const SALARY_METHODS: TSalaryMethod[] = [
  'cash',
  'bank',
  'bkash',
  'nagad',
  'rocket',
  'other',
];

// One disbursement. A month's salary can be settled in several instalments,
// so these accumulate on the record rather than replacing each other.
export interface ISalaryEntry {
  _id?: Types.ObjectId;
  amount: number; // BDT
  paidAt: Date;
  method: TSalaryMethod;
  purpose?: string; // Monthly Salary | Bonus | Advance | Arrears | Other
  transactionId?: string; // for non-cash methods
  accountNumber?: string; // account / number the money was sent from/to
  screenshotUrl?: string; // proof-of-transfer image the teacher can see
  note?: string;
  recordedBy?: Types.ObjectId; // ref User (the admin)
}

// A teacher's salary for one month/year.
//
// The money itself moves outside this system (admin's own bank/cash → teacher).
// This record exists so the madrasa can answer "what did we owe, what did we
// actually pay, and what is still due" — none of which was answerable before,
// since salary was only ever a projection recomputed on the fly.
export interface ISalary {
  teacherRef: Types.ObjectId; // ref Teacher — required
  month: number; // 1-12 — required
  year: number; // e.g. 2026 — required
  salaryAmount: number; // BDT — Σ of the teacher's students' payout, snapshotted
  paidAmount: number; // BDT — Σ entries[].amount, kept in sync on write
  status: TSalaryStatus; // derived from paidAmount vs salaryAmount
  entries: ISalaryEntry[];
  // True once an admin edits salaryAmount by hand. Auto-recalculation from
  // student assignments then stops for this record, so a deliberate figure
  // isn't silently overwritten when a student is added or reassigned.
  isAmountOverridden: boolean;
  studentCount: number; // headcount at snapshot time — for auditing the amount
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Derive status from the two amounts. A zero-salary record counts as paid —
// there is nothing owed, so leaving it "unpaid" forever would be misleading.
export const deriveSalaryStatus = (
  paidAmount: number,
  salaryAmount: number,
): TSalaryStatus => {
  if (paidAmount <= 0) return salaryAmount <= 0 ? 'paid' : 'unpaid';
  if (paidAmount >= salaryAmount) return 'paid';
  return 'partial';
};
