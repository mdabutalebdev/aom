import { Schema, model } from 'mongoose';
import { ITestimonial } from './testimonial.interface';

const testimonialSchema = new Schema<ITestimonial>(
  {
    reviewerName: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    youtubeUrl: { type: String, required: true, trim: true },
    quoteText: { type: String, required: true, trim: true },
    duration: { type: String, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['pending', 'approved'],
      default: 'approved',
    },
    source: {
      type: String,
      enum: ['parent', 'admin'],
      default: 'admin',
    },
  },
  {
    timestamps: true,
  },
);

export const Testimonial = model<ITestimonial>('Testimonial', testimonialSchema);
