import { useApp } from '../context/AppContext.jsx';

const OPTIONS = [
  ['light', 'bi-sun', 'theme.light'],
  ['dark', 'bi-moon-stars', 'theme.dark'],
  ['system', 'bi-circle-half', 'theme.system'],
];

export default function ThemeSwitch() {
  const { t, setTheme } = useApp();
  return (
    <div className="dropdown">
      <button
        type="button"
        className="icon-btn"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label={t('theme.label')}
        title={t('theme.label')}
      >
        <i className="bi bi-sun theme-i theme-i-light" />
        <i className="bi bi-moon-stars theme-i theme-i-dark" />
        <i className="bi bi-circle-half theme-i theme-i-system" />
      </button>
      <ul className="dropdown-menu dropdown-menu-end">
        {OPTIONS.map(([value, icon, key]) => (
          <li key={value}>
            <button type="button" className="dropdown-item" data-theme-choice={value} onClick={() => setTheme(value)}>
              <i className={`bi ${icon} me-2`} />{t(key)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
