/**
 * Classes Seeder
 *
 * Usage: npx ts-node src/scripts/seedClasses.ts  (or: npm run seed:classes)
 *
 * Idempotently creates the four default AOM class/level records (কায়দা,
 * আমপারা, নাযেরা, হিফজ) with their monthly fees, order and the standard
 * milestone ladder (0/20/40/60/80/100). Safe to re-run: any class whose Bangla
 * `name` already exists is skipped.
 */

/* eslint-disable no-console */
import mongoose from 'mongoose';
import { dbConnect } from '../app/utils/dbConnect';
import { Class } from '../app/modules/class/class.model';
import { IClass, DEFAULT_MILESTONES } from '../app/modules/class/class.interface';

const defaultClasses: Omit<IClass, 'isActive'>[] = [
  {
    name: 'কায়দা',
    nameEn: 'Qaida',
    monthlyFee: 500,
    order: 1,
    milestones: DEFAULT_MILESTONES,
  },
  {
    name: 'আমপারা',
    nameEn: 'Ampara',
    monthlyFee: 600,
    order: 2,
    milestones: DEFAULT_MILESTONES,
  },
  {
    name: 'নাযেরা',
    nameEn: 'Nazera',
    monthlyFee: 700,
    order: 3,
    milestones: DEFAULT_MILESTONES,
  },
  {
    name: 'হিফজ',
    nameEn: 'Hifz',
    monthlyFee: 1000,
    order: 4,
    milestones: DEFAULT_MILESTONES,
  },
];

async function seedClasses() {
  let created = 0;
  let skipped = 0;

  try {
    await dbConnect();

    for (const c of defaultClasses) {
      const existing = await Class.findOne({ name: c.name });
      if (existing) {
        skipped += 1;
        console.log(`⏭️  skipped (exists): ${c.name}`);
        continue;
      }
      await Class.create({ ...c, isActive: true });
      created += 1;
      console.log(`✅ created: ${c.name} (${c.nameEn}) — ${c.monthlyFee} BDT`);
    }

    console.log('\n──────────────────────────────');
    console.log(`Classes seed complete → created: ${created}, skipped: ${skipped}`);
    console.log('──────────────────────────────');
  } catch (error) {
    console.error('❌ Failed to seed classes:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected.');
  }
}

seedClasses();
