import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { APP_NAME } from '../lib/config.js';
import { uploadUrl } from '../lib/format.js';

export default function ProjectShow() {
  const { slug } = useParams();
  const { t, loc } = useApp();
  const [p, setP] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setP(null);
    setError('');
    api(`/projects/${encodeURIComponent(slug)}`).then(setP).catch((e) => setError(e.message));
  }, [slug]);

  useEffect(() => {
    if (p) document.title = `${loc(p, 'title')} · ${APP_NAME}`;
  }, [p, loc]);

  if (error) return <p className="container"><span className="alert alert-danger d-block">{error}</span></p>;
  if (!p) return <p className="container py-5">{t('loading')}</p>;

  const images = p.images;

  return (
    <>
      <section className="page-head pb-0">
        <div className="container">
          <Link to="/projects" className="back-link"><i className="bi bi-arrow-left" />{t('projects.back')}</Link>
          <h1 className="section-title">{loc(p, 'title')}</h1>
          <p className="section-sub mb-3">{loc(p, 'summary')}</p>
        </div>
      </section>

      <section className="section pt-4">
        <div className="container">
          <div className="row g-4 g-lg-5">
            <div className="col-lg-8">
              <h2 className="visually-hidden">{t('projects.gallery')}</h2>
              {images.length > 0 ? (
                <div id="projectGallery" className="carousel slide gallery" data-bs-ride="false">
                  {images.length > 1 && (
                    <div className="carousel-indicators">
                      {images.map((img, i) => (
                        <button
                          key={img.id}
                          type="button"
                          data-bs-target="#projectGallery"
                          data-bs-slide-to={i}
                          className={i === 0 ? 'active' : ''}
                          aria-label={String(i + 1)}
                        />
                      ))}
                    </div>
                  )}

                  <div className="carousel-inner">
                    {images.map((img, i) => (
                      <div key={img.id} className={`carousel-item${i === 0 ? ' active' : ''}`}>
                        <img src={uploadUrl(img.path)} alt={img.caption || loc(p, 'title')} />
                        {img.caption && <div className="carousel-caption">{img.caption}</div>}
                      </div>
                    ))}
                  </div>

                  {images.length > 1 && (
                    <>
                      <button className="carousel-control-prev" type="button" data-bs-target="#projectGallery" data-bs-slide="prev">
                        <span className="carousel-ctrl"><i className="bi bi-chevron-left" /></span>
                        <span className="visually-hidden">{t('projects.prev')}</span>
                      </button>
                      <button className="carousel-control-next" type="button" data-bs-target="#projectGallery" data-bs-slide="next">
                        <span className="carousel-ctrl"><i className="bi bi-chevron-right" /></span>
                        <span className="visually-hidden">{t('projects.next')}</span>
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="gallery-empty"><i className="bi bi-images" />{t('projects.no_image')}</div>
              )}

              {p.description && (
                <div className="prose mt-5">
                  <h2 className="h5 mb-3">{t('projects.overview')}</h2>
                  <div style={{ whiteSpace: 'pre-line' }}>{loc(p, 'description')}</div>
                </div>
              )}
            </div>

            <div className="col-lg-4">
              <div className="d-grid gap-3">
                {p.techs.length > 0 && (
                  <div className="side-card">
                    <h2>{t('projects.tech_used')}</h2>
                    <div className="stack-items">
                      {p.techs.map((tech) => (
                        <span key={tech.id} className="tech-chip">
                          {tech.logo && <img src={uploadUrl(tech.logo)} alt="" loading="lazy" />}
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(p.project_url || p.repo_url) && (
                  <div className="d-grid gap-2">
                    {p.project_url && (
                      <a href={p.project_url} target="_blank" rel="noopener" className="btn btn-accent">
                        <i className="bi bi-box-arrow-up-right me-2" />{t('projects.live')}
                      </a>
                    )}
                    {p.repo_url && (
                      <a href={p.repo_url} target="_blank" rel="noopener" className="btn btn-soft">
                        <i className="bi bi-github me-2" />{t('projects.repo')}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {p.others.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-head reveal">
              <h2 className="section-title mb-0">{t('projects.others')}</h2>
            </div>
            <div className="project-grid">
              {p.others.map((o, i) => (
                <div key={o.id} className="reveal" style={{ '--d': `${i * 0.08}s` }}>
                  <ProjectCard project={o} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
