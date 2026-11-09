export async function api(path, { method = 'GET', body } = {}) {
  const isForm = body instanceof FormData;
  const isGet = method === 'GET';
  const TIMEOUT = 15000;

  const attempt = async () => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
    try {
      return await fetch(`/api${path}`, {
        method,
        credentials: 'same-origin',
        signal: ctrl.signal,
        headers: isForm || body === undefined ? {} : { 'Content-Type': 'application/json' },
        body: isForm || body === undefined ? body : JSON.stringify(body),
      });
    } finally {
      clearTimeout(timer);
    }
  };

  let res;
  try {
    res = await attempt();
  } catch (e) {
    // Jaringan HP kadang putus/lambat: request GET dicoba ulang sekali
    if (!isGet) throw new Error('Koneksi bermasalah. Coba lagi.');
    res = await attempt().catch(() => { throw new Error('Koneksi bermasalah. Coba lagi.'); });
  }
  // Fungsi serverless yang baru bangun bisa membalas 502/503/504; coba ulang sekali untuk GET
  if (isGet && [502, 503, 504].includes(res.status)) {
    res = await attempt().catch(() => res);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Terjadi kesalahan.');
    err.errors = data.errors || {};
    err.status = res.status;
    throw err;
  }
  return data;
}
