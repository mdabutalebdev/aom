import { z } from 'zod';
import { FILE_TYPES } from './material.interface';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Teacher — create a material record from an already-uploaded fileUrl.
export const createMaterialValidationSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'title is required' })
      .min(1, 'title is required'),
    description: z.string().optional(),
    fileUrl: z
      .string({ required_error: 'fileUrl is required' })
      .min(1, 'fileUrl is required'),
    fileType: z.enum(FILE_TYPES as [string, ...string[]], {
      required_error: 'fileType is required',
      invalid_type_error: `fileType must be one of: ${FILE_TYPES.join(', ')}`,
    }),
    classRef: z
      .string()
      .regex(objectIdRegex, 'classRef must be a valid id')
      .optional(),
  }),
});

// Teacher (own) — update a material record. All fields optional.
export const updateMaterialValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    fileUrl: z.string().min(1).optional(),
    fileType: z
      .enum(FILE_TYPES as [string, ...string[]], {
        invalid_type_error: `fileType must be one of: ${FILE_TYPES.join(', ')}`,
      })
      .optional(),
    classRef: z
      .string()
      .regex(objectIdRegex, 'classRef must be a valid id')
      .nullable()
      .optional(),
    isActive: z.boolean().optional(),
  }),
});
