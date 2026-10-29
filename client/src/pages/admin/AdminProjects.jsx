import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../../api.js';
import { AdminTop } from '../../components/AdminLayout.jsx';
import Alert from '../../components/Alert.jsx';
import { uploadUrl } from '../../lib/format.js';

export default function AdminProjects() {
  const location = useLocation();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  const load = () => api('/admin/projects').then(setRows).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const remove = async (p) => {
    if (!confirm(`Hapus proyek ${p.title} beserta semua fotonya?`)) return;
    try {
      await api(`/admin/projects/${p.id}`, { method: 'DELETE' });
      load();
    } catch (e) { setError(e.message); }
  };

  return (
    <>
      <AdminTop
        title="Proyek"
        actions={<Link to="/admin/projects/new" className="btn btn-accent btn-sm"><i className="bi bi-plus-lg me-1" />Tambah proyek</Link>}
      />
      {location.state?.flash && <Alert key={location.key} type="success">{location.state.flash}</Alert>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="admin-card">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th style={{ width: 96 }}>Sampul</th>
                <th>Judul</th>
                <th>Tech</th>
                <th>Foto</th>
                <th>Tahun</th>
                <th>Urutan</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows && rows.length === 0 && (
                <tr><td colSpan="7" className="text-center text-muted-2 py-4">Belum ada proyek.</td></tr>
              )}
              {rows?.map((p) => {
                const cover = p.images[0];
                return (
                  <tr key={p.id}>
                    <td>
                      {cover
                        ? <img src={uploadUrl(cover.path)} alt="" className="cover-thumb" />
                        : <span className="cover-thumb empty"><i className="bi bi-window-stack" /></span>}
                    </td>
                    <td>
                      <div className="fw-medium">{p.title}</div>
                      {p.is_featured && <span className="chip chip-accent">Unggulan</span>}
                      <div className="small text-muted-2">/projects/{p.slug}</div>
                    </td>
                    <td>{p.techs.length}</td>
                    <td>{p.images.length}</td>
                    <td>{p.year ?? '—'}</td>
                    <td>{p.sort_order}</td>
                    <td className="text-end text-nowrap">
                      <a href={`/projects/${p.slug}`} target="_blank" rel="noopener" className="btn btn-soft btn-sm" title="Lihat di situs">
                        <i className="bi bi-box-arrow-up-right" />
                      </a>{' '}
                      <Link to={`/admin/projects/${p.id}/edit`} className="btn btn-soft btn-sm"><i className="bi bi-pencil" />Edit</Link>{' '}
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => remove(p)}>
                        <i className="bi bi-trash" />Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
