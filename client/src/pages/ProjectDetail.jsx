import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useLang } from '../i18n.jsx';

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const { t } = useLang();

  useEffect(() => {
    setProject(null);
    setError('');
    api(`/projects/${slug}`).then(setProject).catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <p className="container alert-error">{error}</p>;
  if (!project) return <p className="container">{t('loading')}</p>;

  return (
    <article className="container">
      <Link to="/projects">← {t('back')}</Link>
      <h1>{project.title}</h1>
      <p>{project.summary}</p>
      {project.year && <p><small>{project.year}</small></p>}

      <div className="gallery">
        {project.images.map((img) => (
          <img key={img.id} src={`/uploads/${img.path}`} alt={img.caption || project.title} />
        ))}
      </div>

      {project.description && <div style={{ whiteSpace: 'pre-line' }}>{project.description}</div>}

      <ul className="chips" style={{ marginTop: 16 }}>
        {project.techs.map((tech) => <li key={tech.id}>{tech.name}</li>)}
      </ul>

      <p>
        {project.project_url && <a href={project.project_url} target="_blank" rel="noreferrer">Demo →</a>}{' '}
        {project.repo_url && <a href={project.repo_url} target="_blank" rel="noreferrer">Repository →</a>}
      </p>
    </article>
  );
}
