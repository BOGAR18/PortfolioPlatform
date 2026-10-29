import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../server/db.js';

const dir = path.dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(path.join(dir, 'schema.sql'), 'utf8');

try {
  await pool.query(sql);
  console.log('Migrasi selesai.');
} catch (err) {
  console.error('Migrasi gagal:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
