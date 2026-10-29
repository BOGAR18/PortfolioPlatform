import { useApp } from '../context/AppContext.jsx';

export default function Pagination({ page, lastPage, onPage }) {
  const { t } = useApp();
  if (lastPage <= 1) return null;

  const pages = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(lastPage, page + 2); i++) pages.push(i);

  return (
    <nav aria-label="Pagination">
      <ul className="pagination justify-content-center">
        <li className={`page-item${page <= 1 ? ' disabled' : ''}`}>
          <button type="button" className="page-link" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            ‹ {t('pagination.prev')}
          </button>
        </li>
        {pages.map((p) => (
          <li key={p} className={`page-item${p === page ? ' active' : ''}`}>
            <button type="button" className="page-link" onClick={() => onPage(p)}>{p}</button>
          </li>
        ))}
        <li className={`page-item${page >= lastPage ? ' disabled' : ''}`}>
          <button type="button" className="page-link" disabled={page >= lastPage} onClick={() => onPage(page + 1)}>
            {t('pagination.next')} ›
          </button>
        </li>
      </ul>
    </nav>
  );
}
