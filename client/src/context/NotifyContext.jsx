import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const NotifyContext = createContext(null);

/**
 * Popup notifikasi di tengah layar untuk semua pemberitahuan (berhasil, gagal, konfirmasi).
 * Pemakaian: const notify = useNotify(); notify.success('...'); notify.error('...', ['detail']);
 *            if (await notify.confirm('Hapus?')) { ... }
 */
export function NotifyProvider({ children }) {
  const [popup, setPopup] = useState(null);
  const resolver = useRef(null);
  const timer = useRef(null);

  const close = useCallback((result = false) => {
    clearTimeout(timer.current);
    setPopup(null);
    if (resolver.current) {
      resolver.current(result);
      resolver.current = null;
    }
  }, []);

  const show = useCallback((next) => {
    clearTimeout(timer.current);
    if (resolver.current) { resolver.current(false); resolver.current = null; }
    setPopup(next);
    if (next.type === 'success') timer.current = setTimeout(() => setPopup(null), 2200);
  }, []);

  const api = useRef({
    success: (message) => show({ type: 'success', title: 'Berhasil', message }),
    error: (message, details = []) => show({ type: 'error', title: 'Gagal', message, details }),
    info: (message) => show({ type: 'info', title: 'Informasi', message }),
    confirm: (message, { title = 'Konfirmasi', okText = 'Ya, lanjutkan', cancelText = 'Batal' } = {}) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        show({ type: 'confirm', title, message, okText, cancelText });
      }),
  }).current;

  useEffect(() => {
    if (!popup) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [popup, close]);

  const icons = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', info: 'bi-info-circle-fill', confirm: 'bi-question-circle-fill' };

  return (
    <NotifyContext.Provider value={api}>
      {children}
      {popup && (
        <div className="notify-overlay" onClick={() => close(false)} role="presentation">
          <div className={`notify-box notify-${popup.type}`} role="alertdialog" aria-modal="true" aria-live="assertive"
            onClick={(e) => e.stopPropagation()}>
            <div className="notify-icon"><i className={`bi ${icons[popup.type]}`} /></div>
            <h3 className="notify-title">{popup.title}</h3>
            <p className="notify-message">{popup.message}</p>
            {popup.details?.length > 0 && (
              <ul className="notify-details">
                {popup.details.map((d) => <li key={d}>{d}</li>)}
              </ul>
            )}
            <div className="notify-actions">
              {popup.type === 'confirm' ? (
                <>
                  <button type="button" className="btn btn-soft" onClick={() => close(false)}>{popup.cancelText}</button>
                  <button type="button" className="btn btn-danger" autoFocus onClick={() => close(true)}>{popup.okText}</button>
                </>
              ) : (
                <button type="button" className="btn btn-accent" autoFocus onClick={() => close(true)}>OK</button>
              )}
            </div>
          </div>
        </div>
      )}
    </NotifyContext.Provider>
  );
}

export const useNotify = () => useContext(NotifyContext);
