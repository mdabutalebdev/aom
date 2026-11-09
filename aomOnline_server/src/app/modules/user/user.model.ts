import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../../config';
import {
  IUser,
  IUserMethods,
  IUserModel,
  USER_ROLES,
} from './user.interface';

const userSchema = new Schema<IUser, IUserModel, IUserMethods>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    rawPassword: { type: String, trim: true, select: false },
    phone: { type: String, trim: true },
    photo: { type: String, trim: true },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'student',
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as Record<string, unknown>).password;
        return ret;
      },
    },
  },
);

// Hash password before saving whenever it is set/modified.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const saltRounds = Number(config.bcrypt_salt_rounds);
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Instance method — compare a plaintext candidate against this doc's hash.
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method — compare a plaintext candidate against a supplied hash.
userSchema.statics.isPasswordMatched = async function (
  candidatePassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, hashedPassword);
};

export const User = model<IUser, IUserModel>('User', userSchema);
