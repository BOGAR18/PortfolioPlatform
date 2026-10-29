import { useApp } from '../context/AppContext.jsx';

/** Ikon WhatsApp, GitHub, dan LinkedIn. Tautan diambil dari Pengaturan konten admin. */
export function SocialLinks() {
  const { settings } = useApp();
  const wa = (settings.contact_whatsapp || '').replace(/\D/g, '');
  const items = [
    [wa && `https://wa.me/${wa}`, 'bi-whatsapp', 'WhatsApp'],
    [settings.social_github, 'bi-github', 'GitHub'],
    [settings.social_linkedin, 'bi-linkedin', 'LinkedIn'],
  ].filter(([url]) => url);

  if (items.length === 0) return null;
  return (
    <div className="social-row">
      {items.map(([url, icon, label]) => (
        <a key={label} href={url} target="_blank" rel="noopener" aria-label={label} title={label}>
          <i className={`bi ${icon}`} />
        </a>
      ))}
    </div>
  );
}
