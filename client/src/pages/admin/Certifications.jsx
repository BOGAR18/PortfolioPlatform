import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../../api.js';
import { AdminTop } from '../../components/AdminLayout.jsx';
import { useNotify } from '../../context/NotifyContext.jsx';

export default function Certifications() {
  const location = useLocation();
  const [rows, setRows] = useState(null);
  const notify = useNotify();
  const setError = (m) => { if (m) notify.error(m); };

  const load = () => api('/admin/certifications').then(setRows).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const remove = async (c) => {
    if (!(await notify.confirm(`Hapus sertifikasi ${c.name}?`))) return;
    try {
      await api(`/admin/certifications/${c.id}`, { method: 'DELETE' });
      load();
      notify.success('Data berhasil dihapus.');
    } catch (e) { setError(e.message); }
  };

  return (
    <>
      <AdminTop
        title="Sertifikasi"
        actions={<Link to="/admin/certifications/new" className="btn btn-accent btn-sm"><i className="bi bi-plus-lg me-1" />Tambah sertifikasi</Link>}
      />

      <div className="admin-card">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr><th>Nama</th><th>Penerbit</th><th>Terbit</th><th>Urutan</th><th className="text-end">Aksi</th></tr>
            </thead>
            <tbody>
              {rows && rows.length === 0 && (
                <tr><td colSpan="5" className="text-center text-muted-2 py-4">Belum ada sertifikasi.</td></tr>
              )}
              {rows?.map((c) => (
                <tr key={c.id}>
                  <td className="fw-medium">{c.name}</td>
                  <td>{c.issuer}</td>
                  <td className="text-nowrap">{c.issued_at ? String(c.issued_at).slice(0, 10) : '—'}</td>
                  <td>{c.sort_order}</td>
                  <td className="text-end text-nowrap">
                    <Link to={`/admin/certifications/${c.id}/edit`} className="btn btn-soft btn-sm"><i className="bi bi-pencil" />Edit</Link>{' '}
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => remove(c)}>
                      <i className="bi bi-trash" />Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
