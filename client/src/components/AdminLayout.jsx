import { useEffect, useState } from 'react';
import Logo from './Logo.jsx';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import ThemeSwitch from './ThemeSwitch.jsx';
import Alert from './Alert.jsx';
import { APP_NAME } from '../lib/config.js';

const TITLES = [
  ['/admin/tech-categories', 'Kategori Tech'],
  ['/admin/tech-items', 'Item Tech'],
  ['/admin/projects', 'Proyek'],
  ['/admin/certifications', 'Sertifikasi'],
  ['/admin/experiences', 'Perjalanan'],
  ['/admin/settings', 'Pengaturan Konten'],
];

export function currentAdminTitle(pathname) {
  const hit = TITLES.find(([p]) => pathname.startsWith(p));
  return hit ? hit[1] : 'Dashboard';
}

/** Padanan layouts/admin.blade.php */
export default function AdminLayout() {
  const { auth, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const user = auth.user || { name: 'Admin', email: '' };

  useEffect(() => {
    document.body.classList.toggle('admin-open', open);
    return () => document.body.classList.remove('admin-open');
  }, [open]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const link = (to, icon, label, end = false) => (
    <NavLink to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
      <i className={`bi ${icon}`} /> {label}
    </NavLink>
  );

  const flash = location.state?.flash;

  return (
    <div className="admin-shell">
      <aside className="admin-side" id="adminSide">
        <Link to="/admin" className="brand">
          <Logo />{APP_NAME}
        </Link>

        <nav className="admin-menu">
          {link('/admin', 'bi-grid-1x2', 'Dashboard', true)}

          <div className="menu-label">Tech Stack</div>
          {link('/admin/tech-categories', 'bi-collection', 'Kategori Tech')}
          {link('/admin/tech-items', 'bi-cpu', 'Item Tech')}

          <div className="menu-label">Konten</div>
          {link('/admin/projects', 'bi-window-stack', 'Proyek')}
          {link('/admin/certifications', 'bi-patch-check', 'Sertifikasi')}
          {link('/admin/experiences', 'bi-signpost-split', 'Perjalanan')}
          {link('/admin/settings', 'bi-sliders', 'Pengaturan konten')}

          <div className="menu-label">Lainnya</div>
          <a href="/" target="_blank" rel="noopener"><i className="bi bi-box-arrow-up-right" /> Lihat situs</a>
          <button type="button" onClick={handleLogout}><i className="bi bi-box-arrow-left" /> Keluar</button>
        </nav>

        <div className="mt-auto admin-user">
          <span className="admin-avatar">{(user.name || 'A').charAt(0).toUpperCase()}</span>
          <div className="min-w-0">
            <div className="nm">{user.name}</div>
            <div className="em">{user.email}</div>
          </div>
        </div>
      </aside>
      <div className="admin-scrim" onClick={() => setOpen(false)} />

      <div className="admin-body">
        <header className="admin-topbar">
          <button
            type="button"
            className="icon-btn d-lg-none"
            aria-label="Buka menu"
            aria-controls="adminSide"
            onClick={() => setOpen((o) => !o)}
          >
            <i className="bi bi-list" />
          </button>
          <div className="admin-crumb">
            Admin <i className="bi bi-chevron-right mx-1 small" /> <b>{currentAdminTitle(location.pathname)}</b>
          </div>
          <div className="spacer" />
          <a href="/" target="_blank" rel="noopener" className="btn btn-soft btn-sm d-none d-sm-inline-flex">
            <i className="bi bi-box-arrow-up-right" />Lihat situs
          </a>
          <ThemeSwitch />
        </header>

        <main className="admin-main">
          {flash && <Alert key={location.key} type="success">{flash}</Alert>}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/** Judul halaman admin + tombol aksi di kanan (padanan @section('title') dan @section('actions')) */
export function AdminTop({ title, actions }) {
  return (
    <div className="admin-top">
      <h1>{title}</h1>
      <div>{actions}</div>
    </div>
  );
}
