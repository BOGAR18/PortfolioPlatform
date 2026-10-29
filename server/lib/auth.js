import { pool } from '../db.js';

/** Registrasi dibuka selama belum ada admin, kecuali ALLOW_MULTI_ADMIN=true */
export async function registrationOpen() {
  if ((process.env.ALLOW_REGISTER ?? 'true') === 'false') return false;
  if (process.env.ALLOW_MULTI_ADMIN === 'true') return true;
  const { rows: [{ count }] } = await pool.query('SELECT COUNT(*)::int AS count FROM users');
  return count === 0;
}

export function startSession(req, userId, maxAge) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.userId = userId;
      req.session.cookie.maxAge = maxAge;
      resolve();
    });
  });
}
