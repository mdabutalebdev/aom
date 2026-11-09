// Moderation status: parent submissions start as 'pending', admin creations
// and approved reviews are 'approved'.
export type TestimonialStatus = 'pending' | 'approved';

// Who authored the review — a parent (via the public homepage form) or an
// admin (from the dashboard). Admin-authored reviews are editable.
export type TestimonialSource = 'parent' | 'admin';

export interface ITestimonial {
  reviewerName: string;
  location?: string;
  youtubeUrl: string;
  quoteText: string;
  duration?: string;
  order: number;
  isActive: boolean;
  status: TestimonialStatus;
  source: TestimonialSource;
  createdAt?: Date;
  updatedAt?: Date;
}
