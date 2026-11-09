import { Document, Model, Types } from 'mongoose';

export type TUserRole = 'parent' | 'student' | 'teacher' | 'admin' | 'superAdmin';

export const USER_ROLES: TUserRole[] = [
  'parent',
  'student',
  'teacher',
  'admin',
  'superAdmin',
];

export interface IUser {
  name: string;
  email: string;
  password: string;
  rawPassword?: string;
  phone?: string;
  photo?: string;
  role: TUserRole;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Instance methods available on a user document
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// A hydrated user document with instance methods
export type TUserDocument = Document<Types.ObjectId, unknown, IUser> &
  IUser &
  IUserMethods & { _id: Types.ObjectId };

// Static methods available on the User model
export interface IUserModel extends Model<IUser, unknown, IUserMethods> {
  isPasswordMatched(
    candidatePassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}
