import { createContext, useContext, useEffect, useState } from 'react';
import { translations } from './i18n';
import { useContent, deepMerge } from './useContent';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('hh-lang') || 'en'; } catch { return 'en'; }
  });
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('hh-theme') || 'dark'; } catch { return 'dark'; }
  });
  const content = useContent();
  const textOverrides = (content && content.text && content.text[lang]) || {};
  const t = deepMerge(translations[lang], textOverrides);
  const marquee = (t && t.marquee) || [];
  const toggle = () => setLang(l => (l === 'en' ? 'ur' : 'en'));
  const isUrdu = lang === 'ur';
  const isDark = theme === 'dark';
  const toggleTheme = () => setTheme(th => (th === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('hh-theme', theme); } catch { /* ignore */ }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = isUrdu ? 'ur' : 'en';
    try { localStorage.setItem('hh-lang', lang); } catch { /* ignore */ }
  }, [lang, isUrdu]);

  return (
    <LangContext.Provider value={{ lang, t, marquee, toggle, isUrdu, theme, toggleTheme, isDark }}>
      <div dir={isUrdu ? 'rtl' : 'ltr'} className={isUrdu ? 'urdu-mode' : ''}>
        {children}
      </div>
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}