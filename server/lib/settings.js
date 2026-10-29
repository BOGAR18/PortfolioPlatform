import { pool } from '../db.js';

/** Teks yang punya versi Indonesia (key) dan English (key_en) */
export const TEXT_KEYS = [
  'hero_badge', 'hero_title', 'hero_subtitle', 'card_role',
  'about_title', 'about_text_1', 'about_text_2', 'contact_location', 'contact_response',
];

/** Data satu bahasa saja */
export const SINGLE_KEYS = [
  'contact_email', 'contact_whatsapp', 'contact_phone',
  'social_github', 'social_linkedin', 'social_instagram',
];

/** Warna tema: mode, variabel CSS, dan nilai bawaan (sama dengan palet di app.css) */
export const COLOR_KEYS = {
  color_light_bg: { mode: 'light', cssVar: '--bg', default: '#F5F8FF' },
  color_light_bg_alt: { mode: 'light', cssVar: '--bg-alt', default: '#EBF1FC' },
  color_light_accent: { mode: 'light', cssVar: '--accent', default: '#2D5FD0' },
  color_dark_bg: { mode: 'dark', cssVar: '--bg', default: '#050914' },
  color_dark_accent: { mode: 'dark', cssVar: '--accent', default: '#5B8DEF' },
};

export async function readSettingsMap() {
  const { rows } = await pool.query('SELECT key, value FROM settings');
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function upsertSetting(db, key, value) {
  await db.query(
    `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [key, value],
  );
}
