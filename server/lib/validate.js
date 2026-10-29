export const str = (v) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
};
export const isInt = (v) => /^-?\d+$/.test(String(v));
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isUrl = (v) => {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};
export const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
export const toArray = (v) => [].concat(v ?? []);
export const isTrue = (v) => ['1', 'true', 'on', true].includes(v);

export function fail(res, errors) {
  return res.status(422).json({ message: 'Ada data yang belum benar.', errors });
}

export function parseJsonArray(raw) {
  try {
    const v = JSON.parse(raw ?? '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
