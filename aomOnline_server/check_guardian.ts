import mongoose from 'mongoose';
import { dbConnect } from './src/app/utils/dbConnect';
import { User } from './src/app/modules/user/user.model';
import { Teacher } from './src/app/modules/teacher/teacher.model';
import { Student } from './src/app/modules/student/student.model';
import { Parent } from './src/app/modules/parent/parent.model';

async function check() {
  await dbConnect();
  
  // Find Sakib
  const sakibUser = await User.findOne({ email: 'teacher2@aom.com' });
  if (!sakibUser) { console.log('Sakib user not found'); return; }
  
  const sakibTeacher = await Teacher.findOne({ userRef: sakibUser._id });
  if (!sakibTeacher) { console.log('Sakib teacher profile not found'); return; }
  
  // Find students assigned to Sakib
  const students = await Student.find({ teacherRef: sakibTeacher._id }).populate('userRef');
  console.log('Students assigned to Sakib:', students.map(s => s.name));
  
  // Let's find one of these students that actually has a linked User account, so the parent can log in.
  // Wait, does the guardian login use the Parent collection or the User collection with role parent?
  // Let's check Parent collection if it exists, or User collection
  const parentUsers = await User.find({ role: 'parent' });
  console.log('All parent users:', parentUsers.map(p => ({ email: p.email, name: p.name })));

  // Try to find if there is a Parent collection
  try {
    const parentProfiles = await mongoose.model('Parent').find();
    console.log('Parent profiles:', parentProfiles);
  } catch (e) {
    console.log('No Parent model registered or error:', e.message);
  }

  await mongoose.disconnect();
}
check();
