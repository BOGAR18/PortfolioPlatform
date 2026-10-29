import { useState } from 'react';
import { LOGO_SRC } from '../lib/config.js';

/** Logo dari client/public/brand/logo.png. Jika file belum ada, tampil ikon cadangan. */
export default function Logo({ className = '' }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <span className={`brand-mark ${className}`}><i className="bi bi-braces" /></span>;
  }
  return <img src={LOGO_SRC} alt="" className={`brand-logo ${className}`} onError={() => setFailed(true)} />;
}
