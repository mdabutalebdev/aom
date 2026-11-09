/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The backend serves locally-stored uploads from its own origin, so whatever
// host NEXT_PUBLIC_API_URL points at must be allowed here too — otherwise
// next/image refuses those URLs and the images silently never render.
const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '')
  .trim()
  .replace(/^['"]|['"]$/g, '')
  .replace(/^[A-Za-z_][A-Za-z0-9_]*\s*=\s*/, '');

const apiRemotePattern = (() => {
  try {
    const { protocol, hostname, port } = new URL(apiUrl);
    return [{ protocol: protocol.replace(':', ''), hostname, ...(port ? { port } : {}) }];
  } catch {
    return [];
  }
})();

const nextConfig = {
  images: {
    remotePatterns: [
      ...apiRemotePattern,
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'tailwindcss': path.resolve(__dirname, 'node_modules/tailwindcss'),
      '@tailwindcss/postcss': path.resolve(__dirname, 'node_modules/@tailwindcss/postcss'),
    };
    return config;
  },
  turbopack: {},
};

export default nextConfig;
