import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext.jsx';

/** Pratinjau gambar ukuran penuh di dalam halaman (tanpa membuka tab baru). */
export default function Lightbox({ images, index, onIndex, onClose }) {
  const { t } = useApp();
  const [actual, setActual] = useState(false);
  const count = images.length;
  const img = images[index];

  const go = (step) => {
    setActual(false);
    onIndex((index + step + count) % count);
  };

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (count > 1 && e.key === 'ArrowRight') go(1);
      else if (count > 1 && e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [index, count]);

  const stop = (e) => e.stopPropagation();

  // Dirender di <body> agar selalu di atas navbar, tombol chat, dan elemen lain
  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={img.alt} onClick={onClose}>
      <div className="lightbox-bar" onClick={stop}>
        <span className="lightbox-count">{index + 1} / {count}</span>
        <div className="lightbox-tools">
          <button type="button" className="lightbox-btn" onClick={() => setActual((a) => !a)}>
            <i className={`bi ${actual ? 'bi-arrows-angle-contract' : 'bi-arrows-angle-expand'}`} />
            <span>{actual ? t('projects.lightbox.fit') : t('projects.lightbox.actual')}</span>
          </button>
          <button type="button" className="lightbox-btn lightbox-btn-icon" onClick={onClose}
            aria-label={t('projects.lightbox.close')}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
      </div>

      {count > 1 && (
        <button type="button" className="lightbox-nav prev" onClick={(e) => { stop(e); go(-1); }}
          aria-label={t('projects.prev')}>
          <i className="bi bi-chevron-left" />
        </button>
      )}

      <div className={`lightbox-stage${actual ? ' is-actual' : ''}`}>
        <img
          key={index}
          src={img.src}
          alt={img.alt}
          className={actual ? 'is-actual' : ''}
          onClick={(e) => { stop(e); setActual((a) => !a); }}
        />
      </div>

      {count > 1 && (
        <button type="button" className="lightbox-nav next" onClick={(e) => { stop(e); go(1); }}
          aria-label={t('projects.next')}>
          <i className="bi bi-chevron-right" />
        </button>
      )}

      {img.caption && <div className="lightbox-caption" onClick={stop}>{img.caption}</div>}
    </div>,
    document.body,
  );
}
