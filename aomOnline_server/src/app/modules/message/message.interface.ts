import { Types } from 'mongoose';

// A one-way message a guardian sends to their child's teacher. The teacher
// reads it (no reply) and can mark it read.
export interface IMessage {
  studentRef: Types.ObjectId; // ref Student — the child the message is about
  guardianRef: Types.ObjectId; // ref User — the guardian who sent it (sender)
  teacherRef: Types.ObjectId; // ref Teacher — the recipient
  title: string;
  body: string;
  read: boolean; // whether the teacher has read it (default false)
  createdAt?: Date;
  updatedAt?: Date;
}
