import { Types } from 'mongoose';

export type TNotificationType = 'milestone' | 'general' | 'material';

export const NOTIFICATION_TYPES: TNotificationType[] = [
  'milestone',
  'general',
  'material',
];

export interface INotification {
  userRef: Types.ObjectId; // ref User — the recipient (required)
  title: string;
  message: string;
  type: TNotificationType; // 'milestone' | 'general' | 'material' — default 'general'
  read: boolean; // default false
  meta?: unknown; // free-form payload (Schema.Types.Mixed)
  createdAt?: Date;
  updatedAt?: Date;
}
