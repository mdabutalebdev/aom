/**
 * Phase 7 Demo Data Seeder (Attendance)
 *
 * Usage: npx ts-node src/scripts/seedAttendance.ts  (or: npm run seed:attendance)
 *
 * Idempotently marks daily attendance for every seeded student across a fixed
 * demo window so the Phase-9 student calendar has realistic data:
 *   • June 2026 (full month, days 1–30)
 *   • July 2026 days 1–3
 *
 * Rules, per (student, day):
 *   • Friday  → 'holiday'
 *   • else    → weighted random: present ~85% / absent ~10% / leave ~5%
 * markedBy = the student's teacher's userRef (the login account behind the
 * Teacher profile). date is stored normalized to start-of-day UTC.
 *
 * Prerequisites (run first): seed:phase5 (Teachers + Students).
 * Safe to re-run: a (student, day) is skipped if a record already exists.
 */

/* eslint-disable no-console */
import mongoose from 'mongoose';
import { dbConnect } from '../app/utils/dbConnect';
import { Student } from '../app/modules/student/student.model';
import { Teacher } from '../app/modules/teacher/teacher.model';
import { Attendance } from '../app/modules/attendance/attendance.model';
import { TAttendanceStatus } from '../app/modules/attendance/attendance.interface';
import { normalizeToStartOfDayUTC } from '../app/modules/attendance/attendance.utils';

// Build the list of demo days (start-of-day UTC): June 1–30 + July 1–3, 2026.
function buildDemoDays(): Date[] {
  const days: Date[] = [];
  for (let d = 1; d <= 30; d += 1) {
    days.push(new Date(Date.UTC(2026, 5, d))); // month 5 = June
  }
  for (let d = 1; d <= 3; d += 1) {
    days.push(new Date(Date.UTC(2026, 6, d))); // month 6 = July
  }
  return days;
}

// Weighted pick for a non-holiday day: present 85%, absent 10%, leave 5%.
function weightedStatus(): TAttendanceStatus {
  const r = Math.random();
  if (r < 0.85) return 'present';
  if (r < 0.95) return 'absent';
  return 'leave';
}

async function seedAttendance() {
  let created = 0;
  let skippedExisting = 0;
  let skippedNoTeacher = 0;

  try {
    await dbConnect();

    const days = buildDemoDays();

    // Deterministic order for stable, readable logs.
    const students = await Student.find({})
      .select('studentId teacherRef')
      .sort({ studentId: 1 })
      .lean();

    if (students.length === 0) {
      throw new Error(
        'No students found — run seed:phase5 before seed:attendance.',
      );
    }

    // Resolve each teacher's userRef once (markedBy uses the login account).
    const teachers = await Teacher.find({})
      .select('userRef')
      .lean<{ _id: mongoose.Types.ObjectId; userRef: mongoose.Types.ObjectId }[]>();
    const userRefByTeacher = new Map(
      teachers.map((t) => [String(t._id), t.userRef]),
    );

    for (const student of students) {
      if (!student.teacherRef) {
        skippedNoTeacher += 1;
        console.log(`⚠️  skipped (no teacher assigned): ${student.studentId}`);
        continue;
      }

      const markedBy = userRefByTeacher.get(String(student.teacherRef));
      if (!markedBy) {
        skippedNoTeacher += 1;
        console.log(
          `⚠️  skipped (teacher userRef not found): ${student.studentId}`,
        );
        continue;
      }

      let studentCreated = 0;
      let studentSkipped = 0;

      for (const rawDay of days) {
        const date = normalizeToStartOfDayUTC(rawDay);

        // Skip if a record for this student+day already exists (idempotent).
        const existing = await Attendance.findOne({
          studentRef: student._id,
          date,
        }).lean();
        if (existing) {
          studentSkipped += 1;
          skippedExisting += 1;
          continue;
        }

        // Friday → holiday, else weighted present/absent/leave.
        // getUTCDay(): 0=Sun … 5=Fri … 6=Sat.
        const status: TAttendanceStatus =
          date.getUTCDay() === 5 ? 'holiday' : weightedStatus();

        await Attendance.create({
          studentRef: student._id,
          teacherRef: student.teacherRef,
          date,
          status,
          markedBy,
        });
        studentCreated += 1;
        created += 1;
      }

      console.log(
        `✅ ${student.studentId}: +${studentCreated} marked, ${studentSkipped} skipped`,
      );
    }

    console.log('\n──────────────────────────────');
    console.log(
      `Attendance seed complete (Jun 1–30 + Jul 1–3, 2026) → created: +${created}, ` +
        `skipped existing: ${skippedExisting}, skipped no-teacher: ${skippedNoTeacher}`,
    );
    console.log('──────────────────────────────');
  } catch (error) {
    console.error('❌ Failed to seed attendance:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected.');
  }
}

seedAttendance();
