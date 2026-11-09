/**
 * Demo Data Seeder
 *
 * Usage: npx ts-node src/scripts/seedDemo.ts  (or: npm run seed:demo)
 *
 * Idempotently inserts demo USER accounts (admin / teacher / student / parent)
 * so the auth & user-management features can be exercised with realistic data.
 * Passwords are hashed by the User model's pre-save hook. Safe to re-run: any
 * account whose email already exists is skipped.
 *
 * Demo password for every account below: Demo@123
 * (superAdmin is seeded separately by seed:admin.)
 */

/* eslint-disable no-console */
import mongoose from 'mongoose';
import { dbConnect } from '../app/utils/dbConnect';
import { User } from '../app/modules/user/user.model';
import { IUser } from '../app/modules/user/user.interface';

const DEMO_PASSWORD = 'Demo@123';

const demoUsers: Omit<IUser, 'isActive'>[] = [
  // ── Admin ────────────────────────────────────────────────
  { name: 'Admin', email: 'admin@aom.com', password: DEMO_PASSWORD, phone: '01710000001', role: 'admin' },

  // ── Teachers ─────────────────────────────────────────────
  { name: 'মাওলানা আব্দুল করিম', email: 'teacher1@aom.com', password: DEMO_PASSWORD, phone: '01710000011', role: 'teacher' },
  { name: 'উস্তাযা ফাতিমা আক্তার', email: 'teacher2@aom.com', password: DEMO_PASSWORD, phone: '01710000012', role: 'teacher' },
  { name: 'মাওলানা রফিকুল ইসলাম', email: 'teacher3@aom.com', password: DEMO_PASSWORD, phone: '01710000013', role: 'teacher' },

  // ── Students ─────────────────────────────────────────────
  { name: 'আব্দুল্লাহ আল মামুন', email: 'student1@aom.com', password: DEMO_PASSWORD, phone: '01710000021', role: 'student' },
  { name: 'খাদিজা খাতুন', email: 'student2@aom.com', password: DEMO_PASSWORD, phone: '01710000022', role: 'student' },
  { name: 'আহমেদ রিয়াদ', email: 'student3@aom.com', password: DEMO_PASSWORD, phone: '01710000023', role: 'student' },
  { name: 'মারিয়াম আক্তার', email: 'student4@aom.com', password: DEMO_PASSWORD, phone: '01710000024', role: 'student' },
  { name: 'মুহাম্মদ ইলিয়াস', email: 'student5@aom.com', password: DEMO_PASSWORD, phone: '01710000025', role: 'student' },
  { name: 'রায়হানা আক্তার', email: 'student6@aom.com', password: DEMO_PASSWORD, phone: '01710000026', role: 'student' },

  // ── Parent ───────────────────────────────────────────────
  { name: 'করিম উদ্দিন (অভিভাবক)', email: 'parent1@aom.com', password: DEMO_PASSWORD, phone: '01710000031', role: 'parent' },
];

async function seedDemo() {
  let created = 0;
  let skipped = 0;

  try {
    await dbConnect();

    for (const u of demoUsers) {
      const email = u.email.toLowerCase();
      const existing = await User.findOne({ email });
      if (existing) {
        skipped += 1;
        console.log(`⏭️  skipped (exists): ${email}`);
        continue;
      }
      // Password hashed by the User pre-save hook.
      await User.create({ ...u, email, isActive: true });
      created += 1;
      console.log(`✅ created: ${email.padEnd(22)} [${u.role}]`);
    }

    console.log('\n──────────────────────────────');
    console.log(`Demo seed complete → created: ${created}, skipped: ${skipped}`);
    console.log(`All demo accounts password: ${DEMO_PASSWORD}`);
    console.log('──────────────────────────────');
  } catch (error) {
    console.error('❌ Failed to seed demo data:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected.');
  }
}

seedDemo();
