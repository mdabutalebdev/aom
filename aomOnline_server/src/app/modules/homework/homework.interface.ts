import { Types } from 'mongoose';

// A one-way "homework" a teacher sends to a student's guardian. The guardian
// reads it (no reply here — replies go through the separate Message system) and
// can mark it read. The mirror image of IMessage.
export interface IHomework {
  studentRef: Types.ObjectId; // ref Student — the child the homework is for
  teacherRef: Types.ObjectId; // ref Teacher — the teacher who sent it (sender)
  guardianRef: Types.ObjectId; // ref User — the recipient guardian (student.userRef)
  title: string;
  body: string;
  read: boolean; // whether the guardian has read it (default false)
  createdAt?: Date;
  updatedAt?: Date;
}
