import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import Logo from './Logo.jsx';
import { APP_NAME } from '../lib/config.js';

export default function Footer() {
  const { t, pick } = useApp();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-bottom-bar">
          <Link to="/" className="brand"><Logo />{APP_NAME}</Link>
          <span>{pick('card_role')}</span>
          <span>© {year} {APP_NAME}. {t('footer.rights')}</span>

        </div>
      </div>
    </footer>
  );
}
