import { useEffect } from 'react';

/**
 * Port dari public/js/site.js di lampiran: bilah progres, tombol ke atas,
 * scrollspy, spotlight kartu, cahaya kursor, tombol magnetik, angka naik, animasi muncul.
 * Semua hanya tampilan; konten tetap tampil jika JavaScript gagal.
 */
export function useSiteEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    root.classList.add('js-ready');

    const created = [];
    const make = (tag, cls) => {
      const el = document.createElement(tag);
      el.className = cls;
      body.appendChild(el);
      created.push(el);
      return el;
    };

    const bar = make('div', 'scroll-progress');
    const fab = make('a', 'fab-top');
    fab.href = '#';
    fab.setAttribute('aria-label', 'Kembali ke atas');
    fab.innerHTML = '<i class="bi bi-arrow-up"></i>';
    const glow = finePointer && !reduce ? make('div', 'cursor-glow') : null;

    const nav = document.querySelector('.site-nav');
    const absTop = (el) => el.getBoundingClientRect().top + window.scrollY;

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      bar.style.setProperty('--p', p);
      fab.style.setProperty('--p', p);
      fab.classList.toggle('show', window.scrollY > 600);
      if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 12);

      const links = [...document.querySelectorAll('.site-nav a[data-spy]')];
      const line = window.scrollY + window.innerHeight * 0.35;
      let current = null;
      links.forEach((a) => {
        const el = document.getElementById(a.dataset.spy);
        if (el && absTop(el) <= line) current = a;
      });
      links.forEach((a) => a.classList.toggle('active', a === current));

      const tl = document.querySelector('.timeline');
      if (tl) {
        const r = tl.getBoundingClientRect();
        const t = (window.innerHeight * 0.6 - r.top) / r.height;
        tl.style.setProperty('--p', Math.max(0, Math.min(1, t)));
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    const onFab = (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    };
    fab.addEventListener('click', onFab);

    const SPOT = '.stack-cell,.value-item,.project-card,.cert-card,.tl-item,.contact-item,.hero-stats,.side-card';
    let gx = 0; let gy = 0; let cx = 0; let cy = 0; let raf = null;
    let lastMagnet = null;

    const moveGlow = () => {
      cx += (gx - cx) * 0.14;
      cy += (gy - cy) * 0.14;
      glow.style.transform = `translate(${cx}px,${cy}px)`;
      raf = Math.abs(gx - cx) > 0.5 || Math.abs(gy - cy) > 0.5 ? requestAnimationFrame(moveGlow) : null;
    };

    const onPointerMove = (e) => {
      const target = e.target && e.target.closest ? e.target : null;
      const spot = target ? target.closest(SPOT) : null;
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty('--mx', `${e.clientX - r.left}px`);
        spot.style.setProperty('--my', `${e.clientY - r.top}px`);
      }

      const hero = document.querySelector('.hero2');
      if (hero) {
        const h = hero.getBoundingClientRect();
        hero.style.setProperty('--hx', `${e.clientX - h.left}px`);
        hero.style.setProperty('--hy', `${e.clientY - h.top}px`);
      }

      if (glow) {
        gx = e.clientX;
        gy = e.clientY;
        root.classList.add('has-cursor');
        if (!raf) raf = requestAnimationFrame(moveGlow);
      }

      const tilt = document.querySelector('[data-tilt]');
      const card = tilt ? tilt.querySelector('.profile-card') : null;
      if (card && !reduce && finePointer) {
        const b = tilt.getBoundingClientRect();
        const px = (e.clientX - b.left) / b.width;
        const py = (e.clientY - b.top) / b.height;
        const inside = px > -0.3 && px < 1.3 && py > -0.3 && py < 1.3;
        card.style.setProperty('--ry', inside ? `${((px - 0.5) * 10).toFixed(2)}deg` : '0deg');
        card.style.setProperty('--rx', inside ? `${((0.5 - py) * 8).toFixed(2)}deg` : '0deg');
        card.style.setProperty('--gx', `${px * 100}%`);
        card.style.setProperty('--gy', `${py * 100}%`);
      }

      const magnet = target ? target.closest('[data-magnetic]') : null;
      if (lastMagnet && lastMagnet !== magnet) {
        lastMagnet.style.transform = '';
        lastMagnet = null;
      }
      if (magnet && !reduce && finePointer) {
        const r = magnet.getBoundingClientRect();
        magnet.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
        lastMagnet = magnet;
      }
    };
    const onLeave = () => root.classList.remove('has-cursor');
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    const countUp = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      if (!target || reduce) return;
      let start = null;
      el.textContent = '0';
      const step = (ts) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / 1400, 1);
        el.textContent = p < 1 ? String(Math.round(target * (1 - Math.pow(1 - p, 3)))) : String(target);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const seen = new WeakSet();
    const hasIO = 'IntersectionObserver' in window;

    const countIO = hasIO
      ? new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              countUp(en.target);
              countIO.unobserve(en.target);
            }
          });
        }, { threshold: 0.6 })
      : null;

    const revealIO = hasIO
      ? new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            const t = en.target;
            t.classList.add('in', 'seen');
            revealIO.unobserve(t);
            const delay = parseFloat(getComputedStyle(t).getPropertyValue('--d')) || 0;
            setTimeout(() => t.classList.remove('reveal', 'in'), 1100 + delay * 1000);
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
      : null;

    const scan = () => {
      document.querySelectorAll('[data-count].hs-n').forEach((el) => {
        if (!seen.has(el)) {
          seen.add(el);
          if (countIO) countIO.observe(el);
        }
      });
      document.querySelectorAll('.reveal').forEach((el) => {
        if (!seen.has(el)) {
          seen.add(el);
          if (revealIO) revealIO.observe(el);
          else el.classList.add('in');
        }
      });
    };
    const mo = new MutationObserver(scan);
    mo.observe(body, { childList: true, subtree: true });
    scan();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', onLeave);
      fab.removeEventListener('click', onFab);
      mo.disconnect();
      countIO?.disconnect();
      revealIO?.disconnect();
      if (raf) cancelAnimationFrame(raf);
      created.forEach((el) => el.remove());
      root.classList.remove('has-cursor');
    };
  }, []);
}
