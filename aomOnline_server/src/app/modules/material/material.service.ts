import { FilterQuery, Types } from 'mongoose';
import { Material } from './material.model';
import { IMaterial, TFileType } from './material.interface';
import { Teacher } from '../teacher/teacher.model';
import { Student } from '../student/student.model';

// The subset of req.user the service needs to resolve the actor.
export interface IActor {
  userId: string;
  role: string;
  email?: string;
}

const httpError = (message: string, status: number) =>
  Object.assign(new Error(message), { status });

const isAdmin = (role: string) => role === 'admin' || role === 'superAdmin';

// Resolve the logged-in teacher's profile (403 if the account has none).
const requireTeacher = async (actor: IActor): Promise<Types.ObjectId> => {
  const teacher = await Teacher.findOne({ userRef: actor.userId })
    .select('_id')
    .lean();
  if (!teacher) {
    throw httpError('No teacher profile is linked to this account', 403);
  }
  return teacher._id as Types.ObjectId;
};

interface IListQuery {
  class?: string;
  type?: string;
  page?: string;
  limit?: string;
}

// GET /api/materials?class=&type=&page=&limit=
// Teacher → own materials; admin → all materials.
const getMaterials = async (actor: IActor, query: IListQuery) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  const filter: FilterQuery<IMaterial> = {};

  if (!isAdmin(actor.role)) {
    filter.teacherRef = await requireTeacher(actor);
  }
  if (query.class) {
    filter.classRef = query.class as unknown as Types.ObjectId;
  }
  if (query.type) {
    filter.fileType = query.type as TFileType;
  }

  const [data, total] = await Promise.all([
    Material.find(filter)
      .populate('classRef', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Material.countDocuments(filter),
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

// GET /api/materials/my — student → active materials for their class OR
// materials with no class (classRef == null → visible to all).
const getMyMaterials = async (actor: IActor) => {
  const student = await Student.findOne({ userRef: actor.userId })
    .select('classRef')
    .lean<{ _id: Types.ObjectId; classRef?: Types.ObjectId }>();
  if (!student) {
    throw httpError('No student profile is linked to this account', 403);
  }

  const orConditions: FilterQuery<IMaterial>[] = [{ classRef: null }];
  if (student.classRef) {
    orConditions.push({ classRef: student.classRef });
  }

  const materials = await Material.find({
    isActive: true,
    $or: orConditions,
  })
    .populate('classRef', 'name')
    .sort({ createdAt: -1 })
    .lean();

  return { materials };
};

// POST /api/materials — teacher: create a material record.
const createMaterial = async (
  actor: IActor,
  payload: {
    title: string;
    description?: string;
    fileUrl: string;
    fileType: TFileType;
    classRef?: string;
  },
) => {
  const teacherRef = await requireTeacher(actor);

  const material = await Material.create({
    title: payload.title,
    description: payload.description,
    fileUrl: payload.fileUrl,
    fileType: payload.fileType,
    classRef: payload.classRef ?? null,
    teacherRef,
    uploadedBy: actor.userId,
    isActive: true,
  });
  return material;
};

// Load a material and enforce teacher ownership (admins bypass ownership).
const loadOwnedMaterial = async (actor: IActor, id: string) => {
  const material = await Material.findById(id);
  if (!material) {
    throw httpError('Material not found', 404);
  }
  if (!isAdmin(actor.role)) {
    const teacherRef = await requireTeacher(actor);
    if (
      !material.teacherRef ||
      String(material.teacherRef) !== String(teacherRef)
    ) {
      throw httpError('Forbidden: this material is not yours', 403);
    }
  }
  return material;
};

// PATCH /api/materials/:id — teacher (own).
const updateMaterial = async (
  actor: IActor,
  id: string,
  payload: {
    title?: string;
    description?: string;
    fileUrl?: string;
    fileType?: TFileType;
    classRef?: string | null;
    isActive?: boolean;
  },
) => {
  const material = await loadOwnedMaterial(actor, id);
  Object.assign(material, payload);
  await material.save();
  return material;
};

// DELETE /api/materials/:id — teacher (own) / admin.
const deleteMaterial = async (actor: IActor, id: string) => {
  const material = await loadOwnedMaterial(actor, id);
  await material.deleteOne();
  return material;
};

export const MaterialService = {
  getMaterials,
  getMyMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
};
