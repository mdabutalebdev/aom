import { ExamResult } from './examResult.model';
import { IExamResult } from './examResult.interface';

const httpError = (message: string, status: number) =>
  Object.assign(new Error(message), { status });

// totalMax defaults to subject1Max + subject2Max when the admin leaves it blank.
const withDerivedTotal = (payload: Partial<IExamResult>): Partial<IExamResult> => {
  if (
    (payload.totalMax === undefined || payload.totalMax === null) &&
    payload.subject1Max !== undefined &&
    payload.subject2Max !== undefined
  ) {
    return { ...payload, totalMax: payload.subject1Max + payload.subject2Max };
  }
  return payload;
};

// GET /api/exam-results — admin: every result sheet, newest first.
const getAllResults = async (): Promise<IExamResult[]> => {
  return ExamResult.find({}).sort({ createdAt: -1 });
};

// GET /api/exam-results/:id — admin: one result sheet.
const getResultById = async (id: string): Promise<IExamResult> => {
  const found = await ExamResult.findById(id);
  if (!found) throw httpError('Result sheet not found', 404);
  return found;
};

// POST /api/exam-results — admin: create a result sheet.
const createResult = async (payload: Partial<IExamResult>): Promise<IExamResult> => {
  return ExamResult.create(withDerivedTotal(payload));
};

// PATCH /api/exam-results/:id — admin: update a result sheet.
const updateResult = async (
  id: string,
  payload: Partial<IExamResult>,
): Promise<IExamResult> => {
  const updated = await ExamResult.findByIdAndUpdate(id, withDerivedTotal(payload), {
    new: true,
    runValidators: true,
  });
  if (!updated) throw httpError('Result sheet not found', 404);
  return updated;
};

// DELETE /api/exam-results/:id — admin: delete a result sheet.
const deleteResult = async (id: string): Promise<IExamResult> => {
  const deleted = await ExamResult.findByIdAndDelete(id);
  if (!deleted) throw httpError('Result sheet not found', 404);
  return deleted;
};

export const ExamResultService = {
  getAllResults,
  getResultById,
  createResult,
  updateResult,
  deleteResult,
};
