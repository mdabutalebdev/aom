import { Types } from 'mongoose';
import { Certificate } from './certificate.model';
import { Student } from '../student/student.model';
import { Teacher } from '../teacher/teacher.model';

// The subset of req.user the service needs to resolve/scope the actor.
interface IActor {
  userId: string;
  role: string;
}

const getMyCertificates = async (studentId: string) => {
  const certificates = await Certificate.find({ studentRef: studentId })
    .populate({
      path: 'studentRef',
      select: 'name studentId photo userRef',
      populate: { path: 'userRef', select: 'name' },
    })
    .populate('classRef', 'name nameEn')
    .populate({
      path: 'teacherRef',
      populate: {
        path: 'userRef',
        select: 'name email',
      },
    })
    .sort({ issuedAt: -1 });

  return certificates;
};

const getAllCertificates = async (
  actor: IActor,
  query: Record<string, unknown> = {},
) => {
  const filter: any = {};

  if (actor.role === 'teacher') {
    // A teacher may only ever see certificates for their own students —
    // scope server-side from the authenticated user, never trust the client.
    const teacher = await Teacher.findOne({ userRef: actor.userId })
      .select('_id')
      .lean();
    if (!teacher) {
      // No teacher profile linked → return nothing rather than leaking all.
      return [];
    }
    filter.teacherRef = teacher._id;
  } else if (query.teacherId) {
    // Admin / superAdmin may optionally narrow to a specific teacher.
    filter.teacherRef = query.teacherId;
  }

  const certificates = await Certificate.find(filter)
    .populate('studentRef')
    .populate({
      path: 'studentRef',
      populate: {
        path: 'userRef',
        select: 'name',
      },
    })
    .populate('classRef', 'name nameEn')
    .populate({
      path: 'teacherRef',
      populate: {
        path: 'userRef',
        select: 'name',
      },
    })
    .sort({ issuedAt: -1 });

  return certificates;
};

const generateCertificateNumber = () => {
  const prefix = 'CERT-AOM';
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${dateStr}-${randomStr}`;
};

const issueCertificate = async (studentId: string) => {
  const student = await Student.findById(studentId);
  if (!student) {
    throw Object.assign(new Error('Student not found'), { status: 404 });
  }

  if (!student.classRef || !student.teacherRef) {
    throw Object.assign(new Error('Student must be assigned to a class and teacher to issue a certificate'), { status: 400 });
  }

  const existingCert = await Certificate.findOne({
    studentRef: studentId,
    classRef: student.classRef,
  });

  if (existingCert) {
    throw Object.assign(new Error('A certificate has already been issued for this student in this class'), { status: 400 });
  }

  const certificateNumber = generateCertificateNumber();

  const newCertificate = await Certificate.create({
    studentRef: studentId,
    classRef: student.classRef,
    teacherRef: student.teacherRef,
    certificateNumber,
  });

  return newCertificate;
};

// Admin "Create Certificate" — dynamic/manual issue. Requires only a linked
// student (so the certificate surfaces in that student's guardian portal); the
// displayed name and course/achievement text are free-form. No duplicate block
// — an admin may issue as many certificates per student as they like.
const createCertificate = async (payload: any) => {
  const { studentRef, studentName, courseName, classRef, teacherRef, issuedAt } = payload;

  if (!studentRef) {
    throw Object.assign(new Error('Please select a student for this certificate'), {
      status: 400,
    });
  }

  const student = await Student.findById(studentRef).select('_id').lean();
  if (!student) {
    throw Object.assign(new Error('Selected student not found'), { status: 404 });
  }

  const doc: any = {
    studentRef,
    certificateNumber: payload.certificateNumber || generateCertificateNumber(),
  };
  if (studentName !== undefined) doc.studentName = String(studentName).trim();
  if (courseName !== undefined) doc.courseName = String(courseName).trim();
  if (payload.imageUrl !== undefined) doc.imageUrl = String(payload.imageUrl).trim();
  if (classRef) doc.classRef = classRef;
  if (teacherRef) doc.teacherRef = teacherRef;
  if (issuedAt) {
    const d = new Date(issuedAt);
    if (Number.isNaN(d.getTime())) {
      throw Object.assign(new Error('Invalid issue date'), { status: 400 });
    }
    doc.issuedAt = d;
  }

  const newCertificate = await Certificate.create(doc);
  return newCertificate;
};

const updateCertificate = async (id: string, payload: any) => {
  // Editable: the displayed name, course/achievement text, certificate number
  // and issue date. The linked student stays fixed (it controls which guardian
  // sees the certificate).
  const update: any = {};

  if (payload.studentName !== undefined) {
    update.studentName = String(payload.studentName).trim();
  }
  if (payload.courseName !== undefined) {
    update.courseName = String(payload.courseName).trim();
  }
  if (payload.imageUrl !== undefined) {
    update.imageUrl = String(payload.imageUrl).trim();
  }

  if (payload.certificateNumber !== undefined) {
    const num = String(payload.certificateNumber).trim();
    if (!num) {
      throw Object.assign(new Error('Certificate number cannot be empty'), {
        status: 400,
      });
    }
    const duplicate = await Certificate.findOne({
      certificateNumber: num,
      _id: { $ne: id },
    }).lean();
    if (duplicate) {
      throw Object.assign(
        new Error('Another certificate already uses this number'),
        { status: 400 },
      );
    }
    update.certificateNumber = num;
  }

  if (payload.issuedAt !== undefined) {
    const date = new Date(payload.issuedAt);
    if (Number.isNaN(date.getTime())) {
      throw Object.assign(new Error('Invalid issue date'), { status: 400 });
    }
    update.issuedAt = date;
  }

  const result = await Certificate.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });
  if (!result) {
    throw Object.assign(new Error('Certificate not found'), { status: 404 });
  }
  return result;
};

const deleteCertificate = async (id: string) => {
  const result = await Certificate.findByIdAndDelete(id);
  if (!result) {
    throw Object.assign(new Error('Certificate not found'), { status: 404 });
  }
  return result;
};

export const CertificateService = {
  getMyCertificates,
  getAllCertificates,
  issueCertificate,
  createCertificate,
  updateCertificate,
  deleteCertificate,
};
