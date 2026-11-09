import mongoose from 'mongoose';
import { dbConnect } from './src/app/utils/dbConnect';
import { User } from './src/app/modules/user/user.model';

async function updatePassword() {
  await dbConnect();
  const user = await User.findOne({ email: 'teacher2@aom.com' });
  if (user) {
    user.password = 'Demo@123';
    await user.save();
    console.log('Password reset successfully to Demo@123');
  }
  await mongoose.disconnect();
}
updatePassword();
