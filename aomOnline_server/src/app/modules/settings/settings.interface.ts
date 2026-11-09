export interface IHeroFeature {
  icon?: string;
  label?: string;
}

// Default feature callouts — mirrors the Hero section's current hardcoded copy.
export const DEFAULT_HERO_FEATURES: IHeroFeature[] = [
  { icon: 'users', label: 'One to One Classes' },
  { icon: 'gender', label: 'Male & Female Teachers' },
  { icon: 'calendar', label: 'Flexible Schedule' },
  { icon: 'shield', label: 'Safe & Secure Environment' },
];

export interface IClassDemoFeature {
  icon?: string;
  label?: string;
}

// Default feature bullets for the "Watch Our Live Class Demo" comparison cards.
export const DEFAULT_CLASSDEMO_ONETOONE_FEATURES: IClassDemoFeature[] = [
  { icon: 'users', label: 'Personalized Attention' },
  { icon: 'calendar', label: 'Flexible Schedule' },
  { icon: 'trending', label: 'Faster Progress' },
  { icon: 'shield', label: 'Focus on Individual Needs' },
];

export const DEFAULT_CLASSDEMO_GROUP_FEATURES: IClassDemoFeature[] = [
  { icon: 'chat', label: 'Interactive Learning' },
  { icon: 'users', label: 'Peer Motivation' },
  { icon: 'handshake', label: 'Learn Together' },
  { icon: 'shield', label: 'Affordable & Effective' },
];

export interface ISettings {
  siteName: string;
  tagline?: string;
  logo?: string;
  phone?: string;
  email?: string;
  address?: string;
  // Social links — URL per platform + an active flag deciding footer visibility.
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  youtube?: string;
  whatsapp?: string;
  facebookActive?: boolean;
  instagramActive?: boolean;
  tiktokActive?: boolean;
  linkedinActive?: boolean;
  youtubeActive?: boolean;
  whatsappActive?: boolean;
  // Manual payment — the madrasa's receiving accounts shown to guardians.
  paymentBankAccountTitle?: string;
  paymentBankAccountNo?: string;
  paymentBankName?: string;
  paymentBankBranch?: string;
  paymentBankRouting?: string;
  paymentBkashNumber?: string;
  paymentBkashType?: string; // e.g. 'Personal' | 'Merchant'
  paymentNagadNumber?: string;
  paymentNagadType?: string;
  paymentRocketNumber?: string;
  paymentRocketType?: string;
  // Free-text note shown under the accounts (reference format, cut-off date…).
  paymentInstructions?: string;
  aboutText?: string;
  missionText?: string;
  visionText?: string;
  footerText?: string;
  // Homepage Hero section — super-admin editable content.
  heroBadgeText?: string;
  heroHeadingLine1?: string;
  heroHeadingHighlight?: string;
  heroHeadingLine2?: string;
  heroDescription?: string;
  heroFeatures?: IHeroFeature[];
  heroPrimaryButtonText?: string;
  heroSecondaryButtonText?: string;
  heroImage?: string;
  heroVideoUrl?: string; // uploaded right-panel video (from the admin's PC)
  heroMediaType?: 'image' | 'video'; // which one the right panel shows
  heroQuoteText?: string;
  heroQuoteAttribution?: string;
  heroTooltipTitle?: string;
  heroTooltipSubtitle?: string;
  // Homepage "Watch Our Live Class Demo" section — super-admin editable content.
  classDemoBadgeText?: string;
  classDemoHeadingMain?: string;
  classDemoHeadingHighlight?: string;
  classDemoDescription?: string;
  classDemoOneToOneTitle?: string;
  classDemoOneToOneImage?: string;
  classDemoOneToOneVideoUrl?: string;
  classDemoOneToOneFeatures?: IClassDemoFeature[];
  classDemoGroupTitle?: string;
  classDemoGroupImage?: string;
  classDemoGroupVideoUrl?: string;
  classDemoGroupFeatures?: IClassDemoFeature[];
  createdAt?: Date;
  updatedAt?: Date;
}
