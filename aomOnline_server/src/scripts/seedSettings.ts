/**
 * Settings Seeder
 *
 * Usage: npx ts-node src/scripts/seedSettings.ts  (or: npm run seed:settings)
 *
 * Idempotently creates/updates the SINGLE settings document with default AOM
 * Bangla content. Safe to re-run: if a settings doc already exists it is
 * updated in place; otherwise a new one is created. Mirrors the
 * dbConnect → upsert → mongoose.disconnect structure of seedAdmin/seedDemo.
 */

/* eslint-disable no-console */
import mongoose from 'mongoose';
import { dbConnect } from '../app/utils/dbConnect';
import { Settings } from '../app/modules/settings/settings.model';
import { ISettings } from '../app/modules/settings/settings.interface';

const defaultSettings: ISettings = {
  siteName: 'AOM অনলাইন মাদরাসা',
  tagline: 'ঘরে বসে বিশুদ্ধ দ্বীনি শিক্ষা',
  logo: '',
  phone: '+8801700000000',
  email: 'info@aom.com',
  address: 'ঢাকা, বাংলাদেশ',
  facebook: 'https://facebook.com/aomonline',
  youtube: 'https://youtube.com/@aomonline',
  whatsapp: '+8801700000000',
  aboutText:
    'AOM অনলাইন মাদরাসা একটি আধুনিক অনলাইন শিক্ষা প্রতিষ্ঠান, যেখানে দেশ-বিদেশের শিক্ষার্থীরা ঘরে বসেই অভিজ্ঞ উস্তাযদের তত্ত্বাবধানে বিশুদ্ধ কুরআন, হাদীস ও ইসলামী শিক্ষা অর্জন করতে পারে।',
  missionText:
    'আমাদের লক্ষ্য হলো প্রতিটি মুসলিম ঘরে সহজলভ্য, মানসম্পন্ন ও বিশুদ্ধ দ্বীনি শিক্ষা পৌঁছে দেওয়া এবং একটি আদর্শ প্রজন্ম গড়ে তোলা।',
  visionText:
    'আমাদের স্বপ্ন হলো একটি বিশ্বমানের অনলাইন মাদরাসা প্রতিষ্ঠা করা, যা কুরআন-সুন্নাহভিত্তিক জ্ঞান বিশ্বের প্রতিটি প্রান্তে ছড়িয়ে দেবে।',
  footerText:
    '© ২০২৬ AOM অনলাইন মাদরাসা। সর্বস্বত্ব সংরক্ষিত।',
  heroBadgeText: 'Trusted by 500+ Parents Worldwide',
  heroHeadingLine1: 'Quality Islamic',
  heroHeadingHighlight: 'Education',
  heroHeadingLine2: 'For Your Child',
  heroDescription:
    'Learn Quran, Arabic & Islamic Studies from the comfort of your home with qualified male & female teachers.',
  heroFeatures: [
    { icon: 'users', label: 'One to One Classes' },
    { icon: 'gender', label: 'Male & Female Teachers' },
    { icon: 'calendar', label: 'Flexible Schedule' },
    { icon: 'shield', label: 'Safe & Secure Environment' },
  ],
  heroPrimaryButtonText: 'Join as Student →',
  heroSecondaryButtonText: 'Join as Teacher',
  heroImage: '',
  heroQuoteText: '“Read in the name of your Lord who created.”',
  heroQuoteAttribution: '— Surah Al-Alaq, 1',
  heroTooltipTitle: 'Learn Anytime, Anywhere',
  heroTooltipSubtitle: 'Interactive classes with personal attention',
  classDemoBadgeText: 'Watch Our Live Class Demo',
  classDemoHeadingMain: 'Watch Our',
  classDemoHeadingHighlight: 'Live Class Demo',
  classDemoDescription:
    'Experience the best of both worlds – One-to-One personalized attention and interactive Group learning.',
  classDemoOneToOneTitle: 'ONE-TO-ONE CLASS',
  classDemoOneToOneImage: '',
  classDemoOneToOneFeatures: [
    { icon: 'users', label: 'Personalized Attention' },
    { icon: 'calendar', label: 'Flexible Schedule' },
    { icon: 'trending', label: 'Faster Progress' },
    { icon: 'shield', label: 'Focus on Individual Needs' },
  ],
  classDemoGroupTitle: 'GROUP CLASS',
  classDemoGroupImage: '',
  classDemoGroupFeatures: [
    { icon: 'chat', label: 'Interactive Learning' },
    { icon: 'users', label: 'Peer Motivation' },
    { icon: 'handshake', label: 'Learn Together' },
    { icon: 'shield', label: 'Affordable & Effective' },
  ],
};

async function seedSettings() {
  try {
    await dbConnect();

    const existing = await Settings.findOne();

    if (existing) {
      existing.set(defaultSettings);
      await existing.save();
      console.log('🔄 Existing settings document updated with default content.');
    } else {
      await Settings.create(defaultSettings);
      console.log('✅ Settings document created with default content.');
    }

    console.log(`   siteName: ${defaultSettings.siteName}`);
    console.log(`   tagline:  ${defaultSettings.tagline}`);
  } catch (error) {
    console.error('❌ Failed to seed settings:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected.');
  }
}

seedSettings();
