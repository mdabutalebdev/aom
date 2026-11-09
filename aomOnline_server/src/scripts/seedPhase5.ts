/**
 * Phase 5 Demo Data Seeder (Teachers + Students)
 *
 * Usage: npx ts-node src/scripts/seedPhase5.ts  (or: npm run seed:phase5)
 *
 * Idempotently creates realistic demo domain data on top of the existing demo
 * Users (seed:demo) and Classes (seed:classes):
 *
 *   • Teacher profiles for the 3 demo teacher Users (teacher1/2/3@aom.com) →
 *     TCH-001 / TCH-002 / TCH-003, each ratePerStudent 300, subject কুরআন.
 *   • ~24 Student profiles (Bangla names) spread across the 3 teachers × 4
 *     classes; each student's monthlyFee is taken from its assigned class.
 *   • The 6 demo student Users (student1-6@aom.com) are linked (userRef) to the
 *     first 6 student profiles by matching name; the rest are profile-only.
 *
 * Prerequisites (run first): seed:demo (Users) + seed:classes (Classes).
 * Safe to re-run: a teacher/student is skipped if its teacherId/studentId — or
 * (for teachers) its userRef — already exists.
 */

/* eslint-disable no-console */
import mongoose from 'mongoose';
import { dbConnect } from '../app/utils/dbConnect';
import { User } from '../app/modules/user/user.model';
import { Class } from '../app/modules/class/class.model';
import { Teacher } from '../app/modules/teacher/teacher.model';
import { Student } from '../app/modules/student/student.model';

// ── Teacher seed plan (email → teacherId) ──────────────────
const teacherPlan = [
  { email: 'teacher1@aom.com', teacherId: 'TCH-001', subject: 'কুরআন', ratePerStudent: 300 },
  { email: 'teacher2@aom.com', teacherId: 'TCH-002', subject: 'কুরআন', ratePerStudent: 300 },
  { email: 'teacher3@aom.com', teacherId: 'TCH-003', subject: 'কুরআন', ratePerStudent: 300 },
];

// ── 24 student names (Bangla) ──────────────────────────────
// The first 6 are matched to the demo student Users (student1-6@aom.com) by
// name so those profiles get a linked login account.
const studentNames = [
  // Linked to demo student Users (student1-6):
  'আব্দুল্লাহ আল মামুন', // student1
  'খাদিজা খাতুন', // student2
  'আহমেদ রিয়াদ', // student3
  'মারিয়াম আক্তার', // student4
  'মুহাম্মদ ইলিয়াস', // student5
  'রায়হানা আক্তার', // student6
  // Profile-only students:
  'ইব্রাহিম হোসেন',
  'সুমাইয়া আক্তার',
  'ইউসুফ আহমেদ',
  'জয়নব বিনতে আলী',
  'হাসান মাহমুদ',
  'ফাতিমা তুজ জোহরা',
  'বিলাল উদ্দিন',
  'আয়েশা সিদ্দিকা',
  'উমর ফারুক',
  'হাফসা বেগম',
  'তালহা জুবায়ের',
  'রুকাইয়া ইসলাম',
  'সাদ ইবনে আবী',
  'জুওয়াইরিয়া নূর',
  'আনাস করিম',
  'সাফিয়া রহমান',
  'মুয়াজ ইবনে জাবাল',
  'উম্মে কুলসুম',
];

// Guardian names paired positionally with the students above.
const guardianNames = [
  'করিম উদ্দিন', 'আব্দুল হক', 'নূরুল ইসলাম', 'শাহ আলম', 'জাহাঙ্গীর আলম',
  'মোস্তাফিজুর রহমান', 'আবুল কালাম', 'সিরাজুল ইসলাম', 'আমিনুল হক', 'রফিকুল ইসলাম',
  'মিজানুর রহমান', 'হাবিবুর রহমান', 'শফিকুল ইসলাম', 'নজরুল ইসলাম', 'আনোয়ার হোসেন',
  'বেলাল হোসেন', 'কামরুল হাসান', 'জসিম উদ্দিন', 'সোহেল রানা', 'দেলোয়ার হোসেন',
  'ফজলুল করিম', 'মাহবুবুর রহমান', 'সাইফুল ইসলাম', 'তৌহিদুল ইসলাম',
];

// Map the first 6 student names → the demo student User emails.
const studentUserEmailByName: Record<string, string> = {
  'আব্দুল্লাহ আল মামুন': 'student1@aom.com',
  'খাদিজা খাতুন': 'student2@aom.com',
  'আহমেদ রিয়াদ': 'student3@aom.com',
  'মারিয়াম আক্তার': 'student4@aom.com',
  'মুহাম্মদ ইলিয়াস': 'student5@aom.com',
  'রায়হানা আক্তার': 'student6@aom.com',
};

// Deterministic studentId generator scoped to the current year — computed from
// the current max so re-runs continue the sequence rather than colliding.
async function nextStudentId(year: number): Promise<string> {
  const prefix = `AOM${year}`;
  const last = await Student.findOne({ studentId: new RegExp(`^${prefix}\\d{3}$`) })
    .sort({ studentId: -1 })
    .select('studentId')
    .lean();
  let n = 1;
  if (last?.studentId) {
    const cur = parseInt(last.studentId.replace(prefix, ''), 10);
    if (!Number.isNaN(cur)) n = cur + 1;
  }
  return `${prefix}${String(n).padStart(3, '0')}`;
}

async function seedPhase5() {
  let teachersCreated = 0;
  let teachersSkipped = 0;
  let studentsCreated = 0;
  let studentsSkipped = 0;

  try {
    await dbConnect();

    // ── 1) Teachers ────────────────────────────────────────
    const teacherDocByEmail: Record<string, mongoose.Types.ObjectId> = {};

    for (const t of teacherPlan) {
      const user = await User.findOne({ email: t.email.toLowerCase() });
      if (!user) {
        console.log(`⚠️  teacher User not found (run seed:demo first): ${t.email}`);
        continue;
      }

      // Skip if a profile already exists for this user or teacherId.
      const existing = await Teacher.findOne({
        $or: [{ userRef: user._id }, { teacherId: t.teacherId }],
      });
      if (existing) {
        teacherDocByEmail[t.email] = existing._id as mongoose.Types.ObjectId;
        teachersSkipped += 1;
        console.log(`⏭️  teacher skipped (exists): ${t.email} → ${existing.teacherId}`);
        continue;
      }

      const created = await Teacher.create({
        userRef: user._id,
        teacherId: t.teacherId,
        subject: t.subject,
        ratePerStudent: t.ratePerStudent,
        phone: user.phone,
        isActive: true,
      });
      teacherDocByEmail[t.email] = created._id as mongoose.Types.ObjectId;
      teachersCreated += 1;
      console.log(`✅ teacher created: ${t.email} → ${t.teacherId}`);
    }

    // ── 2) Classes (must exist from seed:classes) ──────────
    const classes = await Class.find().sort({ order: 1 }).lean();
    if (classes.length === 0) {
      throw new Error('No classes found — run seed:classes before seed:phase5.');
    }

    const teacherIds = teacherPlan
      .map((t) => teacherDocByEmail[t.email])
      .filter((id): id is mongoose.Types.ObjectId => Boolean(id));
    if (teacherIds.length === 0) {
      throw new Error('No teacher profiles available — run seed:demo before seed:phase5.');
    }

    // ── 3) Students ────────────────────────────────────────
    const year = new Date().getFullYear();

    for (let i = 0; i < studentNames.length; i += 1) {
      const name = studentNames[i];

      // If a profile with this exact name already exists, skip it.
      const existing = await Student.findOne({ name });
      if (existing) {
        studentsSkipped += 1;
        console.log(`⏭️  student skipped (exists): ${name} → ${existing.studentId}`);
        continue;
      }

      // Spread deterministically across teachers × classes.
      const teacherRef = teacherIds[i % teacherIds.length];
      const cls = classes[i % classes.length];

      // Link a demo student User for the first 6 names.
      let userRef: mongoose.Types.ObjectId | undefined;
      const linkedEmail = studentUserEmailByName[name];
      if (linkedEmail) {
        const su = await User.findOne({ email: linkedEmail.toLowerCase() });
        if (su) userRef = su._id as mongoose.Types.ObjectId;
      }

      const studentId = await nextStudentId(year);

      await Student.create({
        userRef,
        studentId,
        name,
        teacherRef,
        classRef: cls._id,
        guardianName: guardianNames[i],
        guardianPhone: `0172000${String(1000 + i).slice(-4)}`,
        monthlyFee: cls.monthlyFee, // derived from the assigned class
        status: 'active',
      });
      studentsCreated += 1;
      console.log(
        `✅ student created: ${studentId} ${name} → class ${cls.name} (${cls.monthlyFee} BDT)` +
          (userRef ? ` [linked ${linkedEmail}]` : ''),
      );
    }

    console.log('\n──────────────────────────────');
    console.log(
      `Phase 5 seed complete → teachers: +${teachersCreated}/skip ${teachersSkipped}, ` +
        `students: +${studentsCreated}/skip ${studentsSkipped}`,
    );
    console.log('──────────────────────────────');
  } catch (error) {
    console.error('❌ Failed to seed Phase 5 data:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected.');
  }
}

seedPhase5();
