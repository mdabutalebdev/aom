import { FilterQuery, Types } from 'mongoose';
import { Group } from './group.model';
import { IGroup } from './group.interface';
import { Student } from '../student/student.model';

const httpError = (message: string, status: number) =>
  Object.assign(new Error(message), { status });

const CLASS_POPULATE = { path: 'classRef', select: 'name nameEn' };
const TEACHER_POPULATE = {
  path: 'teacherRef',
  select: 'teacherId userRef',
  populate: { path: 'userRef', select: 'name' },
};

// Attach a live student count to each group so the list can show it.
const withStudentCounts = async <T extends { _id: Types.ObjectId }>(groups: T[]) => {
  const counts = await Student.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { groupRef: { $in: groups.map((g) => g._id) } } },
    { $group: { _id: '$groupRef', count: { $sum: 1 } } },
  ]);
  const byGroup = new Map(counts.map((c) => [String(c._id), c.count]));
  return groups.map((g) => ({
    ...g,
    studentCount: byGroup.get(String(g._id)) ?? 0,
  }));
};

interface IListQuery {
  search?: string;
  status?: string;
  teacher?: string;
  class?: string;
}

const getAllGroups = async (query: IListQuery) => {
  const filter: FilterQuery<IGroup> = {};
  if (query.search) filter.name = { $regex: query.search, $options: 'i' };
  if (query.status) filter.status = query.status;
  if (query.teacher) filter.teacherRef = query.teacher;
  if (query.class) filter.classRef = query.class;

  const groups = await Group.find(filter)
    .populate(CLASS_POPULATE)
    .populate(TEACHER_POPULATE)
    .sort({ createdAt: -1 })
    .lean();

  return withStudentCounts(groups);
};

const getGroupById = async (id: string) => {
  const group = await Group.findById(id)
    .populate(CLASS_POPULATE)
    .populate(TEACHER_POPULATE)
    .lean();
  if (!group) throw httpError('Group not found', 404);
  return group;
};

const createGroup = async (payload: Partial<IGroup>) => {
  const group = await Group.create(payload);
  return group;
};

const updateGroup = async (id: string, payload: Partial<IGroup>) => {
  const group = await Group.findByIdAndUpdate(id, { $set: payload }, { new: true });
  if (!group) throw httpError('Group not found', 404);
  return group;
};

const deleteGroup = async (id: string) => {
  const studentCount = await Student.countDocuments({ groupRef: id });
  if (studentCount > 0) {
    throw httpError(
      `This group still has ${studentCount} student(s). Move or remove them first.`,
      400,
    );
  }
  const group = await Group.findByIdAndDelete(id);
  if (!group) throw httpError('Group not found', 404);
  return group;
};

export const GroupService = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
};
