export type TContactStatus = 'new' | 'read' | 'replied';

export const CONTACT_STATUSES: TContactStatus[] = ['new', 'read', 'replied'];

export interface IContact {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: TContactStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
