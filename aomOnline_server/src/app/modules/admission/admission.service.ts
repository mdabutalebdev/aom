import { FilterQuery, Types } from 'mongoose';
import { Admission } from './admission.model';
import { IAdmission } from './admission.interface';
import { User } from '../user/user.model';
import { IUser, TUserRole } from '../user/user.interface';
import { createNotification } from '../notification/notification.service';

interface IListQuery {
  search?: string;
  status?: string;
  desiredClass?: string;
  page?: string;
  limit?: string;
}

interface IListResult {
  data: IAdmission[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface IApproveResult {
  admission: IAdmission;
  user: IUser;
  tempPassword: string;
}

// Generate a random temp password: `Aom@` + 6 random alphanumeric chars.
const generateTempPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Aom@${suffix}`;
};

// After a public admission is saved, notify every admin/superAdmin so the
// admin notification bell reflects the new application. Non-blocking: a failure
// here must never fail the applicant's submission.
const notifyAdminsOfNewAdmission = async (
  admission: IAdmission & { _id: Types.ObjectId },
): Promise<void> => {
  try {
    const admins = await User.find({
      role: { $in: ['admin', 'superAdmin'] },
    })
      .select('_id')
      .lean();

    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userRef: admin._id,
          title: 'নতুন ভর্তির আবেদন',
          message: `নতুন ভর্তির আবেদন: ${admission.studentName} (${admission.desiredClass})`,
          type: 'general',
          meta: { admissionId: admission._id },
        }),
      ),
    );
  } catch (_error) {
    // Swallow — notifying admins is best-effort and must not block admission.
  }
};

// POST /api/admissions — PUBLIC: submit an admission application.
const createAdmission = async (payload: {
  studentName: string;
  guardianName: string;
  guardianPhone: string;
  email: string;
  address: string;
  desiredClass: string;
  preferredTeacherGender?: string;
  preferredTeachingLanguage?: string;
  classTime?: string;
  guardianProfession?: string;
  guardianTimezone?: string;
  dateOfBirth?: Date;
  previousEducation?: string;
  photo?: string;
  note?: string;
}): Promise<IAdmission> => {
  const admission = await Admission.create(payload);

  // Fire-and-forget admin notification (safe; never blocks the submission).
  await notifyAdminsOfNewAdmission(admission);

  return admission;
};

// GET /api/admissions — admin: paginated, filterable list.
const getAllAdmissions = async (query: IListQuery): Promise<IListResult> => {
  const { search, status, desiredClass } = query;

  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  const filter: FilterQuery<IAdmission> = {};

  if (search) {
    filter.$or = [
      { studentName: { $regex: search, $options: 'i' } },
      { guardianName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { guardianPhone: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (desiredClass) {
    filter.desiredClass = desiredClass;
  }

  const [data, total] = await Promise.all([
    Admission.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Admission.countDocuments(filter),
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

// GET /api/admissions/:id — admin: single application.
const getAdmissionById = async (id: string): Promise<IAdmission> => {
  const admission = await Admission.findById(id);
  if (!admission) {
    throw Object.assign(new Error('Admission not found'), { status: 404 });
  }
  return admission;
};

// PATCH /api/admissions/:id/approve — admin: approve + auto-create student User.
const approveAdmission = async (id: string): Promise<IApproveResult> => {
  const admission = await Admission.findById(id);
  if (!admission) {
    throw Object.assign(new Error('Admission not found'), { status: 404 });
  }

  if (admission.status === 'approved') {
    throw Object.assign(
      new Error('This admission has already been approved'),
      { status: 409 },
    );
  }

  // Never create a duplicate login account for an existing email.
  const existing = await User.findOne({ email: admission.email.toLowerCase() });
  if (existing) {
    throw Object.assign(
      new Error(
        `A user account with the email '${admission.email}' already exists`,
      ),
      { status: 409 },
    );
  }

  // Generate a shareable temp password; the User pre-save hook hashes it.
  const tempPassword = generateTempPassword();

  const createdUser = await User.create({
    name: admission.studentName,
    email: admission.email,
    phone: admission.guardianPhone,
    password: tempPassword,
    role: 'student' as TUserRole,
  });

  // TODO Phase 5: also create Student/Parent domain records (and link the
  // Class from the Class module) here, wrapped in a transaction with the
  // User + Admission writes.

  admission.status = 'approved';
  admission.userId = createdUser._id;
  await admission.save();

  // Never leak the password hash in the response.
  const user = createdUser.toObject() as unknown as Record<string, unknown>;
  delete user.password;

  return {
    admission,
    user: user as unknown as IUser,
    tempPassword,
  };
};

// PATCH /api/admissions/:id/reject — admin: reject with an optional reason.
const rejectAdmission = async (
  id: string,
  reason?: string,
): Promise<IAdmission> => {
  const updated = await Admission.findByIdAndUpdate(
    id,
    { status: 'rejected', rejectionReason: reason },
    { new: true, runValidators: true },
  );
  if (!updated) {
    throw Object.assign(new Error('Admission not found'), { status: 404 });
  }
  return updated;
};

// DELETE /api/admissions/:id — admin: delete an application.
const deleteAdmission = async (id: string): Promise<IAdmission> => {
  const deleted = await Admission.findByIdAndDelete(id);
  if (!deleted) {
    throw Object.assign(new Error('Admission not found'), { status: 404 });
  }
  return deleted;
};

export const AdmissionService = {
  createAdmission,
  getAllAdmissions,
  getAdmissionById,
  approveAdmission,
  rejectAdmission,
  deleteAdmission,
};
