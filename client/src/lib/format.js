const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "2024-06-01" -> "Juni 2024" / "June 2024" (padanan translatedFormat('F Y')) */
export function formatMonthYear(dateStr, lang) {
  if (!dateStr) return '';
  const [y, m] = String(dateStr).split('-').map(Number);
  const names = lang === 'id' ? MONTHS_ID : MONTHS_EN;
  return `${names[m - 1]} ${y}`;
}

export const uploadUrl = (path) => (path ? `/uploads/${path}` : null);

export function parseList(raw) {
  try {
    const v = JSON.parse(raw || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
