import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { UI } from '../lib/i18n.js';
import { THEME_KEY, LANG_KEY } from '../lib/config.js';
import { parseList } from '../lib/format.js';

const AppContext = createContext(null);

function applyTheme(pref) {
  const mode = pref === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : pref;
  document.documentElement.setAttribute('data-bs-theme', mode);
  document.documentElement.setAttribute('data-theme-pref', pref);
}

export function AppProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem(LANG_KEY) || 'id');
  const [theme, setThemeState] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');
  const [settings, setSettings] = useState({});
  const [auth, setAuth] = useState({ user: null, registrationOpen: false, ready: false });

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem(LANG_KEY, lang);
  }, [lang]);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
    if (theme !== 'system') return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  useEffect(() => {
    api('/settings').then(setSettings).catch(() => {});
  }, []);

  const refreshAuth = useCallback(
    () => api('/auth/me')
      .then((d) => setAuth({ user: d.user, registrationOpen: d.registrationOpen, ready: true }))
      .catch(() => setAuth((a) => ({ ...a, user: null, ready: true }))),
    [],
  );
  useEffect(() => { refreshAuth(); }, [refreshAuth]);

  const value = useMemo(() => {
    const t = (key) => {
      let cur = UI[lang];
      for (const part of key.split('.')) cur = cur?.[part];
      return cur ?? key;
    };
    // Padanan setting_t(): versi English dipakai jika diisi, jika tidak kembali ke Indonesia
    const pick = (key) => {
      if (lang !== 'id' && settings[`${key}_en`]) return settings[`${key}_en`];
      return settings[key] ?? '';
    };
    // Teks konten per-baris (proyek, perjalanan): versi Inggris jika ada, jika tidak teks Indonesia
    const loc = (obj, key) => (lang !== 'id' && obj?.[`${key}_en`]) || obj?.[key] || '';
    // Padanan setting_json()
    const enValues = parseList(settings.about_values_en);
    const aboutValues = lang !== 'id' && enValues.length ? enValues : parseList(settings.about_values);

    const login = async (email, password, remember) => {
      const d = await api('/auth/login', { method: 'POST', body: { email, password, remember } });
      setAuth((a) => ({ ...a, user: d.user }));
    };
    const register = async (body) => {
      const d = await api('/auth/register', { method: 'POST', body });
      setAuth((a) => ({ ...a, user: d.user, registrationOpen: false }));
    };
    const logout = async () => {
      await api('/auth/logout', { method: 'POST' });
      setAuth((a) => ({ ...a, user: null }));
    };

    return {
      lang, setLang: setLangState, t, pick, loc, aboutValues, settings,
      theme, setTheme: setThemeState,
      auth, refreshAuth, login, register, logout,
    };
  }, [lang, theme, settings, auth, refreshAuth]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
