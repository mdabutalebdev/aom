export interface IAchievement {
  title: string;
  description?: string;
  certificateImage: string;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
