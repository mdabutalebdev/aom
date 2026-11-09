export interface IPresentation {
  title: string;
  subtitle?: string;
  presenterName: string;
  youtubeUrl: string;
  duration?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
