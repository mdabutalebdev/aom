import { Document } from 'mongoose';

export interface ITeacherApplication extends Document {
  name: string;
  email: string;
  phone: string;
  cvUrl: string;
  mediaUrl: string; // audio or video file
  coverLetter?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}
