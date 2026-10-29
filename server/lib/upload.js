import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const uploadDir = path.join(root, 'public', 'uploads');

// Jika SUPABASE_URL + SUPABASE_SERVICE_KEY diisi, file disimpan di Supabase Storage (wajib di Vercel).
// Jika kosong, file disimpan di folder lokal public/uploads (untuk development).
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const BUCKET = process.env.SUPABASE_BUCKET || 'uploads';
export const useRemote = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const publicUrl = (rel) => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${rel}`;

const objectUrl = (rel) => `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${rel}`;
const authHeaders = { Authorization: `Bearer ${SUPABASE_KEY}`, apikey: SUPABASE_KEY };

const EXT = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/svg+xml', '.svg'],
]);
const RASTER = ['image/jpeg', 'image/png', 'image/webp'];

async function remoteUpload(rel, buffer, contentType) {
  const res = await fetch(objectUrl(rel), {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': contentType, 'x-upsert': 'true' },
    body: buffer,
  });
  if (!res.ok) throw new Error(`Upload ke Supabase Storage gagal (${res.status}): ${await res.text()}`);
}

async function remoteDelete(rel) {
  await fetch(objectUrl(rel), { method: 'DELETE', headers: authHeaders }).catch(() => {});
}

/** Storage engine multer: menyimpan ke Supabase Storage, mengisi file.filename dan file.path seperti diskStorage */
function supabaseStorage(folder) {
  return {
    _handleFile(_req, file, cb) {
      const chunks = [];
      file.stream.on('data', (c) => chunks.push(c));
      file.stream.on('error', cb);
      file.stream.on('limit', () => {});
      file.stream.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          const filename = crypto.randomBytes(12).toString('hex') + EXT.get(file.mimetype);
          const rel = `${folder}/${filename}`;
          await remoteUpload(rel, buffer, file.mimetype);
          cb(null, { filename, path: rel, size: buffer.length });
        } catch (err) {
          cb(err);
        }
      });
    },
    _removeFile(_req, file, cb) {
      remoteDelete(file.path).finally(() => cb(null));
    },
  };
}

function makeUploader(folder, { maxBytes, allow, files = 1 }) {
  const storage = useRemote
    ? supabaseStorage(folder)
    : multer.diskStorage({
        destination: (_req, _file, cb) => {
          const dir = path.join(uploadDir, folder);
          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          cb(null, crypto.randomBytes(12).toString('hex') + EXT.get(file.mimetype));
        },
      });
  return multer({
    storage,
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
export const profileImageUpload = makeUploader('profile', { maxBytes: 3 * 1024 * 1024, allow: RASTER });

export function deleteFiles(files = []) {
  for (const f of files) {
    if (useRemote) remoteDelete(f.path);
    else fs.promises.unlink(f.path).catch(() => {});
  }
}

export function deleteUpload(relativePath) {
  if (!relativePath) return;
  if (useRemote) remoteDelete(relativePath);
  else fs.promises.unlink(path.join(uploadDir, relativePath)).catch(() => {});
}
