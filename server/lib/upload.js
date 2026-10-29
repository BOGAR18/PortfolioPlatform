import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const uploadDir = path.join(root, 'public', 'uploads');

const EXT = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/svg+xml', '.svg'],
]);
const RASTER = ['image/jpeg', 'image/png', 'image/webp'];

function makeUploader(folder, { maxBytes, allow, files = 1 }) {
  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        const dir = path.join(uploadDir, folder);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) => {
        cb(null, crypto.randomBytes(12).toString('hex') + EXT.get(file.mimetype));
      },
    }),
    limits: { fileSize: maxBytes, files },
    fileFilter: (_req, file, cb) => {
      if (!allow.includes(file.mimetype)) {
        return cb(Object.assign(new Error('Format file harus JPG, PNG, atau WEBP.'), { status: 422, expose: true }));
      }
      cb(null, true);
    },
  });
}

export const projectImageUpload = makeUploader('projects', { maxBytes: 3 * 1024 * 1024, allow: RASTER, files: 10 });
export const techLogoUpload = makeUploader('tech', { maxBytes: 1024 * 1024, allow: [...RASTER, 'image/svg+xml'] });
export const certImageUpload = makeUploader('certifications', { maxBytes: 2 * 1024 * 1024, allow: RASTER });

export function deleteFiles(files = []) {
  for (const f of files) fs.promises.unlink(f.path).catch(() => {});
}

export function deleteUpload(relativePath) {
  if (!relativePath) return;
  fs.promises.unlink(path.join(uploadDir, relativePath)).catch(() => {});
}
