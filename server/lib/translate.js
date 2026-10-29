// Terjemahan otomatis Indonesia -> Inggris lewat endpoint terjemahan Google yang tidak butuh API key
// (gratis, tanpa kartu kredit). Endpoint ini tidak resmi, jadi bisa saja berubah atau membatasi permintaan.
// Jika terjemahan gagal, simpan tetap berjalan dan situs memakai teks Indonesia.
const ENDPOINT = 'https://translate.googleapis.com/translate_a/single';
const MAX_CHUNK = 900;
const TIMEOUT_MS = 3000;
const GAP_MS = 350;          // jeda antar permintaan agar tidak kena batas (HTTP 429)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Semua permintaan dijalankan satu per satu (antrean), dengan jeda kecil di antaranya
let chain = Promise.resolve();
function enqueue(fn) {
  const run = chain.then(fn, fn);
  chain = run.catch(() => {}).then(() => sleep(GAP_MS));
  return run;
}

function splitLong(text) {
  const parts = [];
  let rest = text;
  while (rest.length > MAX_CHUNK) {
    let cut = rest.lastIndexOf(' ', MAX_CHUNK);
    if (cut < 100) cut = MAX_CHUNK;
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

/** Pecah teks per baris, lalu per kalimat, agar tiap potongan <= MAX_CHUNK */
function toChunks(text) {
  const chunks = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) { chunks.push(''); continue; }
    if (line.length <= MAX_CHUNK) { chunks.push(line); continue; }
    let buf = '';
    for (const sentence of line.split(/(?<=[.!?])\s+/)) {
      if (sentence.length > MAX_CHUNK) {
        if (buf) { chunks.push(buf); buf = ''; }
        chunks.push(...splitLong(sentence));
      } else if ((buf + ' ' + sentence).trim().length > MAX_CHUNK) {
        chunks.push(buf);
        buf = sentence;
      } else {
        buf = (buf + ' ' + sentence).trim();
      }
    }
    if (buf) chunks.push(buf);
  }
  return chunks;
}

async function translateChunk(text, deadline, retries) {
  if (!text.trim()) return text;
  const params = new URLSearchParams({ client: 'gtx', sl: 'id', tl: 'en', dt: 't', q: text });
  for (let attempt = 0; ; attempt++) {
    const left = deadline - Date.now();
    if (left < 500) throw new Error('waktu terjemahan habis');
    const res = await fetch(`${ENDPOINT}?${params}`, {
      signal: AbortSignal.timeout(Math.min(TIMEOUT_MS, left)),
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      await sleep(900 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`Layanan terjemahan HTTP ${res.status}`);
    const data = await res.json();
    const out = Array.isArray(data?.[0]) ? data[0].map((seg) => seg?.[0] ?? '').join('') : '';
    if (!out.trim()) throw new Error('Layanan terjemahan mengembalikan hasil kosong');
    return out;
  }
}

/**
 * Terjemahkan teks Indonesia ke Inggris. Mengembalikan null jika gagal.
 * Saat dipakai di server (Vercel batas 10 detik) waktu dibatasi ±5 detik.
 * { patient: true } dipakai script database: boleh menunggu lebih lama dan mencoba ulang lebih banyak.
 */
export async function translateToEnglish(text, { patient = false } = {}) {
  const src = (text ?? '').trim();
  if (!src) return null;
  const deadline = Date.now() + (patient ? 90_000 : 5000);
  const retries = patient ? 5 : 1;
  try {
    const chunks = toChunks(src);
    const out = await Promise.all(chunks.map((c) => enqueue(() => translateChunk(c, deadline, retries))));
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() || null;
  } catch (err) {
    console.warn('Terjemahan gagal:', err.message);
    return null;
  }
}

/**
 * Tentukan teks Inggris yang disimpan:
 * - belum ada terjemahan, atau teks Indonesia berubah -> terjemahkan ulang
 * - teks Indonesia sama dan terjemahan sudah ada -> pertahankan (termasuk hasil edit manual di database)
 */
export async function resolveEn(src, oldSrc, oldEn) {
  if (!src) return null;
  if (oldEn && src === oldSrc) return oldEn;
  return translateToEnglish(src);
}
