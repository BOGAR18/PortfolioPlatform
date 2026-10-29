import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import Chatbot from './Chatbot.jsx';
import { useSiteEffects } from '../lib/fx.js';

export default function Layout() {
  const { pathname, hash } = useLocation();
  useSiteEffects();

  // Navigasi ke #bagian: gulir ke elemen, tunggu sampai konten dari API sudah tampil
  useEffect(() => {
    const id = decodeURIComponent(hash.slice(1));
    if (!id) {
      window.scrollTo(0, 0);
      return undefined;
    }
    let tries = 0;
    let timer;
    const tick = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (tries++ < 40) timer = setTimeout(tick, 100);
    };
    tick();
    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
