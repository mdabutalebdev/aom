import { Types } from 'mongoose';
import { Progress } from './progress.model';
import { Teacher } from '../teacher/teacher.model';
import { Student } from '../student/student.model';
import { Class } from '../class/class.model';
import { IMilestone } from '../class/class.interface';
import { createNotification } from '../notification/notification.service';
import { Certificate } from '../certificate/certificate.model';

// The subset of req.user the service needs to resolve the actor.
export interface IActor {
  userId: string;
  role: string;
  email?: string;
}

// A lean Student doc as we select it here.
interface IStudentLean {
  _id: Types.ObjectId;
  studentId: string;
  name: string;
  photo?: string;
  userRef?: Types.ObjectId;
  teacherRef?: Types.ObjectId;
  classRef?: Types.ObjectId;
}

const httpError = (message: string, status: number) =>
  Object.assign(new Error(message), { status });

const isAdmin = (role: string) => role === 'admin' || role === 'superAdmin';

// Resolve the acting teacher. For a 'teacher' actor we look up their Teacher
// profile by userRef (403 if none). For admins we return null (no restriction),
// unless a teacherId is supplied — in which case we resolve THAT teacher so the
// admin can act "as" a specific teacher (mirrors attendance.service).
const resolveTeacherContext = async (
  actor: IActor,
  teacherId?: string,
): Promise<{ teacher: Types.ObjectId | null }> => {
  if (isAdmin(actor.role)) {
    if (teacherId) {
      const t = await Teacher.findById(teacherId).select('_id').lean();
      if (!t) throw httpError('Teacher not found', 404);
      return { teacher: t._id as Types.ObjectId };
    }
    return { teacher: null };
  }

  const teacher = await Teacher.findOne({ userRef: actor.userId })
    .select('_id')
    .lean();
  if (!teacher) {
    throw httpError('No teacher profile is linked to this account', 403);
  }
  return { teacher: teacher._id as Types.ObjectId };
};

// Load a student and enforce ownership. A scoped actor (teacher, or admin
// acting as a teacher) may only touch students whose teacherRef matches.
// A pure admin (teacherScope === null) may touch any student.
const loadOwnedStudent = async (
  studentId: string,
  teacherScope: Types.ObjectId | null,
): Promise<IStudentLean> => {
  const student = await Student.findById(studentId)
    .select('studentId name photo userRef teacherRef classRef')
    .lean<IStudentLean>();
  if (!student) {
    throw httpError('Student not found', 404);
  }
  if (teacherScope) {
    if (
      !student.teacherRef ||
      String(student.teacherRef) !== String(teacherScope)
    ) {
      throw httpError('Forbidden: this student is not assigned to you', 403);
    }
  }
  return student;
};

// Fetch a class's milestones (sorted by percent). Returns [] if no class.
const getClassMilestones = async (
  classRef?: Types.ObjectId | string,
): Promise<{ name?: string; milestones: IMilestone[] }> => {
  if (!classRef) return { milestones: [] };
  const cls = await Class.findById(classRef)
    .select('name nameEn milestones')
    .lean<{ name?: string; nameEn?: string; milestones?: IMilestone[] }>();
  if (!cls) return { milestones: [] };
  const milestones = [...(cls.milestones ?? [])].sort(
    (a, b) => a.percent - b.percent,
  );
  return { name: cls.nameEn || cls.name, milestones };
};

// GET /api/progress/my-students?teacherId=
// Teacher (or admin w/ ?teacherId=) → their students, each with progress +
// the milestone ladder of the student's class. No progress doc → 0 / [].
const getMyStudents = async (actor: IActor, teacherId?: string) => {
  const { teacher } = await resolveTeacherContext(actor, teacherId);

  // A pure admin with no teacherId has no single roster — require teacherId.
  if (teacher === null) {
    throw httpError('teacherId is required for admin to list a roster', 400);
  }

  const students = await Student.find({ teacherRef: teacher })
    .select('studentId name photo classRef')
    .populate('classRef', 'name nameEn milestones')
    .sort({ studentId: 1 })
    .lean();

  const progressDocs = await Progress.find({
    studentRef: { $in: students.map((s) => s._id) },
  })
    .select('studentRef percentage completedMilestones note')
    .lean();

  const progressByStudent = new Map(
    progressDocs.map((p) => [String(p.studentRef), p]),
  );

  const rows = students.map((s) => {
    const cls = s.classRef as unknown as
      | { _id?: Types.ObjectId; name?: string; nameEn?: string; milestones?: IMilestone[] }
      | undefined;
    const prog = progressByStudent.get(String(s._id));
    const milestones = [...(cls?.milestones ?? [])].sort(
      (a, b) => a.percent - b.percent,
    );
    return {
      _id: s._id,
      studentId: s.studentId,
      name: s.name,
      photo: s.photo,
      classRef: cls?._id ?? s.classRef,
      className: cls?.nameEn || cls?.name,
      percentage: prog?.percentage ?? 0,
      completedMilestones: prog?.completedMilestones ?? [],
      note: prog?.note ?? '',
      milestones,
    };
  });

  return { students: rows };
};

// PATCH /api/progress/student/:studentId
// Teacher (own) / admin — upsert the progress doc. Recomputes
// completedMilestones from the class ladder, then fires a milestone
// notification for each newly-crossed milestone (if the student has a userRef).
const updateStudentProgress = async (
  actor: IActor,
  studentId: string,
  payload: { percentage: number; classRef?: string; note?: string },
) => {
  const { teacher } = await resolveTeacherContext(actor);
  const student = await loadOwnedStudent(studentId, teacher);

  // classRef defaults to the student's own classRef.
  const classRef =
    payload.classRef ??
    (student.classRef ? String(student.classRef) : undefined);

  const { name: className, milestones } = await getClassMilestones(classRef);

  const percentage = payload.percentage;
  const completedMilestones = milestones
    .filter((m) => m.percent <= percentage)
    .map((m) => m.percent);

  // Diff against the previous doc to find NEWLY-crossed milestones.
  const previous = await Progress.findOne({ studentRef: student._id })
    .select('completedMilestones')
    .lean();
  const previousSet = new Set(previous?.completedMilestones ?? []);
  const newlyCrossed = completedMilestones.filter((p) => !previousSet.has(p));

  const progress = await Progress.findOneAndUpdate(
    { studentRef: student._id },
    {
      $set: {
        classRef: classRef ?? null,
        percentage,
        completedMilestones,
        updatedBy: actor.userId,
        ...(payload.note !== undefined ? { note: payload.note } : {}),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  // Milestone → notification hook. Only if the student has a linked login.
  let notified = 0;
  if (student.userRef && newlyCrossed.length > 0) {
    const label = className ?? '';
    for (const percent of newlyCrossed) {
      const message =
        percent >= 100
          ? `অভিনন্দন! আপনি ${label} লেভেল সম্পন্ন করেছেন!`
          : `অভিনন্দন! আপনি ${label}-এ ${percent}% সম্পন্ন করেছেন!`;
      await createNotification({
        userRef: student.userRef,
        title: 'মাইলস্টোন অর্জন',
        message,
        type: 'milestone',
        meta: {
          studentRef: student._id,
          classRef: classRef ?? null,
          percent,
        },
      });
      notified += 1;
    }
  }

  return { progress, notified };
};

// GET /api/progress/student/:studentId
// Teacher (own) / admin / the student themselves (student.userRef === userId).
const getStudentProgress = async (actor: IActor, studentId: string) => {
  const student = await Student.findById(studentId)
    .select('studentId name photo userRef teacherRef classRef')
    .lean<IStudentLean>();
  if (!student) {
    throw httpError('Student not found', 404);
  }

  // Authorization: admin → any; the student themselves → own; else teacher
  // must own the student.
  if (!isAdmin(actor.role)) {
    const isSelf =
      student.userRef && String(student.userRef) === String(actor.userId);
    if (!isSelf) {
      const teacherDoc = await Teacher.findOne({ userRef: actor.userId })
        .select('_id')
        .lean();
      const owns =
        teacherDoc &&
        student.teacherRef &&
        String(student.teacherRef) === String(teacherDoc._id);
      if (!owns) {
        throw httpError(
          'Forbidden: you are not allowed to view this progress',
          403,
        );
      }
    }
  }

  const progress = await Progress.findOne({ studentRef: student._id }).lean();

  // classRef precedence: the progress doc's, else the student's own.
  const classRef =
    (progress?.classRef as Types.ObjectId | undefined) ?? student.classRef;
  const { name: className, milestones } = await getClassMilestones(classRef);

  return {
    studentId: student.studentId,
    className,
    classRef: classRef ?? null,
    percentage: progress?.percentage ?? 0,
    completedMilestones: progress?.completedMilestones ?? [],
    note: progress?.note ?? '',
    milestones,
  };
};

// PATCH /api/progress/student/:studentId/promote
// Teacher (own) / admin — advance a student to the NEXT class by `order`
// (the Class module's sole sequencing field, e.g. Qaida → Nazira → Hafiz).
// Resets that student's progress (percentage → 0, completedMilestones → [])
// scoped to the new class. Student.monthlyFee / teacherPayoutAmount are
// untouched — fee/payout are independent of category. No history is kept
// (simplest approach — the old progress is overwritten in place).
const promoteStudentClass = async (actor: IActor, studentId: string) => {
  const { teacher } = await resolveTeacherContext(actor);
  const student = await loadOwnedStudent(studentId, teacher);

  if (!student.classRef) {
    throw httpError('This student has no current class to promote from', 400);
  }

  const currentClass = await Class.findById(student.classRef)
    .select('order name')
    .lean<{ _id: Types.ObjectId; order: number; name?: string }>();
  if (!currentClass) {
    throw httpError('Current class not found', 404);
  }

  const nextClass = await Class.findOne({
    order: { $gt: currentClass.order },
    isActive: true,
  })
    .sort({ order: 1 })
    .select('_id name nameEn milestones')
    .lean<{ _id: Types.ObjectId; name?: string; nameEn?: string; milestones?: IMilestone[] }>();

  if (!nextClass) {
    throw httpError(
      'This student is already at the highest class — nothing to promote to',
      400,
    );
  }

  // Generate a unique certificate number
  const certNumber = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // Issue a certificate for the completed class
  await Certificate.create({
    studentRef: student._id,
    classRef: currentClass._id,
    teacherRef: student.teacherRef, // The teacher who supervised them
    certificateNumber: certNumber,
  });

  await Student.findByIdAndUpdate(student._id, { classRef: nextClass._id });

  const progress = await Progress.findOneAndUpdate(
    { studentRef: student._id },
    {
      $set: {
        classRef: nextClass._id,
        percentage: 0,
        completedMilestones: [],
        updatedBy: actor.userId,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  // Notify the guardian of the promotion, if they have a linked login.
  if (student.userRef) {
    await createNotification({
      userRef: student.userRef,
      title: 'নতুন ক্লাসে উত্তীর্ণ',
      message: `অভিনন্দন! আপনার সন্তান এখন "${nextClass.name}" ক্লাসে পড়াশোনা শুরু করেছে।`,
      type: 'milestone',
      meta: {
        studentRef: student._id,
        fromClassRef: currentClass._id,
        toClassRef: nextClass._id,
      },
    });
  }

  return {
    progress,
    promotedTo: { _id: nextClass._id, name: nextClass.nameEn || nextClass.name },
  };
};

export const ProgressService = {
  getMyStudents,
  updateStudentProgress,
  getStudentProgress,
  promoteStudentClass,
};
