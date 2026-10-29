import { Link, Outlet } from 'react-router-dom';
import Logo from './Logo.jsx';
import ThemeSwitch from './ThemeSwitch.jsx';
import { APP_NAME } from '../lib/config.js';

/** Padanan layouts/guest.blade.php */
export default function GuestLayout() {
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <span className="orb orb-1" /><span className="orb orb-2" />
        <Link to="/" className="brand">
          <Logo />{APP_NAME}
        </Link>
        <div>
          <h2>Kelola portofolio dalam satu tempat.</h2>
          <p>Atur proyek, tech stack, sertifikasi, dan konten situs dengan dua bahasa dari satu panel.</p>
          <div className="auth-widget" aria-hidden="true">
            <div className="row-h"><span>Ringkasan konten</span><span className="chip chip-ok">Online</span></div>
            <div className="bars"><i /><i /><i /><i /><i /><i /></div>
          </div>
          <ul className="auth-points">
            <li><i className="bi bi-window-stack" />Proyek dengan banyak foto dan teknologi</li>
            <li><i className="bi bi-translate" />Konten Indonesia dan English</li>
            <li><i className="bi bi-palette" />Warna tema yang bisa disesuaikan</li>
          </ul>
        </div>
        <div className="auth-foot">© {new Date().getFullYear()} {APP_NAME}</div>
      </aside>

      <div className="auth-main">
        <div className="auth-topbar">
          <Link to="/" className="brand d-lg-none">
            <Logo />{APP_NAME}
          </Link>
          <span className="d-none d-lg-block" />
          <ThemeSwitch />
        </div>
        <div className="auth-center">
          <div className="auth-card">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
