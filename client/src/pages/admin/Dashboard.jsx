import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { useApp } from '../../context/AppContext.jsx';
import { AdminTop } from '../../components/AdminLayout.jsx';

export default function Dashboard() {
  const { auth } = useApp();
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    api('/admin/dashboard').then(setCounts).catch(() => {});
  }, []);

  const cards = [
    ['Kategori tech', counts?.categories, 'bi-collection', '/admin/tech-categories'],
    ['Item tech', counts?.items, 'bi-cpu', '/admin/tech-items'],
    ['Proyek', counts?.projects, 'bi-window-stack', '/admin/projects'],
    ['Sertifikasi', counts?.certifications, 'bi-patch-check', '/admin/certifications'],
    ['Perjalanan', counts?.experiences, 'bi-signpost-split', '/admin/experiences'],
  ];

  return (
    <>
      <AdminTop title="Dashboard" />

      <div className="dash-hero">
        <h2>Selamat datang, {auth.user?.name}</h2>
        <p>Kelola tech stack, proyek, sertifikasi, dan perjalanan. Teks beranda, tentang, dan kontak (dua bahasa) diatur di Pengaturan konten.</p>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/admin/projects/new" className="btn btn-accent"><i className="bi bi-plus-lg" />Tambah proyek</Link>
          <a href="/" target="_blank" rel="noopener" className="btn btn-soft"><i className="bi bi-box-arrow-up-right" />Lihat situs</a>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {cards.map(([label, count, icon, link]) => (
          <div key={label} className="col-6 col-lg-4 col-xl">
            <div className="stat-card">
              <span className="stat-ico"><i className={`bi ${icon}`} /></span>
              <div className="n">{count ?? '—'}</div>
              <div className="l"><Link to={link}>{label}</Link></div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-12">
          <div className="admin-card h-100">
            <h2 className="h6 mb-3">Aksi cepat</h2>
            <div className="d-grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
              <Link to="/admin/projects/new" className="quick-link"><i className="bi bi-plus-circle" />Tambah proyek<i className="bi bi-arrow-right go" /></Link>
              <Link to="/admin/certifications/new" className="quick-link"><i className="bi bi-patch-plus" />Tambah sertifikasi<i className="bi bi-arrow-right go" /></Link>
              <Link to="/admin/settings" className="quick-link"><i className="bi bi-sliders" />Ubah teks &amp; warna situs<i className="bi bi-arrow-right go" /></Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
