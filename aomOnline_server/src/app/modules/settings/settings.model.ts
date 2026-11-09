import { Schema, model } from 'mongoose';
import {
  ISettings,
  IHeroFeature,
  DEFAULT_HERO_FEATURES,
  IClassDemoFeature,
  DEFAULT_CLASSDEMO_ONETOONE_FEATURES,
  DEFAULT_CLASSDEMO_GROUP_FEATURES,
} from './settings.interface';

const heroFeatureSchema = new Schema<IHeroFeature>(
  {
    icon: { type: String, trim: true },
    label: { type: String, trim: true },
  },
  { _id: false },
);

const classDemoFeatureSchema = new Schema<IClassDemoFeature>(
  {
    icon: { type: String, trim: true },
    label: { type: String, trim: true },
  },
  { _id: false },
);

const settingsSchema = new Schema<ISettings>(
  {
    siteName: { type: String, required: true, trim: true, default: 'AOM অনলাইন মাদরাসা' },
    tagline: { type: String, trim: true },
    logo: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    address: { type: String, trim: true },
    // Social links — URL per platform + an active flag deciding footer visibility.
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    tiktok: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    youtube: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    facebookActive: { type: Boolean, default: true },
    instagramActive: { type: Boolean, default: true },
    tiktokActive: { type: Boolean, default: true },
    linkedinActive: { type: Boolean, default: true },
    youtubeActive: { type: Boolean, default: true },
    whatsappActive: { type: Boolean, default: true },
    // Manual payment — the madrasa's receiving accounts shown to guardians.
    paymentBankAccountTitle: { type: String, trim: true },
    paymentBankAccountNo: { type: String, trim: true },
    paymentBankName: { type: String, trim: true },
    paymentBankBranch: { type: String, trim: true },
    paymentBankRouting: { type: String, trim: true },
    paymentBkashNumber: { type: String, trim: true },
    paymentBkashType: { type: String, trim: true },
    paymentNagadNumber: { type: String, trim: true },
    paymentNagadType: { type: String, trim: true },
    paymentRocketNumber: { type: String, trim: true },
    paymentRocketType: { type: String, trim: true },
    paymentInstructions: { type: String, trim: true },
    aboutText: { type: String, trim: true },
    missionText: { type: String, trim: true },
    visionText: { type: String, trim: true },
    footerText: { type: String, trim: true },
    heroBadgeText: { type: String, trim: true },
    heroHeadingLine1: { type: String, trim: true },
    heroHeadingHighlight: { type: String, trim: true },
    heroHeadingLine2: { type: String, trim: true },
    heroDescription: { type: String, trim: true },
    heroFeatures: { type: [heroFeatureSchema], default: () => DEFAULT_HERO_FEATURES },
    heroPrimaryButtonText: { type: String, trim: true },
    heroSecondaryButtonText: { type: String, trim: true },
    heroImage: { type: String, trim: true },
    heroVideoUrl: { type: String, trim: true },
    heroMediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    heroQuoteText: { type: String, trim: true },
    heroQuoteAttribution: { type: String, trim: true },
    heroTooltipTitle: { type: String, trim: true },
    heroTooltipSubtitle: { type: String, trim: true },
    classDemoBadgeText: { type: String, trim: true },
    classDemoHeadingMain: { type: String, trim: true },
    classDemoHeadingHighlight: { type: String, trim: true },
    classDemoDescription: { type: String, trim: true },
    classDemoOneToOneTitle: { type: String, trim: true },
    classDemoOneToOneImage: { type: String, trim: true },
    classDemoOneToOneVideoUrl: { type: String, trim: true },
    classDemoOneToOneFeatures: {
      type: [classDemoFeatureSchema],
      default: () => DEFAULT_CLASSDEMO_ONETOONE_FEATURES,
    },
    classDemoGroupTitle: { type: String, trim: true },
    classDemoGroupImage: { type: String, trim: true },
    classDemoGroupVideoUrl: { type: String, trim: true },
    classDemoGroupFeatures: {
      type: [classDemoFeatureSchema],
      default: () => DEFAULT_CLASSDEMO_GROUP_FEATURES,
    },
  },
  {
    timestamps: true,
  },
);

export const Settings = model<ISettings>('Settings', settingsSchema);
