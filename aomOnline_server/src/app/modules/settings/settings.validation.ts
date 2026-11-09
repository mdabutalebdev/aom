import { z } from 'zod';

// Admin — update/upsert the single settings document. Every field optional,
// but at least one must be provided.
export const updateSettingsValidationSchema = z.object({
  body: z
    .object({
      siteName: z.string().min(1, 'siteName cannot be empty').optional(),
      tagline: z.string().optional(),
      logo: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email('Valid email is required').optional(),
      address: z.string().optional(),
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      tiktok: z.string().optional(),
      linkedin: z.string().optional(),
      youtube: z.string().optional(),
      whatsapp: z.string().optional(),
      facebookActive: z.boolean().optional(),
      instagramActive: z.boolean().optional(),
      tiktokActive: z.boolean().optional(),
      linkedinActive: z.boolean().optional(),
      youtubeActive: z.boolean().optional(),
      whatsappActive: z.boolean().optional(),
      paymentBankAccountTitle: z.string().optional(),
      paymentBankAccountNo: z.string().optional(),
      paymentBankName: z.string().optional(),
      paymentBankBranch: z.string().optional(),
      paymentBankRouting: z.string().optional(),
      paymentBkashNumber: z.string().optional(),
      paymentBkashType: z.string().optional(),
      paymentNagadNumber: z.string().optional(),
      paymentNagadType: z.string().optional(),
      paymentRocketNumber: z.string().optional(),
      paymentRocketType: z.string().optional(),
      paymentInstructions: z.string().optional(),
      aboutText: z.string().optional(),
      missionText: z.string().optional(),
      visionText: z.string().optional(),
      footerText: z.string().optional(),
      heroBadgeText: z.string().optional(),
      heroHeadingLine1: z.string().optional(),
      heroHeadingHighlight: z.string().optional(),
      heroHeadingLine2: z.string().optional(),
      heroDescription: z.string().optional(),
      heroFeatures: z
        .array(
          z.object({
            icon: z.string().optional(),
            label: z.string().optional(),
          }),
        )
        .optional(),
      heroPrimaryButtonText: z.string().optional(),
      heroSecondaryButtonText: z.string().optional(),
      heroImage: z.string().optional(),
      heroVideoUrl: z.string().optional(),
      heroMediaType: z.enum(['image', 'video']).optional(),
      heroQuoteText: z.string().optional(),
      heroQuoteAttribution: z.string().optional(),
      heroTooltipTitle: z.string().optional(),
      heroTooltipSubtitle: z.string().optional(),
      classDemoBadgeText: z.string().optional(),
      classDemoHeadingMain: z.string().optional(),
      classDemoHeadingHighlight: z.string().optional(),
      classDemoDescription: z.string().optional(),
      classDemoOneToOneTitle: z.string().optional(),
      classDemoOneToOneImage: z.string().optional(),
      classDemoOneToOneVideoUrl: z.string().optional(),
      classDemoOneToOneFeatures: z
        .array(
          z.object({
            icon: z.string().optional(),
            label: z.string().optional(),
          }),
        )
        .optional(),
      classDemoGroupTitle: z.string().optional(),
      classDemoGroupImage: z.string().optional(),
      classDemoGroupVideoUrl: z.string().optional(),
      classDemoGroupFeatures: z
        .array(
          z.object({
            icon: z.string().optional(),
            label: z.string().optional(),
          }),
        )
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided to update',
    }),
});
