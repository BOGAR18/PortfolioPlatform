import { useState } from 'react';

/** Alert dengan tombol tutup. Padanan partial flash di lampiran. */
export default function Alert({ type = 'success', children, dismissible = true }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className={`alert alert-${type}${dismissible ? ' alert-dismissible fade show' : ''}`} role="alert">
      {children}
      {dismissible && (
        <button type="button" className="btn-close" aria-label="Tutup" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
