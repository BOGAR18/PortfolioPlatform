import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { uploadUrl } from '../lib/format.js';

export default function ProjectCard({ project, variant = 'default' }) {
  const { t, loc } = useApp();
  const cover = project.images?.[0];
  const to = `/projects/${project.slug}`;
  return (
    <article className={`project-card${variant === 'lead' ? ' is-lead' : ''}`}>
      <Link to={to} className="project-cover" tabIndex={-1} aria-hidden="true">
        {cover ? <img src={uploadUrl(cover.path)} alt={loc(project, 'title')} loading="lazy" /> : <i className="bi bi-window-stack" />}
        <span className="project-go"><i className="bi bi-arrow-up-right" /></span>
      </Link>
      <div className="project-body">
        {project.year && <div className="project-year">{project.year}</div>}
        <h3 className="project-title">
          <Link to={to} className="stretched-link">{loc(project, 'title')}</Link>
        </h3>
        <p className="project-desc">{loc(project, 'summary')}</p>
        <div className="project-foot">
          <div className="chips">
            {project.techs.slice(0, 3).map((tech) => (
              <span key={tech.id} className="chip">{tech.name}</span>
            ))}
          </div>
          <span className="link-more">{t('projects.detail')} →</span>
        </div>
      </div>
    </article>
  );
}
