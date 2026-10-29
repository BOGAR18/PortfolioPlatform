import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useApp } from '../context/AppContext.jsx';
import ThemeSwitch from './ThemeSwitch.jsx';
import { APP_NAME } from '../lib/config.js';

export default function Navbar() {
  const { t, lang, setLang } = useApp();
  const { pathname } = useLocation();
  const hashTo = (id) => (pathname === '/' ? `#${id}` : `/#${id}`);

  const sections = [
    ['about', 'nav.about'],
  ];
  const later = [
    ['experience', 'nav.experience'],
    ['certifications', 'nav.certifications'],
    ['contact', 'nav.contact'],
  ];

  return (
    <nav className="site-nav fixed-top">
      <div className="container">
        <div className="nav-shell navbar navbar-expand-lg">
          <Link className="brand" to="/">
            <Logo />{APP_NAME}
          </Link>

          <div className="d-flex align-items-center gap-2 ms-auto order-lg-3">
            <div className="lang-switch" role="group" aria-label={t('language')}>
              {[['id', 'Indonesia'], ['en', 'English']].map(([code, label]) => (
                <a
                  key={code}
                  href="#"
                  hrefLang={code}
                  title={label}
                  className={lang === code ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); setLang(code); }}
                >
                  {code.toUpperCase()}
                </a>
              ))}
            </div>
            <ThemeSwitch />
            <button
              className="navbar-toggler d-lg-none"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#mainNav"
              aria-controls="mainNav"
              aria-expanded="false"
              aria-label={t('nav.menu')}
            >
              <i className="bi bi-list" />
            </button>
          </div>

          <div className="collapse navbar-collapse order-lg-2" id="mainNav">
            <ul className="navbar-nav ms-lg-auto me-lg-3 mt-3 mt-lg-0">
              {sections.map(([id, key]) => (
                <li key={id} className="nav-item">
                  <Link className="nav-link" data-spy={id} to={hashTo(id)}>{t(key)}</Link>
                </li>
              ))}
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/projects">
                  {t('nav.projects')}
                </NavLink>
              </li>
              {later.map(([id, key]) => (
                <li key={id} className="nav-item">
                  <Link className="nav-link" data-spy={id} to={hashTo(id)}>{t(key)}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
