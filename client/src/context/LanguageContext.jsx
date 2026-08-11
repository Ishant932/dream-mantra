import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { getMessages, translate, translateData } from '../i18n';
import { loc, mergeDeep } from '../i18n/utils';
import { pagesApi } from '../api';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem('dm_lang') || 'en';
    } catch {
      return 'en';
    }
  });
  const [copyTrees, setCopyTrees] = useState({ en: {}, hi: {} });

  const loadCopyOverrides = useCallback(() => {
    pagesApi.copyOverrides()
      .then((r) => setCopyTrees(r.trees || { en: {}, hi: {} }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadCopyOverrides();
  }, [loadCopyOverrides]);

  const messages = useMemo(
    () => mergeDeep(getMessages(lang), copyTrees[lang] || {}),
    [lang, copyTrees],
  );

  useEffect(() => {
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
    document.documentElement.setAttribute('data-lang', lang);
    try {
      localStorage.setItem('dm_lang', lang);
    } catch {
      /* private mode */
    }
  }, [lang]);

  const setLang = useCallback((next) => {
    setLangState((prev) => (typeof next === 'function' ? next(prev) : next));
  }, []);

  const toggle = useCallback(() => {
    setLangState((l) => (l === 'en' ? 'hi' : 'en'));
  }, []);

  const t = useCallback(
    (path) => translate(messages, path),
    [messages],
  );

  const d = useCallback(
    (path) => translateData(messages, path),
    [messages],
  );

  const localize = useCallback(
    (item, field = 'title') => loc(item, lang, field),
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t, d, localize, messages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
