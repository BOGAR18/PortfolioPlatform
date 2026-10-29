import { createContext, useContext, useEffect, useState } from 'react';

const dict = {
  id: {
    home: 'Beranda', projects: 'Proyek', login: 'Masuk', logout: 'Keluar',
    admin: 'Admin', techStack: 'Tech Stack', viewAll: 'Lihat semua proyek',
    loading: 'Memuat...', back: 'Kembali', prev: 'Sebelumnya', next: 'Berikutnya',
    addProject: 'Tambah proyek',
  },
  en: {
    home: 'Home', projects: 'Projects', login: 'Login', logout: 'Logout',
    admin: 'Admin', techStack: 'Tech Stack', viewAll: 'View all projects',
    loading: 'Loading...', back: 'Back', prev: 'Previous', next: 'Next',
    addProject: 'Add project',
  },
};

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'id');

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = (key) => dict[lang][key] ?? key;

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
