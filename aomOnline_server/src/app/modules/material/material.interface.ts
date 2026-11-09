import { Types } from 'mongoose';

export type TFileType = 'excel' | 'pdf' | 'image' | 'video' | 'other';

export const FILE_TYPES: TFileType[] = [
  'excel',
  'pdf',
  'image',
  'video',
  'other',
];

export interface IMaterial {
  title: string; // required
  description?: string;
  fileUrl: string; // required
  fileType: TFileType; // required
  classRef?: Types.ObjectId; // ref Class — null = visible to all classes
  teacherRef?: Types.ObjectId; // ref Teacher — the owning teacher
  uploadedBy?: Types.ObjectId; // ref User — the acting user
  isActive: boolean; // default true
  createdAt?: Date;
  updatedAt?: Date;
}

// Infer the material fileType from a filename/URL extension.
export const inferFileType = (filename: string): TFileType => {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'excel';
  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext))
    return 'image';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video';
  return 'other';
};
