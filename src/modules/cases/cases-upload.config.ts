import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

export const CASE_IMAGE_TYPES = [
  'XRay',
  'CT',
  'MRI',
  'ClinicalPhoto',
  'Diagram',
] as const;

export const imageUploadOptions = {
  storage: memoryStorage(),
  fileFilter: (_req: any, file: Express.Multer.File, cb: (err: Error | null, accept: boolean) => void) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new BadRequestException('Only image files are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
};
