import { Settings } from './settings.model';
import { ISettings } from './settings.interface';

// Default content used when no settings document exists yet.
const DEFAULT_SETTINGS: Partial<ISettings> = {
  siteName: 'AOM অনলাইন মাদরাসা',
};

// Find the single settings document, creating a default one if none exists.
const getSettings = async (): Promise<ISettings> => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(DEFAULT_SETTINGS);
  }
  return settings;
};

// PATCH /api/settings — admin: update/upsert the single settings document.
const updateSettings = async (
  payload: Partial<ISettings>,
): Promise<ISettings> => {
  const existing = await Settings.findOne();

  if (!existing) {
    const created = await Settings.create({ ...DEFAULT_SETTINGS, ...payload });
    return created;
  }

  const updated = await Settings.findByIdAndUpdate(existing._id, payload, {
    new: true,
    runValidators: true,
  });

  // Non-null: existing was found above, so the update targets a real document.
  return updated as ISettings;
};

export const SettingsService = {
  getSettings,
  updateSettings,
};
