import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../../api.js';
import { AdminTop } from '../../components/AdminLayout.jsx';
import { useNotify } from '../../context/NotifyContext.jsx';

export default function Experiences() {
  const location = useLocation();
  const [rows, setRows] = useState(null);
  const notify = useNotify();
  const setError = (m) => { if (m) notify.error(m); };

  const load = () => api('/admin/experiences').then(setRows).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const remove = async (x) => {
    if (!(await notify.confirm(`Hapus perjalanan ${x.role}?`))) return;
    try {
      await api(`/admin/experiences/${x.id}`, { method: 'DELETE' });
      load();
      notify.success('Data berhasil dihapus.');
    } catch (e) { setError(e.message); }
  };

  return (
    <>
      <AdminTop
        title="Perjalanan"
        actions={<Link to="/admin/experiences/new" className="btn btn-accent btn-sm"><i className="bi bi-plus-lg me-1" />Tambah perjalanan</Link>}
      />

      <div className="admin-card">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr><th>Periode</th><th>Peran</th><th>Perusahaan / Tempat</th><th>Urutan</th><th className="text-end">Aksi</th></tr>
            </thead>
            <tbody>
              {rows && rows.length === 0 && (
                <tr><td colSpan="5" className="text-center text-muted-2 py-4">Belum ada perjalanan.</td></tr>
              )}
              {rows?.map((x) => (
                <tr key={x.id}>
                  <td className="text-nowrap">{x.start_year} – {x.end_year ?? 'Sekarang'}</td>
                  <td className="fw-medium">{x.role}</td>
                  <td>{x.company}</td>
                  <td>{x.sort_order}</td>
                  <td className="text-end text-nowrap">
                    <Link to={`/admin/experiences/${x.id}/edit`} className="btn btn-soft btn-sm"><i className="bi bi-pencil" />Edit</Link>{' '}
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => remove(x)}>
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
