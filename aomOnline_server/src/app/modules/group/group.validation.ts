import { z } from 'zod';

const base = {
  name: z.string().min(1, 'Group name is required'),
  classRef: z.string().min(1, 'Class is required'),
  teacherRef: z.string().min(1, 'Teacher is required'),
  scheduleDays: z.array(z.string()).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  monthlyFee: z.number().min(0, 'Monthly fee cannot be negative'),
  teacherPayout: z.number().min(0, 'Teacher payout cannot be negative').optional(),
  status: z.enum(['active', 'inactive']).optional(),
};

export const createGroupValidationSchema = z.object({
  body: z.object(base),
});

export const updateGroupValidationSchema = z.object({
  body: z.object({
    name: base.name.optional(),
    classRef: base.classRef.optional(),
    teacherRef: base.teacherRef.optional(),
    scheduleDays: base.scheduleDays,
    startTime: base.startTime,
    endTime: base.endTime,
    monthlyFee: z.number().min(0).optional(),
    teacherPayout: base.teacherPayout,
    status: base.status,
  }),
});
