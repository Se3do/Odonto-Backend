import { BadRequestException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { basename, extname, join } from 'path';
import { diskStorage } from 'multer';

export const UPLOAD_DIR = join(process.cwd(), 'uploads', 'cases');

export const CASE_IMAGE_TYPES = [
  'XRay',
  'CT',
  'MRI',
  'ClinicalPhoto',
  'Diagram',
] as const;

export const imageUploadOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      mkdirSync(UPLOAD_DIR, { recursive: true });
      cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
      cb(null, `${randomUUID()}${extname(file.originalname) || '.jpg'}`);
    },
  }),
  fileFilter: (_req: any, file: Express.Multer.File, cb: (err: Error | null, accept: boolean) => void) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new BadRequestException('Only image files are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
};

export async function deleteUploadedFile(url: string): Promise<void> {
  const match = /^\/uploads\/cases\/([^/]+)$/.exec(url);
  if (!match) {
    return;
  }
  const filePath = join(UPLOAD_DIR, basename(match[1]));
  try {
    await unlink(filePath);
  } catch {
    // file already gone; removing the DB row is what matters
  }
}

// ponytail: multer writes the file before handler validation, so failed
// uploads (bad imageType, unknown case) leave orphaned files in UPLOAD_DIR.
// Acceptable for an admin-only endpoint; add a scheduled sweep if it grows.

