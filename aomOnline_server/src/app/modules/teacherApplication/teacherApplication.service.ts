import { ITeacherApplication } from './teacherApplication.interface';
import { TeacherApplication } from './teacherApplication.model';

const createApplication = async (payload: Partial<ITeacherApplication>) => {
  const result = await TeacherApplication.create(payload);
  return result;
};

const getAllApplications = async () => {
  const result = await TeacherApplication.find().sort({ createdAt: -1 });
  return result;
};

const getApplicationById = async (id: string) => {
  const result = await TeacherApplication.findById(id);
  return result;
};

const updateApplicationStatus = async (id: string, status: string) => {
  const result = await TeacherApplication.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true },
  );
  return result;
};

const deleteApplication = async (id: string) => {
  const result = await TeacherApplication.findByIdAndDelete(id);
  return result;
};

export const TeacherApplicationService = {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
};
