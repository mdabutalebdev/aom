import { Schema, model } from 'mongoose';
import { IPresentation } from './presentation.interface';

const presentationSchema = new Schema<IPresentation>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    presenterName: { type: String, required: true, trim: true },
    youtubeUrl: { type: String, required: true, trim: true },
    duration: { type: String, trim: true },
    icon: { type: String, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

export const Presentation = model<IPresentation>('Presentation', presentationSchema);
