import 'dotenv/config';
import pg from 'pg';

// Kolom DATE dikembalikan sebagai teks "YYYY-MM-DD" agar tidak bergeser zona waktu
pg.types.setTypeParser(1082, (value) => value);

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  // Di Vercel tiap instance fungsi punya pool sendiri, jadi dibuat kecil dan cepat dilepas
  // agar tidak menghabiskan batas koneksi Supabase.
  max: process.env.VERCEL ? 2 : 10,
  idleTimeoutMillis: process.env.VERCEL ? 5000 : 30000,
  connectionTimeoutMillis: 8000,
});
