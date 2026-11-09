import { FilterQuery } from 'mongoose';
import { User } from './user.model';
import { IUser, TUserRole } from './user.interface';
import { Teacher } from '../teacher/teacher.model';

interface IListQuery {
  search?: string;
  role?: string;
  status?: string;
  page?: string;
  limit?: string;
}

interface IListResult {
  data: IUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// GET /api/user — paginated, filterable list (admin only).
const getAllUsers = async (query: IListQuery): Promise<IListResult> => {
  const { search, role, status } = query;

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  const filter: FilterQuery<IUser> = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (role) {
    filter.role = role;
  }

  if (status === 'active') {
    filter.isActive = true;
  } else if (status === 'inactive') {
    filter.isActive = false;
  }

  const [data, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

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

// GET /api/user/me — current authenticated user.
const getMe = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
  return user;
};

// Shared account-creation helper — used wherever a domain module (Teacher,
// Student/Guardian) needs to create a linked login account. Throws a 409 if
// the email is already taken. Password is hashed by the User pre-save hook.
export const createUserAccount = async (payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  photo?: string;
  role: TUserRole;
}) => {
  const email = payload.email.toLowerCase();

  const existing = await User.findOne({ email });
  if (existing) {
    throw Object.assign(
      new Error(`A user account with the email '${payload.email}' already exists`),
      { status: 409 },
    );
  }

  return User.create({
    name: payload.name,
    email,
    phone: payload.phone,
    photo: payload.photo,
    password: payload.password,
    rawPassword: payload.password,
    role: payload.role,
  });
};

// POST /api/user/create-teacher — admin creates a teacher.
const createTeacher = async (payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<IUser> => {
  const existing = await User.findOne({ email: payload.email.toLowerCase() });
  if (existing) {
    throw Object.assign(new Error('A user with this email already exists'), {
      status: 409,
    });
  }

  const teacher = await User.create({
    ...payload,
    role: 'teacher' as TUserRole,
  });

  // Never leak the password hash in the response.
  const result = teacher.toObject() as unknown as Record<string, unknown>;
  delete result.password;
  return result as unknown as IUser;
};

// PATCH /api/user/me — self profile update, per-role field whitelist.
// teacher: name + photo only (no email/phone/password — password is blocked
// entirely for teachers, see auth.service.ts::changePassword; email/phone
// are admin-only changes via PATCH /api/user/:id).
// teacher: photo only.
// parent (guardian): name + photo only (email/phone blocked; password goes
// through the existing POST /api/auth/change-password instead).
// Any other role (admin/superAdmin/student): name + photo + phone.
const updateMe = async (
  actor: { userId: string; role: string },
  payload: Record<string, unknown>,
): Promise<IUser> => {
  const allowedFieldsByRole: Record<string, string[]> = {
    // Teachers may change their photo only — their name is how admins
    // identify them on salary and schedule screens, so it stays admin-owned.
    teacher: ['photo'],
    parent: ['name', 'photo'],
  };
  const allowed = allowedFieldsByRole[actor.role] ?? ['name', 'photo', 'phone'];

  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (payload[key] !== undefined) update[key] = payload[key];
  }

  if (Object.keys(update).length === 0) {
    throw Object.assign(new Error('No updatable fields were provided'), {
      status: 400,
    });
  }

  const updated = await User.findByIdAndUpdate(actor.userId, update, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  // Keep the Teacher profile's own `photo` field (shown across admin's
  // Teacher list/cards) in sync when a teacher updates their own photo.
  if (actor.role === 'teacher' && update.photo !== undefined) {
    await Teacher.findOneAndUpdate(
      { userRef: actor.userId },
      { photo: update.photo },
    );
  }

  return updated;
};

// PATCH /api/user/:id — admin update (name/phone/role/isActive).
const updateUser = async (
  id: string,
  payload: Partial<Pick<IUser, 'name' | 'phone' | 'role' | 'isActive'>>,
): Promise<IUser> => {
  const updated = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
  return updated;
};

// PATCH /api/user/:id/status — admin toggle/set isActive.
const updateUserStatus = async (
  id: string,
  isActive: boolean,
): Promise<IUser> => {
  const updated = await User.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true },
  );
  if (!updated) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
  return updated;
};

// DELETE /api/user/:id — admin delete.
const deleteUser = async (id: string): Promise<IUser> => {
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
  return deleted;
};

export const UserService = {
  getAllUsers,
  getMe,
  updateMe,
  createUserAccount,
  createTeacher,
  updateUser,
  updateUserStatus,
  deleteUser,
};
