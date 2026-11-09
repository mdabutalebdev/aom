import { Schema, model } from 'mongoose';
import { IMaterial, FILE_TYPES } from './material.interface';

const materialSchema = new Schema<IMaterial>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    fileUrl: { type: String, required: true, trim: true },
    fileType: {
      type: String,
      enum: FILE_TYPES,
      required: true,
    },
    // null / absent classRef → material is visible to all classes.
    classRef: { type: Schema.Types.ObjectId, ref: 'Class', default: null },
    teacherRef: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

// Common access patterns: by class, by teacher.
materialSchema.index({ classRef: 1, isActive: 1 });
materialSchema.index({ teacherRef: 1, createdAt: -1 });

export const Material = model<IMaterial>('Material', materialSchema);
