import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { pool } from '../db.js';
import { readSettingsMap } from '../lib/settings.js';

const router = Router();
const limiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Terlalu banyak pesan. Coba lagi sebentar.' },
});

const STOP = new Set([
  'yang', 'dan', 'di', 'ke', 'dari', 'itu', 'ini', 'apa', 'apakah', 'atau', 'saya', 'kamu', 'anda', 'punya',
  'tentang', 'bisa', 'tolong', 'ada', 'aja', 'dong', 'untuk', 'dengan', 'the', 'is', 'a', 'an', 'of', 'in', 'to',
  'what', 'who', 'how', 'about', 'and', 'for', 'with', 'do', 'does', 'you', 'your', 'me', 'my', 'show', 'tell',
  'please', 'are', 'have', 'kah', 'ya',
]);

const INTENTS = {
  greeting: ['halo', 'hai', 'hi', 'hello', 'hey', 'selamat', 'pagi', 'siang', 'malam', 'assalamualaikum'],
  contact: ['kontak', 'hubungi', 'email', 'whatsapp', 'wa', 'telepon', 'nomor', 'contact', 'reach', 'linkedin', 'github', 'sosial', 'social', 'instagram', 'mail'],
  projects: ['proyek', 'project', 'projects', 'karya', 'portofolio', 'portfolio', 'aplikasi', 'website', 'dibuat', 'pernah', 'buat'],
  tech: ['tech', 'teknologi', 'technology', 'stack', 'skill', 'skills', 'kemampuan', 'framework', 'keahlian', 'menguasai', 'tools', 'bahasa'],
  certs: ['sertifikat', 'sertifikasi', 'certificate', 'certification', 'certifications', 'kredensial', 'lisensi'],
  experience: ['pengalaman', 'experience', 'perjalanan', 'kerja', 'career', 'karier', 'riwayat', 'pekerjaan', 'jabatan', 'work'],
  about: ['tentang', 'about', 'siapa', 'who', 'profil', 'profile', 'dirimu', 'background', 'latar', 'perkenalkan', 'introduce'],
  availability: ['tersedia', 'available', 'freelance', 'hire', 'sewa', 'rekrut', 'open', 'terbuka', 'harga', 'biaya', 'price', 'budget', 'quote', 'estimasi'],
};

const TEXT = {
  id: {
    greeting: 'Halo! Saya asisten portofolio ini. Tanyakan tentang proyek, teknologi, pengalaman, sertifikasi, atau cara menghubungi.',
    notFound: 'Maaf, saya hanya bisa menjawab pertanyaan seputar portofolio ini: proyek, teknologi, pengalaman, sertifikasi, dan kontak.',
    projects: 'Proyek di portofolio ini:',
    noProjects: 'Belum ada proyek yang ditampilkan.',
    tech: 'Teknologi yang digunakan:',
    noTech: 'Belum ada data teknologi.',
    certs: 'Sertifikasi:',
    noCerts: 'Belum ada sertifikasi yang ditampilkan.',
    exp: 'Pengalaman:',
    noExp: 'Belum ada data pengalaman.',
    contact: 'Cara menghubungi:',
    availability: 'Untuk proyek baru, silakan hubungi lewat kontak di bawah.',
    now: 'sekarang',
    year: 'Tahun',
    tech_used: 'Teknologi',
    detail: 'Lihat detail di',
    demo: 'Demo',
    repo: 'Source code',
    location: 'Lokasi',
    response: 'Waktu respons',
    suggest: ['Proyek apa saja?', 'Teknologi apa yang dipakai?', 'Pengalaman kerja', 'Sertifikasi', 'Cara menghubungi'],
  },
  en: {
    greeting: 'Hi! I am the assistant for this portfolio. Ask about projects, technologies, experience, certifications, or how to get in touch.',
    notFound: 'Sorry, I can only answer questions about this portfolio: projects, technologies, experience, certifications, and contact.',
    projects: 'Projects in this portfolio:',
    noProjects: 'No projects to show yet.',
    tech: 'Technologies used:',
    noTech: 'No technology data yet.',
    certs: 'Certifications:',
    noCerts: 'No certifications to show yet.',
    exp: 'Experience:',
    noExp: 'No experience data yet.',
    contact: 'How to get in touch:',
    availability: 'For new projects, please reach out through the contact details below.',
    now: 'present',
    year: 'Year',
    tech_used: 'Technologies',
    detail: 'See details at',
    demo: 'Demo',
    repo: 'Source code',
    location: 'Location',
    response: 'Response time',
    suggest: ['What projects are there?', 'What technologies are used?', 'Work experience', 'Certifications', 'How to contact'],
  },
};

const pick = (s, key, lang) => (lang === 'en' && s[`${key}_en`] ? s[`${key}_en`] : s[key] || '');

/** Membaca data portofolio terbaru dari database setiap kali ada pertanyaan */
async function loadKnowledge() {
  const [projects, techs, certs, exps, settings] = await Promise.all([
    pool.query(`
      SELECT p.id, p.title, p.slug, p.summary, p.description, p.year, p.project_url, p.repo_url,
             COALESCE(array_agg(i.name ORDER BY i.name) FILTER (WHERE i.name IS NOT NULL), '{}') AS techs
        FROM projects p
        LEFT JOIN item_tech_project pt ON pt.project_id = p.id
        LEFT JOIN item_tech i ON i.id = pt.item_tech_id
       GROUP BY p.id
       ORDER BY p.is_featured DESC, p.sort_order, p.created_at DESC`),
    pool.query(`
      SELECT c.name AS category, array_agg(i.name ORDER BY i.sort_order, i.name) AS items
        FROM category_tech c JOIN item_tech i ON i.category_tech_id = c.id
       GROUP BY c.id, c.name ORDER BY MIN(c.sort_order), c.name`),
    pool.query('SELECT name, issuer, issued_at FROM certifications ORDER BY sort_order, issued_at DESC NULLS LAST'),
    pool.query('SELECT role, company, start_year, end_year FROM experiences ORDER BY start_year DESC, sort_order'),
    readSettingsMap(),
  ]);
  return { projects: projects.rows, techs: techs.rows, certs: certs.rows, exps: exps.rows, settings };
}

const tokenize = (text) => String(text).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .split(/[^a-z0-9#+]+/).filter((t) => t.length > 1 && !STOP.has(t));

function projectReply(p, L, lang) {
  const lines = [p.title];
  if (p.year) lines.push(`${L.year}: ${p.year}`);
  lines.push(p.summary);
  if (p.techs.length) lines.push(`${L.tech_used}: ${p.techs.join(', ')}`);
  if (p.project_url) lines.push(`${L.demo}: ${p.project_url}`);
  if (p.repo_url) lines.push(`${L.repo}: ${p.repo_url}`);
  lines.push(`${L.detail} /projects/${p.slug}`);
  return lines.join('\n');
}

function intentReply(intent, kb, L, lang) {
  const s = kb.settings;
  switch (intent) {
    case 'greeting':
      return L.greeting;
    case 'contact': {
      const lines = [L.contact];
      if (s.contact_email) lines.push(`Email: ${s.contact_email}`);
      if (s.contact_whatsapp) lines.push(`WhatsApp: https://wa.me/${s.contact_whatsapp.replace(/\D/g, '')}`);
      if (s.social_github) lines.push(`GitHub: ${s.social_github}`);
      if (s.social_linkedin) lines.push(`LinkedIn: ${s.social_linkedin}`);
      if (s.social_instagram) lines.push(`Instagram: ${s.social_instagram}`);
      if (pick(s, 'contact_location', lang)) lines.push(`${L.location}: ${pick(s, 'contact_location', lang)}`);
      if (pick(s, 'contact_response', lang)) lines.push(`${L.response}: ${pick(s, 'contact_response', lang)}`);
      return lines.length > 1 ? lines.join('\n') : L.notFound;
    }
    case 'projects':
      if (!kb.projects.length) return L.noProjects;
      return [L.projects, ...kb.projects.map((p) => `• ${p.title}${p.year ? ` (${p.year})` : ''}`)].join('\n');
    case 'tech':
      if (!kb.techs.length) return L.noTech;
      return [L.tech, ...kb.techs.map((c) => `• ${c.category}: ${c.items.join(', ')}`)].join('\n');
    case 'certs':
      if (!kb.certs.length) return L.noCerts;
      return [L.certs, ...kb.certs.map((c) => `• ${c.name} — ${c.issuer}${c.issued_at ? ` (${String(c.issued_at).slice(0, 4)})` : ''}`)].join('\n');
    case 'experience':
      if (!kb.exps.length) return L.noExp;
      return [L.exp, ...kb.exps.map((e) => `• ${e.start_year} – ${e.end_year ?? L.now}: ${e.role} di ${e.company}`)].join('\n');
    case 'about': {
      const text = [pick(s, 'about_text_1', lang), pick(s, 'about_text_2', lang)].filter(Boolean).join('\n\n');
      return text || L.notFound;
    }
    case 'availability':
      return `${pick(s, 'hero_subtitle', lang)}\n\n${L.availability}`.trim();
    default:
      return L.notFound;
  }
}

function answer(message, kb, lang) {
  const L = TEXT[lang];
  const tk = tokenize(message);

  // 1. Pertanyaan tentang satu proyek (dicocokkan dengan judulnya)
  let best = null;
  let bestScore = 0;
  for (const p of kb.projects) {
    const titleTokens = tokenize(p.title);
    const score = tk.filter((t) => titleTokens.includes(t)).length;
    if (score > bestScore) {
      best = p;
      bestScore = score;
    }
  }
  if (best && bestScore > 0) return { reply: projectReply(best, L, lang), suggestions: L.suggest };

  // 2. Pertanyaan umum berdasarkan kata kunci
  let topIntent = null;
  let topScore = 0;
  for (const [intent, words] of Object.entries(INTENTS)) {
    const score = tk.filter((t) => words.includes(t)).length;
    if (score > topScore) {
      topIntent = intent;
      topScore = score;
    }
  }
  if (!topIntent) return { reply: L.notFound, suggestions: L.suggest };
  return { reply: intentReply(topIntent, kb, L, lang), suggestions: L.suggest };
}

router.post('/chat', limiter, async (req, res, next) => {
  try {
    const message = String(req.body?.message ?? '').trim().slice(0, 500);
    const lang = req.body?.lang === 'en' ? 'en' : 'id';
    const L = TEXT[lang];
    if (!message) return res.json({ reply: L.greeting, suggestions: L.suggest });

    const kb = await loadKnowledge();
    res.json(answer(message, kb, lang));
  } catch (err) {
    next(err);
  }
});

export default router;
