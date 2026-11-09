import { Types } from 'mongoose';

export type TGroupStatus = 'active' | 'inactive';

export const GROUP_STATUSES: TGroupStatus[] = ['active', 'inactive'];

// A Group (batch) — several students taught together as one class. It carries
// the SHARED settings: one teacher, one schedule, one monthly fee, and a FLAT
// teacher payout for the whole group (not per student). Each student still has
// its own guardian and its own Student record; the group only groups them.
export interface IGroup {
  name: string; // batch label, e.g. "Batch 101" — required
  classRef: Types.ObjectId; // ref Class — required
  teacherRef: Types.ObjectId; // ref Teacher — required
  scheduleDays: string[]; // e.g. ['Sun', 'Tue', 'Thu']
  startTime?: string; // e.g. '6:00 PM'
  endTime?: string; // e.g. '7:00 PM'
  monthlyFee: number; // BDT — default fee applied to each student
  teacherPayout: number; // BDT — flat amount the teacher earns for THIS group
  status: TGroupStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
