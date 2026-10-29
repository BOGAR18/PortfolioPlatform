import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { pool } from '../db.js';
import { registrationOpen, startSession } from '../lib/auth.js';
import { str, isEmail, fail, isTrue } from '../lib/validate.js';

const router = Router();
const loginLimiter = rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: true, legacyHeaders: false });
const DAY = 24 * 60 * 60 * 1000;

router.get('/me', async (req, res) => {
  let user = null;
  if (req.session.userId) {
    const { rows } = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [req.session.userId]);
    user = rows[0] ?? null;
  }
  res.json({ user, registrationOpen: await registrationOpen() });
});

router.post('/login', loginLimiter, async (req, res, next) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');
  const errors = {};
  if (!isEmail(email)) errors.email = 'Masukkan alamat email yang valid.';
  if (!password) errors.password = 'Kata sandi wajib diisi.';
  if (Object.keys(errors).length) return fail(res, errors);

  const { rows: [user] } = await pool.query(
    'SELECT id, name, email, password FROM users WHERE email = $1', [email],
  );
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return fail(res, { email: 'Email atau kata sandi salah.' });
  }

  try {
    const remember = isTrue(req.body?.remember);
    await startSession(req, user.id, remember ? 30 * DAY : 8 * 60 * 60 * 1000);
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
});

router.post('/register', async (req, res, next) => {
  if (!(await registrationOpen())) {
    return res.status(403).json({ message: 'Registrasi sudah ditutup karena admin sudah terdaftar.' });
  }

  const name = str(req.body?.name) ?? '';
  const email = (str(req.body?.email) ?? '').toLowerCase();
  const password = String(req.body?.password ?? '');
  const confirm = String(req.body?.password_confirmation ?? '');
  const errors = {};

  if (!name) errors.name = 'Nama wajib diisi.';
  else if (name.length > 100) errors.name = 'Nama maksimal 100 karakter.';

  if (!isEmail(email)) errors.email = 'Masukkan alamat email yang valid.';
  else if (email.length > 150) errors.email = 'Email maksimal 150 karakter.';
  else {
    const { rowCount } = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (rowCount > 0) errors.email = 'Email sudah terdaftar.';
  }

  if (password.length < 8) errors.password = 'Kata sandi minimal 8 karakter.';
  else if (password !== confirm) errors.password = 'Konfirmasi kata sandi tidak sama.';

  if (Object.keys(errors).length) return fail(res, errors);

  try {
    const hash = await bcrypt.hash(password, 12);
    const { rows: [user] } = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hash],
    );
    await startSession(req, user.id, 8 * 60 * 60 * 1000);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

export default router;
