import 'dotenv/config';
import pg from 'pg';

// Kolom DATE dikembalikan sebagai teks "YYYY-MM-DD" agar tidak bergeser zona waktu
pg.types.setTypeParser(1082, (value) => value);

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: process.env.VERCEL ? 3 : 10,
});
