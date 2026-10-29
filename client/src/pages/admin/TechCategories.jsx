import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../../api.js';
import { AdminTop } from '../../components/AdminLayout.jsx';
import { useNotify } from '../../context/NotifyContext.jsx';

export default function TechCategories() {
  const location = useLocation();
  const [rows, setRows] = useState(null);
  const notify = useNotify();
  const setError = (m) => { if (m) notify.error(m); };

  const load = () => api('/admin/tech-categories').then(setRows).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const remove = async (c) => {
    if (!(await notify.confirm(`Hapus kategori ini beserta ${c.items_count} item di dalamnya?`))) return;
    try {
      await api(`/admin/tech-categories/${c.id}`, { method: 'DELETE' });
      load();
      notify.success('Data berhasil dihapus.');
    } catch (e) { setError(e.message); }
  };

  return (
    <>
      <AdminTop
        title="Kategori Tech"
        actions={<Link to="/admin/tech-categories/new" className="btn btn-accent btn-sm"><i className="bi bi-plus-lg me-1" />Tambah kategori</Link>}
      />

      <div className="admin-card">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr><th>Nama</th><th>Jumlah item</th><th>Urutan</th><th className="text-end">Aksi</th></tr>
            </thead>
            <tbody>
              {rows && rows.length === 0 && (
                <tr><td colSpan="4" className="text-center text-muted-2 py-4">Belum ada kategori.</td></tr>
              )}
              {rows?.map((c) => (
                <tr key={c.id}>
                  <td className="fw-medium">{c.name}</td>
                  <td>{c.items_count}</td>
                  <td>{c.sort_order}</td>
                  <td className="text-end text-nowrap">
                    <Link to={`/admin/tech-categories/${c.id}/edit`} className="btn btn-soft btn-sm"><i className="bi bi-pencil" />Edit</Link>{' '}
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
