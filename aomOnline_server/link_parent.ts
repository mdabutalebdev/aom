import mongoose from 'mongoose';
import { dbConnect } from './src/app/utils/dbConnect';
import { User } from './src/app/modules/user/user.model';
import { Teacher } from './src/app/modules/teacher/teacher.model';
import { Student } from './src/app/modules/student/student.model';

async function linkParent() {
  await dbConnect();
  
  // 1. Find Sakib (Teacher)
  const sakibUser = await User.findOne({ email: 'teacher2@aom.com' });
  const sakibTeacher = await Teacher.findOne({ userRef: sakibUser!._id });
  
  // 2. Find one unlinked student assigned to Sakib
  const student = await Student.findOne({ teacherRef: sakibTeacher!._id, userRef: null });
  if (!student) {
    console.log('No unlinked student found for Sakib');
    await mongoose.disconnect();
    return;
  }
  
  // 3. Find parent1 user
  const parentUser = await User.findOne({ email: 'parent1@aom.com' });
  
  // 4. Link parent1 to this student
  student.userRef = parentUser!._id;
  await student.save();
  
  console.log(`Successfully linked parent1@aom.com to student: ${student.name}`);
  await mongoose.disconnect();
}
linkParent();
