import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from '../server/db.js';

const BRAND = process.env.APP_NAME || 'satrio.tegar';

const SETTINGS = {
  hero_badge: 'Terbuka untuk proyek baru',
  hero_title: `Kami membangun website dan aplikasi yang rapi, cepat, dan mudah dirawat.`,
  hero_subtitle: `${BRAND} membantu bisnis dan instansi mengubah kebutuhan operasional menjadi sistem yang benar-benar dipakai sehari-hari.`,
  card_role: 'Software House · Web & Aplikasi',
  about_title: 'Kode yang baik lahir dari pemahaman yang dalam',
  about_title_en: 'Good code comes from deep understanding',
  about_text_1: `${BRAND} adalah tim pengembang perangkat lunak yang fokus pada aplikasi web, sistem informasi, dan company profile untuk UMKM, sekolah, dan perusahaan.`,
  about_text_2: 'Setiap proyek dimulai dari memahami cara kerja klien, bukan langsung menulis kode. Hasilnya adalah sistem yang terasa natural dipakai dan mudah dikembangkan.',
  about_values: JSON.stringify([
    { icon: 'bi-bullseye', title: 'Berorientasi Hasil', text: 'Pengerjaan tepat waktu dan sesuai kesepakatan adalah standar minimum kami.' },
    { icon: 'bi-journal-code', title: 'Kode yang Terbaca', text: 'Kode ditulis agar mudah dipahami tim berikutnya, bukan hanya berjalan hari ini.' },
    { icon: 'bi-chat-dots', title: 'Komunikasi Terbuka', text: 'Progres dilaporkan rutin, dan hambatan disampaikan jauh sebelum tenggat.' },
    { icon: 'bi-shield-check', title: 'Aman Sejak Awal', text: 'Keamanan dibangun ke dalam setiap lapisan aplikasi sejak tahap perancangan.' },
  ]),
  contact_location: 'Indonesia (kerja jarak jauh)',
  contact_response: 'Kurang dari 1 hari kerja',
  hero_badge_en: 'Open for new projects',
  hero_title_en: 'We build websites and applications that are clean, fast, and easy to maintain.',
  hero_subtitle_en: `${BRAND} helps businesses and institutions turn operational needs into systems people actually use every day.`,
  card_role_en: 'Software House · Web & Applications',
  about_text_1_en: `${BRAND} is a software development team focused on web applications, information systems, and company profiles for small businesses, schools, and companies.`,
  about_text_2_en: 'Every project starts by understanding how the client works, not by writing code straight away. The result is a system that feels natural to use and is easy to grow.',
  about_values_en: JSON.stringify([
    { icon: 'bi-bullseye', title: 'Result-Oriented', text: 'On-time delivery and meeting the agreed scope are our minimum standard.' },
    { icon: 'bi-journal-code', title: 'Readable Code', text: 'Code is written so the next team can understand it, not just so it runs today.' },
    { icon: 'bi-chat-dots', title: 'Open Communication', text: 'Progress is reported regularly, and obstacles are raised well before the deadline.' },
    { icon: 'bi-shield-check', title: 'Secure From the Start', text: 'Security is built into every layer of the application from the design stage.' },
  ]),
  contact_location_en: 'Indonesia (remote work)',
  contact_response_en: 'Less than 1 business day',
};

const TECH = {
  Backend: ['Laravel', 'PHP', 'Node.js', 'REST API'],
  Frontend: ['Bootstrap', 'JavaScript', 'Vue.js', 'Tailwind CSS'],
  Database: ['MySQL', 'PostgreSQL', 'Redis'],
  'Tools & Deployment': ['Git', 'Docker', 'Nginx', 'Postman', 'Figma'],
};

const PROJECTS = [
  { title: 'Sistem Informasi Sekolah', summary: 'Aplikasi akademik terpadu: data siswa, absensi, jadwal, nilai, dan raport digital.', description: 'Sistem informasi sekolah yang menggabungkan data siswa, guru, jadwal pelajaran, absensi, dan penilaian dalam satu panel.\n\nOrang tua dapat memantau perkembangan anak, sementara guru tidak perlu lagi merekap nilai secara manual di akhir semester.', year: 2025, featured: true, techs: ['Laravel', 'PostgreSQL', 'Bootstrap'] },
  { title: 'Aplikasi Kasir UMKM', summary: 'Kasir berbasis web dengan stok barang, laporan harian, dan cetak struk.', description: 'Aplikasi kasir ringan untuk toko kecil dan menengah. Mencatat penjualan, mengurangi stok otomatis, dan menyajikan laporan harian serta bulanan.\n\nDirancang agar bisa dipakai pegawai baru tanpa pelatihan panjang.', year: 2025, featured: true, techs: ['Laravel', 'PostgreSQL', 'JavaScript'] },
  { title: 'Company Profile Klinik', summary: 'Website profil klinik dengan jadwal dokter, layanan, dan formulir janji temu.', description: 'Website profil untuk klinik swasta dengan halaman dokter, jadwal praktik, dan informasi layanan.\n\nKonten dapat diubah sendiri oleh admin klinik tanpa bantuan developer.', year: 2024, featured: true, techs: ['Laravel', 'Bootstrap', 'PostgreSQL'] },
  { title: 'Dashboard Monitoring Penjualan', summary: 'Dashboard grafik penjualan per cabang, produk, dan periode untuk tim manajemen.', description: 'Dashboard internal yang merangkum data penjualan dari beberapa cabang dalam satu tampilan.\n\nManajemen bisa melihat tren, produk terlaris, dan membandingkan performa antar cabang.', year: 2024, featured: false, techs: ['Vue.js', 'Node.js', 'PostgreSQL'] },
];

const EXPERIENCES = [
  { role: 'Pengembangan Produk & Layanan Klien', company: BRAND, start_year: 2024, end_year: null, description: 'Mengerjakan sistem informasi, company profile, dan aplikasi bisnis untuk berbagai klien.' },
  { role: 'Proyek Freelance', company: 'Mandiri', start_year: 2022, end_year: 2024, description: 'Membangun website dan aplikasi web untuk UMKM dan institusi pendidikan.' },
  { role: 'Mulai Belajar Pemrograman Web', company: 'Otodidak', start_year: 2020, end_year: 2022, description: 'Mendalami PHP, Laravel, dan basis data lewat proyek-proyek kecil.' },
];

const CERTIFICATIONS = [
  { name: 'Contoh Sertifikat Web Developer', issuer: 'Nama Penerbit', issued_at: '2024-06-01' },
  { name: 'Contoh Sertifikat Backend Developer', issuer: 'Nama Penerbit', issued_at: '2023-11-01' },
  { name: 'Contoh Sertifikat Basis Data', issuer: 'Nama Penerbit', issued_at: '2023-03-01' },
];

const client = await pool.connect();
try {
  await client.query('BEGIN');

  // Admin pertama (dilewati jika email sudah ada)
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await client.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
    [process.env.ADMIN_NAME || 'Admin', process.env.ADMIN_EMAIL.toLowerCase(), hash],
  );

  // Pengaturan: hanya mengisi key yang belum ada, supaya perubahan dari admin tidak tertimpa
  for (const [key, value] of Object.entries(SETTINGS)) {
    await client.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
      [key, value],
    );
  }

  // Tech stack (dicek dulu agar aman dijalankan berulang)
  for (const [catOrder, [catName, items]] of Object.entries(TECH).entries()) {
    let { rows: [cat] } = await client.query('SELECT id FROM category_tech WHERE name = $1', [catName]);
    if (!cat) {
      ({ rows: [cat] } = await client.query(
        'INSERT INTO category_tech (name, sort_order) VALUES ($1, $2) RETURNING id',
        [catName, catOrder],
      ));
    }
    for (const [n, name] of items.entries()) {
      const { rowCount } = await client.query(
        'SELECT 1 FROM item_tech WHERE category_tech_id = $1 AND name = $2', [cat.id, name],
      );
      if (rowCount === 0) {
        await client.query(
          'INSERT INTO item_tech (category_tech_id, name, sort_order) VALUES ($1, $2, $3)',
          [cat.id, name, n],
        );
      }
    }
  }

  // Proyek contoh
  for (const [i, p] of PROJECTS.entries()) {
    const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const { rows: [proj] } = await client.query(
      `INSERT INTO projects (title, slug, summary, description, year, is_featured, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (slug) DO NOTHING RETURNING id`,
      [p.title, slug, p.summary, p.description, p.year, p.featured, i],
    );
    if (!proj) continue;
    await client.query(
      `INSERT INTO item_tech_project (project_id, item_tech_id)
       SELECT $1::int, id FROM item_tech WHERE name = ANY($2::text[])
       ON CONFLICT DO NOTHING`,
      [proj.id, p.techs],
    );
  }

  // Pengalaman & sertifikasi contoh
  for (const [i, e] of EXPERIENCES.entries()) {
    const { rowCount } = await client.query('SELECT 1 FROM experiences WHERE role = $1', [e.role]);
    if (rowCount === 0) {
      await client.query(
        'INSERT INTO experiences (role, company, start_year, end_year, description, sort_order) VALUES ($1, $2, $3, $4, $5, $6)',
        [e.role, e.company, e.start_year, e.end_year, e.description, i],
      );
    }
  }
  for (const [i, c] of CERTIFICATIONS.entries()) {
    const { rowCount } = await client.query('SELECT 1 FROM certifications WHERE name = $1', [c.name]);
    if (rowCount === 0) {
      await client.query(
        'INSERT INTO certifications (name, issuer, issued_at, sort_order) VALUES ($1, $2, $3, $4)',
        [c.name, c.issuer, c.issued_at, i],
      );
    }
  }

  await client.query('COMMIT');
  console.log('Seed selesai. Ganti data contoh lewat panel admin.');
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Seed gagal:', err.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
