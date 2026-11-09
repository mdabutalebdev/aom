import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import config from './index';

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

// Local-disk fallback storage engine — used automatically whenever Cloudinary
// credentials aren't configured (e.g. local dev without an account set up),
// so upload features stay usable. Delegates to the wrapped Cloudinary storage
// engine the moment real credentials are present, so no route/controller
// changes are ever needed either way. Mirrors the folder/filename/URL
// convention already used by teacherApplication.controller.ts's own local
// fallback, and is served by the existing `app.use('/uploads', ...)` static
// route in app.ts.
class HybridStorage {
  private cloudinaryStorage: CloudinaryStorage;
  private folder: string;

  constructor(cloudinaryStorage: CloudinaryStorage, folder: string) {
    this.cloudinaryStorage = cloudinaryStorage;
    this.folder = folder;
  }

  _handleFile(
    req: unknown,
    file: { originalname: string; stream: NodeJS.ReadableStream },
    cb: (error: unknown, info?: { path: string }) => void,
  ) {
    if (cloudinary.config().cloud_name) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.cloudinaryStorage as any)._handleFile(req, file, cb);
      return;
    }

    const uploadsDir = path.join(process.cwd(), 'uploads', this.folder);
    fs.mkdirSync(uploadsDir, { recursive: true });
    const ext = path.extname(file.originalname) || '';
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const outStream = fs.createWriteStream(path.join(uploadsDir, filename));

    file.stream.pipe(outStream);
    outStream.on('error', cb);
    outStream.on('finish', () => {
      cb(null, { path: `${config.server_url}/uploads/${this.folder}/${filename}` });
    });
  }

  _removeFile(req: unknown, file: { path: string }, cb: (error: Error | null) => void) {
    if (cloudinary.config().cloud_name) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.cloudinaryStorage as any)._removeFile(req, file, cb);
      return;
    }
    const relative = file.path.replace(`${config.server_url}/uploads/`, '');
    fs.unlink(path.join(process.cwd(), 'uploads', relative), () => cb(null));
  }
}

// ─── Image Storage (Thumbnails, Banners, Avatars, etc.) ─────
const cloudinaryImageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: 'aom-online-madrasa/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1280, height: 720, crop: 'limit', quality: 'auto' }],
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
  }),
});
const imageStorage = new HybridStorage(cloudinaryImageStorage, 'images');

// ─── Video Storage (Lesson videos, Recordings) ──────────────
const cloudinaryVideoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: 'aom-online-madrasa/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
  }),
});
const videoStorage = new HybridStorage(cloudinaryVideoStorage, 'videos');

// ─── File Storage (PDFs, PPTs, DOCs, ZIPs) ──────────────────
const cloudinaryFileStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    // Sanitize filename: remove special chars, spaces → underscores
    const safeName = file.originalname
      .replace(/\.[^/.]+$/, '') // remove extension
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 60);
    return {
      folder: 'aom-online-madrasa/materials',
      resource_type: 'raw',
      // NOTE: Do NOT use allowed_formats with resource_type: 'raw' — it causes errors
      public_id: `${Date.now()}-${safeName}`,
    };
  },
});
const fileStorage = new HybridStorage(cloudinaryFileStorage, 'materials');

// Allowed file extensions for material upload
const ALLOWED_FILE_TYPES = /\.(pdf|ppt|pptx|doc|docx|zip|xlsx|xls|csv|txt)$/i;

// ─── Multer Upload Middlewares ───────────────────────────────
export const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

export const uploadFile = multer({
  storage: fileStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (
    _req: unknown,
    file: { originalname: string },
    cb: (error: Error | null, acceptFile?: boolean) => void,
  ) => {
    if (ALLOWED_FILE_TYPES.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed: PDF, PPT, DOC, ZIP, XLSX`));
    }
  },
});

export { cloudinary };
