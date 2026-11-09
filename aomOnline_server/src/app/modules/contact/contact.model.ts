import { Schema, model } from 'mongoose';
import { IContact, CONTACT_STATUSES } from './contact.interface';

const contactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: CONTACT_STATUSES,
      default: 'new',
    },
  },
  {
    timestamps: true,
  },
);

export const Contact = model<IContact>('Contact', contactSchema);
