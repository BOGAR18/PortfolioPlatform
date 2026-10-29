import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../../api.js';
import { AdminTop } from '../../components/AdminLayout.jsx';
import { useNotify } from '../../context/NotifyContext.jsx';
import { uploadUrl } from '../../lib/format.js';

export default function TechItems() {
  const location = useLocation();
  const [rows, setRows] = useState(null);
  const notify = useNotify();
  const setError = (m) => { if (m) notify.error(m); };

  const load = () => api('/admin/tech-items').then(setRows).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const remove = async (item) => {
    if (!(await notify.confirm(`Hapus "${item.name}"?`))) return;
    try {
      await api(`/admin/tech-items/${item.id}`, { method: 'DELETE' });
      load();
      notify.success('Data berhasil dihapus.');
    } catch (e) { setError(e.message); }
  };

  return (
    <>
      <AdminTop
        title="Item Tech"
        actions={<Link to="/admin/tech-items/new" className="btn btn-accent btn-sm"><i className="bi bi-plus-lg me-1" />Tambah item</Link>}
      />

      <div className="admin-card">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr><th style={{ width: 72 }}>Logo</th><th>Nama</th><th>Kategori</th><th>Urutan</th><th className="text-end">Aksi</th></tr>
            </thead>
            <tbody>
              {rows && rows.length === 0 && (
                <tr><td colSpan="5" className="text-center text-muted-2 py-4">Belum ada item tech.</td></tr>
              )}
              {rows?.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.logo
                      ? <img src={uploadUrl(item.logo)} alt="" className="logo-sm" />
                      : <span className="text-muted-2"><i className="bi bi-cpu" /></span>}
                  </td>
                  <td className="fw-medium">{item.name}</td>
                  <td>{item.category_name}</td>
                  <td>{item.sort_order}</td>
                  <td className="text-end text-nowrap">
                    <Link to={`/admin/tech-items/${item.id}/edit`} className="btn btn-soft btn-sm"><i className="bi bi-pencil" />Edit</Link>{' '}
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => remove(item)}>
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
