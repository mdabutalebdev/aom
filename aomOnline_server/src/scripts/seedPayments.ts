/**
 * Phase 6 Demo Data Seeder (Payments)
 *
 * Usage: npx ts-node src/scripts/seedPayments.ts  (or: npm run seed:payments)
 *
 * Idempotently marks ~65% of the seeded students as PAID for the CURRENT
 * month/year (from the server date). A deterministic subset is chosen — every
 * 3rd student (index % 3 === 2) is left UNPAID (no Payment record), so roughly
 * two-thirds are marked paid. For each paid student a Payment record is created:
 *   { studentRef, teacherRef, month, year, amount: monthlyFee, status: 'paid', paidAt: now }
 *
 * Prerequisites (run first): seed:phase5 (Teachers + Students).
 * Safe to re-run: a student is skipped if a Payment for that student+month+year
 * already exists, and unpaid students are simply left without a record.
 */

/* eslint-disable no-console */
import mongoose from 'mongoose';
import { dbConnect } from '../app/utils/dbConnect';
import { Student } from '../app/modules/student/student.model';
import { Payment } from '../app/modules/payment/payment.model';

async function seedPayments() {
  let created = 0;
  let skippedExisting = 0;
  let leftUnpaid = 0;

  try {
    await dbConnect();

    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() is 0-based
    const year = now.getFullYear();

    // Deterministic order so the "every 3rd" rule is stable across runs.
    const students = await Student.find({})
      .select('studentId teacherRef monthlyFee')
      .sort({ studentId: 1 })
      .lean();

    if (students.length === 0) {
      throw new Error(
        'No students found — run seed:phase5 before seed:payments.',
      );
    }

    for (let i = 0; i < students.length; i += 1) {
      const student = students[i];

      // Leave every 3rd student unpaid (~35% unpaid, ~65% paid).
      if (i % 3 === 2) {
        leftUnpaid += 1;
        console.log(
          `➖ left unpaid (no record): ${student.studentId}`,
        );
        continue;
      }

      // A student with no teacher cannot have a payment (teacherRef required).
      if (!student.teacherRef) {
        leftUnpaid += 1;
        console.log(
          `⚠️  skipped (no teacher assigned): ${student.studentId}`,
        );
        continue;
      }

      // Skip if a payment for this student+month+year already exists.
      const existing = await Payment.findOne({
        studentRef: student._id,
        month,
        year,
      });
      if (existing) {
        skippedExisting += 1;
        console.log(
          `⏭️  payment skipped (exists): ${student.studentId} → ${existing.status}`,
        );
        continue;
      }

      await Payment.create({
        studentRef: student._id,
        teacherRef: student.teacherRef,
        month,
        year,
        amount: student.monthlyFee ?? 0,
        status: 'paid',
        paidAt: new Date(),
      });
      created += 1;
      console.log(
        `✅ payment created: ${student.studentId} → paid ${student.monthlyFee ?? 0} BDT ` +
          `(${month}/${year})`,
      );
    }

    console.log('\n──────────────────────────────');
    console.log(
      `Payments seed complete (${month}/${year}) → paid created: +${created}, ` +
        `skipped existing: ${skippedExisting}, left unpaid: ${leftUnpaid}`,
    );
    console.log('──────────────────────────────');
  } catch (error) {
    console.error('❌ Failed to seed payments:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected.');
  }
}

seedPayments();
