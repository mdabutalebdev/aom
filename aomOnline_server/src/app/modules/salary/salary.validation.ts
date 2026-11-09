import { z } from 'zod';
import { SALARY_METHODS } from './salary.interface';

const monthField = z
  .number()
  .int('month must be an integer')
  .min(1, 'month must be between 1 and 12')
  .max(12, 'month must be between 1 and 12')
  .optional();

const yearField = z
  .number()
  .int('year must be an integer')
  .min(2000, 'year must be a valid year')
  .optional();

const methodField = z.enum(SALARY_METHODS as [string, ...string[]], {
  required_error: 'Payment method is required',
  invalid_type_error: `Method must be one of: ${SALARY_METHODS.join(', ')}`,
});

// Admin — record one salary disbursement for a teacher. Sent as multipart/
// form-data (an optional screenshot rides along), so scalars arrive as STRINGS
// — hence z.coerce for amount/month/year.
export const paySalaryValidationSchema = z.object({
  body: z.object({
    teacherId: z
      .string({ required_error: 'teacherId is required' })
      .min(1, 'teacherId is required'),
    amount: z.coerce
      .number({ required_error: 'Amount is required' })
      .positive('Amount must be greater than zero'),
    method: methodField,
    purpose: z.string().optional(),
    transactionId: z.string().optional(),
    accountNumber: z.string().optional(),
    paidAt: z.string().optional(),
    note: z.string().optional(),
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

// Admin — settle the full outstanding due for many teachers at once.
// Omitting teacherIds targets every teacher with an outstanding balance.
export const bulkPayValidationSchema = z.object({
  body: z.object({
    teacherIds: z.array(z.string().min(1)).optional(),
    method: methodField,
    paidAt: z.string().optional(),
    note: z.string().optional(),
    month: monthField,
    year: yearField,
  }),
});

// Admin — override the expected salary for a teacher/month.
export const updateSalaryAmountValidationSchema = z.object({
  body: z.object({
    teacherId: z
      .string({ required_error: 'teacherId is required' })
      .min(1, 'teacherId is required'),
    salaryAmount: z
      .number({ required_error: 'Salary amount is required' })
      .min(0, 'Salary amount cannot be negative'),
    note: z.string().optional(),
    month: monthField,
    year: yearField,
  }),
});
