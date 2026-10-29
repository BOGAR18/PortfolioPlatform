// Jalankan SETELAH `npm run db:migrate`:  npm run db:revisi
// Tambahkan --force untuk menerjemahkan ulang SEMUA data (menimpa terjemahan lama):  npm run db:revisi -- --force
// 1) Mengganti judul bagian About lama di database (hanya jika masih berisi teks bawaan lama).
// 2) Menerjemahkan otomatis proyek & perjalanan yang sudah ada tetapi belum punya versi Inggris.
import 'dotenv/config';
import { pool } from '../server/db.js';
const FORCE = process.argv.includes('--force');
import { translateToEnglish } from '../server/lib/translate.js';

// Jika terjemahan baru gagal, pertahankan nilai lama (jangan ditimpa kosong)
const tr = async (text, old) => (!FORCE && old) || (await translateToEnglish(text, { patient: true })) || old || null;

const NEW = {
  about_title: ['Kode yang baik lahir dari pemahaman yang dalam', 'Dari ide sederhana menjadi aplikasi yang berguna'],
  about_title_en: ['Good code comes from deep understanding', 'From a simple idea to a useful application'],
};

try {
  for (const [key, [oldVal, newVal]] of Object.entries(NEW)) {
    const { rowCount } = await pool.query(
      'UPDATE settings SET value = $1, updated_at = NOW() WHERE key = $2 AND value = $3', [newVal, key, oldVal],
    );
    console.log(`${key}: ${rowCount ? 'diganti' : 'tidak diubah (sudah berbeda dari teks lama)'}`);
  }

  const { rows: projects } = await pool.query(
    'SELECT id, title, summary, description, title_en, summary_en, description_en FROM projects',
  );
  for (const p of projects) {
    const title_en = await tr(p.title, p.title_en);
    const summary_en = await tr(p.summary, p.summary_en);
    const description_en = await tr(p.description, p.description_en);
    await pool.query('UPDATE projects SET title_en = $1, summary_en = $2, description_en = $3 WHERE id = $4',
      [title_en, summary_en, description_en, p.id]);
    console.log(`Proyek "${p.title}" -> ${title_en ?? '(gagal diterjemahkan, coba lagi nanti)'}`);
  }

  const { rows: exps } = await pool.query('SELECT id, role, description, role_en, description_en FROM experiences');
  for (const e of exps) {
    const role_en = await tr(e.role, e.role_en);
    const description_en = await tr(e.description, e.description_en);
    await pool.query('UPDATE experiences SET role_en = $1, description_en = $2 WHERE id = $3', [role_en, description_en, e.id]);
    console.log(`Perjalanan "${e.role}" -> ${role_en ?? '(gagal diterjemahkan, coba lagi nanti)'}`);
  }
  console.log('Selesai.');
} catch (err) {
  console.error('Gagal:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
