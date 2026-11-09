import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

// Panel-pasted env values sometimes carry the variable name, surrounding
// quotes, or a trailing slash along with them (e.g. the whole
// `API_URL=https://host` line pasted into the value box). Left as-is those
// leak straight into every upload URL we store, so strip them here once.
const cleanUrl = (raw?: string): string => {
  let value = (raw || '').trim().replace(/^['"]|['"]$/g, '').trim();
  value = value.replace(/^[A-Za-z_][A-Za-z0-9_]*\s*=\s*/, '').trim();
  value = value.replace(/^['"]|['"]$/g, '').trim();
  return value.replace(/\/+$/, '');
};

export default {
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || '12',

  // JWT
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET as string,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || '7d',
    refresh_secret: process.env.JWT_REFRESH_SECRET as string,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Cloudinary
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },

  // Client
  client_url:
    (process.env.CLIENT_URL || '')
      .split(',')
      .map(cleanUrl)
      .filter(Boolean)
      .join(',') || 'http://localhost:3000',

  // This server's own public base URL — used to build absolute URLs for
  // locally-stored uploads when Cloudinary isn't configured.
  server_url:
    cleanUrl(process.env.API_URL) || `http://localhost:${process.env.PORT || 5000}`,

  // Email (SMTP) — optional. Unset in dev; notifyChannels.ts logs instead of
  // sending until these are provided.
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM,
  },

  // WhatsApp (Meta Cloud API / Twilio — TBD) — optional. Same drop-in-later
  // seam as SMTP above.
  whatsapp: {
    apiToken: process.env.WHATSAPP_API_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  },

  // Seed superAdmin (used by scripts/seedAdmin.ts)
  super_admin: {
    email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@aom.com',
    password: process.env.SUPER_ADMIN_PASSWORD || 'Admin@12345',
  },
};
