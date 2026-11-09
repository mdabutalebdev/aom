import { Types } from 'mongoose';
import { Student } from '../student/student.model';
import { Teacher } from './teacher.model';

// Single source of truth for "what does this teacher earn per month".
//
// Each student's Student.teacherPayoutAmount is what the teacher earns for THAT
// student (set by admin when assigning) — independent of the student's own
// monthlyFee (what the guardian pays). Falls back to the teacher's flat
// ratePerStudent for any student that predates this field.
//
// This used to be duplicated in payment.service, teacher.service and
// analytics.service, and the analytics copy still used the older
// `ratePerStudent × studentCount` formula — so the admin dashboard and the
// payments overview reported different totals for the same data. Everything
// now calls in here instead.
export const sumTeacherPayout = async (
  teacherRef: Types.ObjectId,
  fallbackRate: number,
): Promise<number> => {
  const students = await Student.find({ teacherRef })
    .select('teacherPayoutAmount')
    .lean();
  return students.reduce(
    (sum, s) => sum + (s.teacherPayoutAmount ?? fallbackRate ?? 0),
    0,
  );
};

// Payout + headcount in one pass — callers that need both (salary records,
// teacher cards) would otherwise query Student twice.
export const computeTeacherPayout = async (
  teacherRef: Types.ObjectId,
  fallbackRate: number,
): Promise<{ salary: number; studentCount: number }> => {
  const students = await Student.find({ teacherRef })
    .select('teacherPayoutAmount')
    .lean();
  return {
    salary: students.reduce(
      (sum, s) => sum + (s.teacherPayoutAmount ?? fallbackRate ?? 0),
      0,
    ),
    studentCount: students.length,
  };
};

// Madrasa-wide payout for one month — the "expenses" side of the profit report.
// Counts every teacher, matching the existing overview endpoints.
export const sumAllTeacherPayout = async (): Promise<number> => {
  const teachers = await Teacher.find({})
    .select('ratePerStudent')
    .lean<{ _id: Types.ObjectId; ratePerStudent?: number }[]>();

  const payouts = await Promise.all(
    teachers.map((t) => sumTeacherPayout(t._id, t.ratePerStudent ?? 0)),
  );

  return payouts.reduce((sum, p) => sum + p, 0);
};
