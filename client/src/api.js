export async function api(path, { method = 'GET', body } = {}) {
  const isForm = body instanceof FormData;
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    headers: isForm || body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: isForm || body === undefined ? body : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Terjadi kesalahan.');
    err.errors = data.errors || {};
    err.status = res.status;
    throw err;
  }
  return data;
}
