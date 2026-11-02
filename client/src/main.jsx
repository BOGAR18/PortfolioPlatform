import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { NotifyProvider } from './context/NotifyContext.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppProvider>
      <NotifyProvider>
        <App />
      </NotifyProvider>
    </AppProvider>
  </BrowserRouter>,
);

// Layar pembuka singkat, lalu memudar (langsung hilang jika pengguna mengurangi animasi)
const preloader = document.getElementById('preloader');
if (preloader) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => {
    preloader.classList.add('is-hidden');
    setTimeout(() => preloader.remove(), 800);
  }, reduce ? 0 : 1100);
}
