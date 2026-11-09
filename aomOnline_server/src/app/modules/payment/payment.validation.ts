import { z } from 'zod';

// Admin — toggle a student's paid/unpaid status for a given month/year.
// month/year are optional and default to the current month/year server-side.
export const togglePaymentValidationSchema = z.object({
  body: z.object({
    studentId: z
      .string({ required_error: 'studentId is required' })
      .min(1, 'studentId is required'),
    month: z
      .number()
      .int('month must be an integer')
      .min(1, 'month must be between 1 and 12')
      .max(12, 'month must be between 1 and 12')
      .optional(),
    year: z
      .number()
      .int('year must be an integer')
      .min(2000, 'year must be a valid year')
      .optional(),
  }),
});

// Guardian — submit a payment claim. Sent as multipart/form-data (an optional
// screenshot file rides along), so every scalar arrives as a STRING — hence
// z.coerce.number() for month/year. The "at least one proof" rule (transaction
// ID OR screenshot) is enforced in the service, where the uploaded file is
// visible (it isn't part of the request body here).
export const submitPaymentValidationSchema = z.object({
  body: z.object({
    paymentMethod: z.string().min(1).optional(),
    feeType: z.string().min(1).optional(),
    feeNote: z.string().min(1).optional(),
    amount: z.coerce
      .number()
      .positive('amount must be greater than 0')
      .optional(),
    senderInfo: z.string().min(1).optional(),
    transactionId: z.string().min(1).optional(),
    bankInfo: z.string().min(1).optional(),
    bankAccountNumber: z.string().min(1).optional(),
    bankAccountHolder: z.string().min(1).optional(),
    month: z.coerce
      .number()
      .int('month must be an integer')
      .min(1, 'month must be between 1 and 12')
      .max(12, 'month must be between 1 and 12')
      .optional(),
    year: z.coerce
      .number()
      .int('year must be an integer')
      .min(2000, 'year must be a valid year')
      .optional(),
  }),
});

// Admin — reject a submitted payment claim (reason optional).
export const rejectPaymentValidationSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
  }),
});
