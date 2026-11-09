/**
 * Phase 8 Demo Data Seeder (Progress + Materials + milestone notifications)
 *
 * Usage: npx ts-node src/scripts/seedPhase8.ts  (or: npm run seed:phase8)
 *
 * Idempotently creates:
 *   • A Progress doc for every seeded Student (24). Percentage cycles by index
 *     (100/80/60/40/20/…) but AOM2026001 is forced to 100% (Qaida complete —
 *     matches the Phase-9 mockup). classRef = the student's class;
 *     completedMilestones is recomputed from that class's milestone ladder;
 *     updatedBy = the student's teacher's userRef.
 *   • A 'milestone' Notification for every student that reaches 100% AND has a
 *     linked login (userRef) — the same message the runtime hook produces.
 *   • 6 sample Materials across file types (pdf/excel/image/other) with
 *     placeholder Cloudinary URLs, assigned to various classes (one is
 *     class-agnostic), owned by a real Teacher/User.
 *
 * Prerequisites (run first): seed:classes, seed:phase5 (Teachers + Students).
 * Safe to re-run: a Progress doc is skipped if one already exists for the
 * student; a Material is skipped if one with the same title already exists.
 *
 * dbConnect → work → disconnect. Does NOT touch attendance/payments.
 */

/* eslint-disable no-console */
import mongoose from 'mongoose';
import { dbConnect } from '../app/utils/dbConnect';
import { Class } from '../app/modules/class/class.model';
import { Teacher } from '../app/modules/teacher/teacher.model';
import { Student } from '../app/modules/student/student.model';
import { Progress } from '../app/modules/progress/progress.model';
import { Material } from '../app/modules/material/material.model';
import { Notification } from '../app/modules/notification/notification.model';
import { IMilestone } from '../app/modules/class/class.interface';

// Percentage cycle by student index (0-based). AOM2026001 (index 0) is 100%.
const PERCENT_CYCLE = [100, 80, 60, 40, 20, 100, 80, 60];

interface IStudentLean {
  _id: mongoose.Types.ObjectId;
  studentId: string;
  name: string;
  userRef?: mongoose.Types.ObjectId;
  teacherRef?: mongoose.Types.ObjectId;
  classRef?: mongoose.Types.ObjectId;
}

async function seedPhase8() {
  let progressCreated = 0;
  let progressSkipped = 0;
  let notificationsCreated = 0;
  let materialsCreated = 0;
  let materialsSkipped = 0;

  try {
    await dbConnect();

    // ── Reference data ──────────────────────────────────────
    const students = await Student.find({})
      .select('studentId name userRef teacherRef classRef')
      .sort({ studentId: 1 })
      .lean<IStudentLean[]>();

    if (students.length === 0) {
      throw new Error(
        'No students found — run seed:classes + seed:phase5 first.',
      );
    }

    const classes = await Class.find({})
      .select('name milestones')
      .lean<
        {
          _id: mongoose.Types.ObjectId;
          name: string;
          milestones: IMilestone[];
        }[]
      >();
    const classById = new Map(classes.map((c) => [String(c._id), c]));

    // Resolve each teacher's userRef once (updatedBy uses the login account).
    const teachers = await Teacher.find({})
      .select('userRef')
      .lean<
        { _id: mongoose.Types.ObjectId; userRef: mongoose.Types.ObjectId }[]
      >();
    const userRefByTeacher = new Map(
      teachers.map((t) => [String(t._id), t.userRef]),
    );

    // ── 1) Progress (+ milestone notifications for 100% students) ──
    for (let i = 0; i < students.length; i += 1) {
      const student = students[i];

      // Idempotent: skip if a progress doc already exists for this student.
      const existing = await Progress.findOne({ studentRef: student._id })
        .select('_id')
        .lean();
      if (existing) {
        progressSkipped += 1;
        console.log(`⏭️  progress skipped (exists): ${student.studentId}`);
        continue;
      }

      // Force AOM2026001 → 100%; everyone else cycles by index.
      const percentage =
        student.studentId === 'AOM2026001'
          ? 100
          : PERCENT_CYCLE[i % PERCENT_CYCLE.length];

      // Recompute completedMilestones from the student's class ladder.
      const cls = student.classRef
        ? classById.get(String(student.classRef))
        : undefined;
      const milestones = [...(cls?.milestones ?? [])].sort(
        (a, b) => a.percent - b.percent,
      );
      const completedMilestones = milestones
        .filter((m) => m.percent <= percentage)
        .map((m) => m.percent);

      const updatedBy = student.teacherRef
        ? userRefByTeacher.get(String(student.teacherRef))
        : undefined;

      await Progress.create({
        studentRef: student._id,
        classRef: student.classRef ?? null,
        percentage,
        completedMilestones,
        updatedBy,
      });
      progressCreated += 1;
      console.log(
        `✅ progress: ${student.studentId} → ${percentage}% ` +
          `(${cls?.name ?? 'no class'}, milestones [${completedMilestones.join(', ')}])`,
      );

      // Milestone notification for a 100% student with a linked login.
      if (percentage >= 100 && student.userRef) {
        const label = cls?.name ?? '';
        await Notification.create({
          userRef: student.userRef,
          title: 'মাইলস্টোন অর্জন',
          message: `অভিনন্দন! আপনি ${label} লেভেল সম্পন্ন করেছেন!`,
          type: 'milestone',
          meta: {
            studentRef: student._id,
            classRef: student.classRef ?? null,
            percent: 100,
          },
        });
        notificationsCreated += 1;
        console.log(
          `   🔔 milestone notification → ${student.studentId} (${label} 100%)`,
        );
      }
    }

    // ── 2) Sample materials ─────────────────────────────────
    // Pick a real teacher + its userRef to own the sample materials.
    const anyTeacher = teachers[0];
    if (!anyTeacher) {
      throw new Error('No teachers found — run seed:phase5 first.');
    }
    const ownerTeacherRef = anyTeacher._id;
    const ownerUserRef = anyTeacher.userRef;

    // Look up classes by Bangla name for targeted assignment.
    const classByName = new Map(classes.map((c) => [c.name, c._id]));

    const materialPlan: {
      title: string;
      description?: string;
      fileUrl: string;
      fileType: 'excel' | 'pdf' | 'image' | 'video' | 'other';
      className?: string; // undefined → class-agnostic (all classes)
    }[] = [
      {
        title: 'কায়দা অনুশীলন শীট',
        description: 'কায়দা লেভেলের অক্ষর অনুশীলন (PDF)',
        fileUrl: 'https://res.cloudinary.com/demo/raw/upload/aom/qaida-practice.pdf',
        fileType: 'pdf',
        className: 'কায়দা',
      },
      {
        title: 'আমপারা তিলাওয়াত গাইড',
        description: 'আমপারা সূরাসমূহের তিলাওয়াত নির্দেশিকা',
        fileUrl: 'https://res.cloudinary.com/demo/raw/upload/aom/ampara-guide.pdf',
        fileType: 'pdf',
        className: 'আমপারা',
      },
      {
        title: 'হিফজ অগ্রগতি ট্র্যাকার',
        description: 'সাপ্তাহিক হিফজ অগ্রগতির এক্সেল শীট',
        fileUrl: 'https://res.cloudinary.com/demo/raw/upload/aom/hifz-tracker.xlsx',
        fileType: 'excel',
        className: 'হিফজ',
      },
      {
        title: 'তাজবীদ চার্ট',
        description: 'তাজবীদের নিয়মাবলীর রঙিন চার্ট (ছবি)',
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/aom/tajweed-chart.png',
        fileType: 'image',
        className: 'নাযেরা',
      },
      {
        title: 'মাদরাসা সময়সূচি',
        description: 'সকল ক্লাসের জন্য সাধারণ সময়সূচি',
        fileUrl: 'https://res.cloudinary.com/demo/raw/upload/aom/timetable.pdf',
        fileType: 'pdf',
        // class-agnostic → visible to all classes
      },
      {
        title: 'দোয়া ও আদব হ্যান্ডআউট',
        description: 'দৈনন্দিন দোয়া ও আদব সংকলন',
        fileUrl: 'https://res.cloudinary.com/demo/raw/upload/aom/dua-adab.docx',
        fileType: 'other',
        // class-agnostic
      },
    ];

    for (const m of materialPlan) {
      // Idempotent: skip if a material with this title already exists.
      const existing = await Material.findOne({ title: m.title })
        .select('_id')
        .lean();
      if (existing) {
        materialsSkipped += 1;
        console.log(`⏭️  material skipped (exists): ${m.title}`);
        continue;
      }

      const classRef = m.className ? classByName.get(m.className) ?? null : null;

      await Material.create({
        title: m.title,
        description: m.description,
        fileUrl: m.fileUrl,
        fileType: m.fileType,
        classRef,
        teacherRef: ownerTeacherRef,
        uploadedBy: ownerUserRef,
        isActive: true,
      });
      materialsCreated += 1;
      console.log(
        `✅ material: ${m.title} [${m.fileType}] → ${m.className ?? 'all classes'}`,
      );
    }

    console.log('\n──────────────────────────────');
    console.log(
      `Phase 8 seed complete → progress: +${progressCreated}/skip ${progressSkipped}, ` +
        `milestone notifications: +${notificationsCreated}, ` +
        `materials: +${materialsCreated}/skip ${materialsSkipped}`,
    );
    console.log('──────────────────────────────');
  } catch (error) {
    console.error('❌ Failed to seed Phase 8 data:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected.');
  }
}

seedPhase8();
