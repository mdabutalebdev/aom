import { FilterQuery, Types } from 'mongoose';
import { Teacher } from './teacher.model';
import { ITeacher } from './teacher.interface';
import { User } from '../user/user.model';
import { createUserAccount } from '../user/user.service';
import { Student } from '../student/student.model';
import { sumTeacherPayout } from './teacher.utils';

interface IListQuery {
  search?: string;
  page?: string;
  limit?: string;
}

interface IListResult {
  data: unknown[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Generate the next sequential teacherId ('TCH-001', 'TCH-002', …) from the
// current maximum. Uses a descending sort on teacherId; ids are zero-padded so
// lexicographic order matches numeric order within the same width.
const generateTeacherId = async (): Promise<string> => {
  const last = await Teacher.findOne({ teacherId: /^TCH-\d+$/ })
    .sort({ teacherId: -1 })
    .select('teacherId')
    .lean();

  let nextNumber = 1;
  if (last?.teacherId) {
    const current = parseInt(last.teacherId.replace('TCH-', ''), 10);
    if (!Number.isNaN(current)) {
      nextNumber = current + 1;
    }
  }
  return `TCH-${String(nextNumber).padStart(3, '0')}`;
};

// Count active/all students assigned to a given teacher.
const countStudents = async (teacherRef: Types.ObjectId): Promise<number> => {
  return Student.countDocuments({ teacherRef });
};

// Kept as a local alias so the call sites below read unchanged; the formula
// itself now lives in teacher.utils.ts (see the note there about the three
// copies that had drifted apart).
const sumNextMonthSalary = sumTeacherPayout;

// GET /api/teachers — admin: paginated, searchable list (+ studentCount).
const getAllTeachers = async (query: IListQuery): Promise<IListResult> => {
  const { search } = query;

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  const filter: FilterQuery<ITeacher> = {};

  // Search across teacherId/subject/phone directly, and across the linked
  // user's name/email by first resolving matching user ids.
  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    })
      .select('_id')
      .lean();
    const userIds = users.map((u) => u._id);

    filter.$or = [
      { teacherId: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { userRef: { $in: userIds } },
    ];
  }

  const [teachers, total] = await Promise.all([
    Teacher.find(filter)
      .populate('userRef', 'name email phone +rawPassword')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Teacher.countDocuments(filter),
  ]);

  // Attach a derived studentCount + nextMonthSalary to each teacher.
  const data = await Promise.all(
    teachers.map(async (t) => ({
      ...t,
      studentCount: await countStudents(t._id as Types.ObjectId),
      nextMonthSalary: await sumNextMonthSalary(
        t._id as Types.ObjectId,
        t.ratePerStudent ?? 0,
      ),
    })),
  );

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// GET /api/teachers/:id — admin: single teacher (+ studentCount).
const getTeacherById = async (id: string): Promise<unknown> => {
  const teacher = await Teacher.findById(id)
    .populate('userRef', 'name email phone +rawPassword')
    .lean();
  if (!teacher) {
    throw Object.assign(new Error('Teacher not found'), { status: 404 });
  }
  const studentCount = await countStudents(teacher._id as Types.ObjectId);
  const nextMonthSalary = await sumNextMonthSalary(
    teacher._id as Types.ObjectId,
    teacher.ratePerStudent ?? 0,
  );
  return { ...teacher, studentCount, nextMonthSalary };
};

// POST /api/teachers — admin: create a User (role 'teacher') + Teacher profile.
const createTeacher = async (payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  subject?: string;
  ratePerStudent: number;
  photo?: string;
  address?: string;
  bio?: string;
}): Promise<unknown> => {
  // Create the login account (password hashed by the User pre-save hook).
  const createdUser = await createUserAccount({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    photo: payload.photo,
    password: payload.password,
    role: 'teacher',
  });

  const teacherId = await generateTeacherId();

  try {
    const teacher = await Teacher.create({
      userRef: createdUser._id,
      teacherId,
      photo: payload.photo,
      subject: payload.subject,
      ratePerStudent: payload.ratePerStudent,
      phone: payload.phone,
      address: payload.address,
      bio: payload.bio,
    });

    const populated = await Teacher.findById(teacher._id)
      .populate('userRef', 'name email phone +rawPassword')
      .lean();
    return { ...populated, studentCount: 0, nextMonthSalary: 0 };
  } catch (error) {
    // Roll back the orphaned User if the profile insert fails.
    await User.findByIdAndDelete(createdUser._id);
    throw error;
  }
};

// PATCH /api/teachers/:id — admin: update profile (+ optionally linked user).
const updateTeacher = async (
  id: string,
  payload: {
    name?: string;
    phone?: string;
    password?: string;
    subject?: string;
    ratePerStudent?: number;
    photo?: string;
    address?: string;
    bio?: string;
    isActive?: boolean;
  },
): Promise<unknown> => {
  const teacher = await Teacher.findById(id);
  if (!teacher) {
    throw Object.assign(new Error('Teacher not found'), { status: 404 });
  }

  const { name, password, ...profileFields } = payload;

  // Update the linked User's name/phone/password when supplied.
  if (name !== undefined || profileFields.phone !== undefined || password !== undefined) {
    const userToUpdate = await User.findById(teacher.userRef);
    if (userToUpdate) {
      if (name !== undefined) userToUpdate.name = name;
      if (profileFields.phone !== undefined) userToUpdate.phone = profileFields.phone;
      if (password !== undefined) {
        userToUpdate.password = password;
        userToUpdate.rawPassword = password;
      }
      await userToUpdate.save(); // using .save() to trigger password hashing pre-save hook
    }
  }

  // Update the Teacher profile fields.
  Object.assign(teacher, profileFields);
  await teacher.save();

  const populated = await Teacher.findById(teacher._id)
    .populate('userRef', 'name email phone +rawPassword')
    .lean();
  const studentCount = await countStudents(teacher._id as Types.ObjectId);
  const nextMonthSalary = await sumNextMonthSalary(
    teacher._id as Types.ObjectId,
    (populated?.ratePerStudent as number | undefined) ?? 0,
  );
  return { ...populated, studentCount, nextMonthSalary };
};

// DELETE /api/teachers/:id — admin: delete profile + deactivate linked User.
// We deactivate (isActive=false) rather than delete the User so historical
// references (e.g. Phase 6 salary/payment records) remain intact.
const deleteTeacher = async (id: string): Promise<ITeacher> => {
  const teacher = await Teacher.findByIdAndDelete(id);
  if (!teacher) {
    throw Object.assign(new Error('Teacher not found'), { status: 404 });
  }
  // Deactivate the linked login account.
  await User.findByIdAndUpdate(teacher.userRef, { isActive: false });
  return teacher;
};

export const TeacherService = {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  generateTeacherId,
};
