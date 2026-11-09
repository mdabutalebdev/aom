/**
 * Admin Seeder Script
 *
 * Usage: npx ts-node src/scripts/seedAdmin.ts  (or: npm run seed:admin)
 *
 * Idempotently upserts ONE superAdmin account from env
 * SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD (defaults: superadmin@aom.com /
 * Admin@12345). The password is hashed via the User model's pre-save hook.
 */

/* eslint-disable no-console */
import mongoose from 'mongoose';
import config from '../app/config';
import { dbConnect } from '../app/utils/dbConnect';
import { User } from '../app/modules/user/user.model';

async function seedAdmin() {
  const email = config.super_admin.email.toLowerCase();
  const password = config.super_admin.password;

  try {
    await dbConnect();

    const existing = await User.findOne({ email });
    if (existing) {
      // Ensure the existing account is a superAdmin and active.
      if (existing.role !== 'superAdmin' || !existing.isActive) {
        existing.role = 'superAdmin';
        existing.isActive = true;
        await existing.save();
        console.log(`🔄 Existing user '${email}' upgraded to active superAdmin.`);
      } else {
        console.log(`✅ superAdmin '${email}' already exists — nothing to do.`);
      }
      return;
    }

    // Password is hashed by the User pre-save hook.
    await User.create({
      name: 'Super Admin',
      email,
      password,
      role: 'superAdmin',
      isActive: true,
    });

    console.log('✅ superAdmin created successfully!');
    console.log(`   email:    ${email}`);
    console.log(`   password: ${password}`);
  } catch (error) {
    console.error('❌ Failed to seed superAdmin:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected.');
  }
}

seedAdmin();
