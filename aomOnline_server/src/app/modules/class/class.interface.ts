export interface IMilestone {
  percent: number;
  label?: string;
}

export interface IClass {
  name: string; // Bangla name — required, unique
  nameEn?: string;
  monthlyFee: number; // BDT
  order: number;
  milestones: IMilestone[];
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Default milestone ladder for a newly created class/level.
export const DEFAULT_MILESTONES: IMilestone[] = [
  { percent: 0 },
  { percent: 20 },
  { percent: 40 },
  { percent: 60 },
  { percent: 80 },
  { percent: 100 },
];
