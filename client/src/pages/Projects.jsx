import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import Pagination from '../components/Pagination.jsx';

export default function Projects() {
  const { t } = useApp();
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setResult(null);
    api(`/projects?page=${page}`)
      .then(setResult)
      .catch(() => setResult({ data: [], meta: { page: 1, lastPage: 1 } }));
  }, [page]);

  if (!result) return <p className="container py-5">{t('loading')}</p>;

  return (
    <>
      <section className="page-head">
        <div className="container">
          <div className="eyebrow"><i className="bi bi-grid-1x2" />{t('nav.projects')}</div>
          <h1 className="section-title">{t('projects.all_title')}</h1>
          <p className="section-sub">{t('projects.all_subtitle')}</p>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container">
          {result.data.length === 0 ? (
            <p className="text-muted-2">{t('projects.empty')}</p>
          ) : (
            <>
              <div className="project-grid">
                {result.data.map((p, i) => (
                  <div key={p.id} className="reveal" style={{ '--d': `${(i % 3) * 0.08}s` }}>
                    <ProjectCard project={p} />
                  </div>
                ))}
              </div>
              <div className="mt-5 d-flex justify-content-center">
                <Pagination
                  page={result.meta.page}
                  lastPage={result.meta.lastPage}
                  onPage={(p) => setParams({ page: String(p) })}
                />
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
