import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { SocialLinks } from '../components/SocialLinks.jsx';
import ProfileCard from '../components/ProfileCard.jsx';
import { formatMonthYear, uploadUrl } from '../lib/format.js';

/* Urutan section beranda (berbeda dari referensi):
   Hero → Proyek → Tech stack → Perjalanan → Tentang → Sertifikasi → Kontak */
/** Peran yang berganti-ganti. Pisahkan peran dengan tanda "·" pada pengaturan "Peran di kartu profil". */
function RoleRotor({ text }) {
  const roles = text.split('·').map((r) => r.trim()).filter(Boolean);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (roles.length < 2) return undefined;
    const id = setInterval(() => setI((x) => (x + 1) % roles.length), 2600);
    return () => clearInterval(id);
  }, [roles.length]);
  if (roles.length === 0) return null;
  return (
    <div className="role-rotor" key={i}>
      <span className="role-dot" />
      <span className="role-text">{roles[i % roles.length]}</span>
    </div>
  );
}

export default function Home() {
  const { t, pick, loc, aboutValues, lang } = useApp();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/home').then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="container"><span className="alert alert-danger d-block">{error}</span></p>;
  if (!data) return <p className="container py-5">{t('loading')}</p>;

  const s = data.settings;
  const title = pick('hero_title');
  const words = title.split(/\s+/).filter(Boolean);
  const email = s.contact_email;

  return (
    <>
      {/* ───────── HERO ───────── */}
      <section id="hero" className="hero2">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="hero3-eyebrow reveal">{t('hero.greeting')}</div>
              <h1 className="hero-title" aria-label={title}>
                {words.map((w, i) => (
                  <span key={i} className="hero-line">
                    <span className="w" aria-hidden="true" style={{ '--i': i }}>{w}</span>
                  </span>
                ))}
              </h1>
              <RoleRotor text={pick('card_role')} />
            </div>
            <div className="col-lg-5 offset-lg-1">
              <p className="hero2-sub reveal" style={{ '--d': '.35s' }}>{pick('hero_subtitle')}</p>
              <div className="hero-actions reveal" style={{ '--d': '.45s' }}>
                <Link to="/projects" className="btn btn-accent btn-lg" data-magnetic>
                  {t('hero.cta_projects')}<i className="bi bi-arrow-right" />
                </Link>
                <a href="#contact" className="btn btn-soft btn-lg" data-magnetic>{t('hero.cta_contact')}</a>
              </div>
              <div className="reveal mt-4" style={{ '--d': '.55s' }}><SocialLinks /></div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── PROYEK ───────── */}
      <section id="projects" className="section">
        <div className="container">
          <div className="section-split reveal">
            <div>
              <div className="eyebrow">{t('nav.projects')}</div>
              <h2 className="section-title">{t('projects.title')}</h2>
            </div>
            <div className="section-split-end">
              <p className="section-sub mb-3">{t('projects.subtitle')}</p>
              <Link to="/projects" className="link-arrow">{t('projects.all')} <i className="bi bi-arrow-right" /></Link>
            </div>
          </div>

          {data.projects.length === 0 ? (
            <p className="text-muted-2">{t('projects.empty')}</p>
          ) : (
            <div className="work-grid">
              {data.projects.map((p, i) => (
                <div key={p.id} className="reveal" style={{ '--d': `${i * 0.08}s` }}>
                  <ProjectCard project={p} variant={i === 0 && data.projects.length > 1 ? 'lead' : 'default'} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ───────── PERJALANAN ───────── */}
      {data.experiences.length > 0 && (
        <section id="experience" className="section">
          <div className="container">
            <div className="section-split reveal">
              <div>
                <div className="eyebrow">{t('nav.experience')}</div>
                <h2 className="section-title">{t('experience.title')}</h2>
              </div>
            </div>
            <div className="timeline">
              {data.experiences.map((e) => (
                <div key={e.id} className={`tl-item reveal${e.end_year === null ? ' is-current' : ''}`}>
                  <div className="tl-period">{e.start_year} – {e.end_year ?? t('experience.present')}</div>
                  <h3 className="tl-role">{loc(e, 'role')}</h3>
                  <div className="tl-company">{e.company}</div>
                  {e.description && <p className="tl-desc">{loc(e, 'description')}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────── TENTANG ───────── */}
      <section id="about" className="section section-alt">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-5 reveal">
              <div className="eyebrow">{t('nav.about')}</div>
              <h2 className="section-title">{pick('about_title') || t('about.title')}</h2>
            </div>
            <div className="col-lg-7">
              {pick('about_text_1') && <p className="about-lead reveal">{pick('about_text_1')}</p>}
              {pick('about_text_2') && <p className="about-text reveal">{pick('about_text_2')}</p>}
            </div>
          </div>

          {aboutValues.length > 0 && (
            <div className="value-grid mt-5">
              {aboutValues.map((v, i) => (
                <div key={i} className="reveal" style={{ '--d': `${i * 0.08}s` }}>
                  <div className="value-item">
                    <div className="value-icon"><i className={`bi ${v.icon || 'bi-star'}`} /></div>
                    <div>
                      <div className="value-t">{v.title || ''}</div>
                      <p className="value-d">{v.text || ''}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ───────── SERTIFIKASI ───────── */}
      {data.certifications.length > 0 && (
        <section id="certifications" className="section">
          <div className="container">
            <div className="section-split reveal">
              <div>
                <div className="eyebrow">{t('nav.certifications')}</div>
                <h2 className="section-title">{t('certs.title')}</h2>
              </div>
              <div className="section-split-end">
                <p className="section-sub">{t('certs.subtitle')}</p>
              </div>
            </div>
            <div className="row g-4">
              {data.certifications.map((c, i) => (
                <div key={c.id} className="col-md-6 col-lg-4 reveal" style={{ '--d': `${(i % 3) * 0.08}s` }}>
                  <article className="cert-card">
                    <div className="cert-thumb">
                      {c.image ? <img src={uploadUrl(c.image)} alt={c.name} loading="lazy" /> : <i className="bi bi-patch-check" />}
                    </div>
                    <div className="cert-body">
                      <h3 className="cert-name">{c.name}</h3>
                      <div className="cert-issuer">{c.issuer}</div>
                      {c.issued_at && <p className="cert-meta">{t('certs.issued')}: {formatMonthYear(c.issued_at, lang)}</p>}
                      {c.expires_at && <p className="cert-meta">{t('certs.expires')}: {formatMonthYear(c.expires_at, lang)}</p>}
                      {c.credential_id && <p className="cert-meta">{t('certs.credential')}: {c.credential_id}</p>}
                      {c.credential_url && (
                        <a href={c.credential_url} target="_blank" rel="noopener" className="link-arrow cert-link">
                          {t('certs.verify')} <i className="bi bi-arrow-up-right" />
                        </a>
                      )}
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────── KONTAK ───────── */}
      <section id="contact" className="section section-alt">
        <div className="container">
          <div className="contact-band reveal">
            <div className="row g-5 align-items-center">
              <div className="col-lg-7">
                <div className="eyebrow">{t('nav.contact')}</div>
                <h2 className="contact-big">{t('contact.title')}</h2>
                <p className="section-sub mt-3 mb-4">{t('contact.subtitle')}</p>
                <div className="hero-actions mb-5">
                  {email && (
                    <a href={`mailto:${email}`} className="btn btn-accent btn-lg" data-magnetic>
                      <i className="bi bi-envelope" />{t('contact.send_email')}
                    </a>
                  )}
                  {s.contact_whatsapp && (
                    <a href={`https://wa.me/${s.contact_whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener" className="btn btn-soft btn-lg" data-magnetic>
                      <i className="bi bi-whatsapp" />{t('contact.send_wa')}
                    </a>
                  )}
                </div>
                <div className="contact-meta">
                  {email && (
                    <div>
                      <div className="contact-k">{t('contact.email')}</div>
                      <div className="contact-v">{email}</div>
                    </div>
                  )}
                  <div>
                    <div className="contact-k">{t('contact.location')}</div>
                    <div className="contact-v">{pick('contact_location')}</div>
                  </div>
                  <div>
                    <div className="contact-k">{t('contact.response')}</div>
                    <div className="contact-v">{pick('contact_response')}</div>
                  </div>
                </div>
                <div className="mt-4"><SocialLinks /></div>
              </div>
              <div className="col-lg-5">
                <ProfileCard />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
