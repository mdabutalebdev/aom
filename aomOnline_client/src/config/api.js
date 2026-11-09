// Central API configuration for AOM Online Madrasa

// A deployment panel value pasted with its variable name, quotes, or a
// trailing slash still attached (e.g. `NEXT_PUBLIC_API_URL=https://host`)
// otherwise ends up glued into every request and upload URL we build.
export const API_ORIGIN =
  (process.env.NEXT_PUBLIC_API_URL || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/^[A-Za-z_][A-Za-z0-9_]*\s*=\s*/, '')
    .replace(/^['"]|['"]$/g, '')
    .replace(/\/+$/, '') || 'http://localhost:5000';

const API_BASE_URL = `${API_ORIGIN}/api`;

export default API_BASE_URL;
