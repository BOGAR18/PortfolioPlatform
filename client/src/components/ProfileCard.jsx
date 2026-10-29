import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { APP_NAME } from '../lib/config.js';
import { uploadUrl } from '../lib/format.js';

const PHOTO_SRC = '/brand/profile.jpg';
const REST = { x: 0, y: 0, gx: 50, gy: 50 };

/** Kartu foto profil: miring 3D mengikuti kursor, kilau cahaya, dan cincin berputar. */
export default function ProfileCard() {
  const { pick, t, settings } = useApp();
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);
  const photo = settings?.contact_photo ? uploadUrl(settings.contact_photo) : PHOTO_SRC;
  useEffect(() => { setFailed(false); }, [photo]);
  const [tilt, setTilt] = useState(REST);

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ x: (py - 0.5) * -14, y: (px - 0.5) * 14, gx: px * 100, gy: py * 100 });
  };

  const initials = APP_NAME.replace(/[^a-zA-Z ]/g, ' ').split(' ').filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join('');

  return (
    <div className="pf-wrap" ref={ref} onPointerMove={onMove} onPointerLeave={() => setTilt(REST)}>
      <div
        className="pf-card"
        style={{
          transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          '--gx': `${tilt.gx}%`,
          '--gy': `${tilt.gy}%`,
        }}
      >
        <div className="pf-photo">
          {failed ? (
            <span className="pf-fallback">{initials}</span>
          ) : (
            <img src={photo} alt={APP_NAME} onError={() => setFailed(true)} />
          )}
          <span className="pf-shine" />
        </div>
        <div className="pf-info">
          <div className="pf-name">{APP_NAME}</div>
          <div className="pf-role">{pick('card_role')}</div>
          <div className="pf-status"><span className="pf-dot" />{t('hero.available')}</div>
        </div>
      </div>
    </div>
  );
}
