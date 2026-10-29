import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';
import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import adminContentRoutes from './routes/admin-content.js';
import chatRoutes from './routes/chat.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PgStore = connectPgSimple(session);
const isProd = process.env.NODE_ENV === 'production';

const app = express();
// Wajib di belakang proxy (Render, Railway, Nginx) agar cookie secure dan rate limit berfungsi
app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));

app.use(
  session({
    store: new PgStore({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: isProd, maxAge: 8 * 60 * 60 * 1000 },
  }),
);

app.use('/uploads', express.static(path.join(root, 'public', 'uploads')));
app.use(express.static(path.join(root, 'dist')));

app.use('/api', publicRoutes);
app.use('/api', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminContentRoutes);
app.use('/api', (_req, res) => res.status(404).json({ message: 'Endpoint tidak ditemukan.' }));

// SPA fallback: semua URL non-API dikembalikan ke index.html
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  res.sendFile(path.join(root, 'dist', 'index.html'));
});

app.use((err, _req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(422).json({ message: 'Ukuran file melebihi batas yang diizinkan.', errors: {} });
  }
  if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(422).json({ message: 'Jumlah atau nama berkas unggahan tidak sesuai.', errors: {} });
  }
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ message: err.message, errors: err.errors ?? {} });
  }
  console.error(err);
  res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
});

const port = Number(process.env.PORT) || 8000;
app.listen(port, () => console.log(`Server berjalan di http://localhost:${port}`));
