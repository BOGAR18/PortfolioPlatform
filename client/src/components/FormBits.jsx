import { useEffect } from 'react';
import { useNotify } from '../context/NotifyContext.jsx';

/** Helper validasi: menampilkan pesan error dari server di bawah kolom */
export const invalidClass = (errors, name) => (errors && errors[name] ? ' is-invalid' : '');

export function FieldError({ errors, name }) {
  const msg = errors && errors[name];
  return msg ? <div className="invalid-feedback">{msg}</div> : null;
}

/** Tidak lagi menampilkan kotak di halaman: pesan gagal dimunculkan sebagai popup. */
export function ErrorSummary({ message, errors }) {
  const notify = useNotify();
  useEffect(() => {
    if (!message) return;
    notify.error(message, Object.values(errors || {}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, errors]);
  return null;
}
