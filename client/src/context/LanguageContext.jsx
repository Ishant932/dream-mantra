import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { getMessages, translate, translateData } from '../i18n';
import { loc, mergeDeep } from '../i18n/utils';
import { pagesApi } from '../api';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('dm_lang') || 'en');
  const [copyTrees, setCopyTrees] = useState({ en: {}, hi: {} });

  useEffect(() => {
    pagesApi.copyOverrides()
      .then((r) => setCopyTrees(r.trees || { en: {}, hi: {} }))
      .catch(() => {});
  }, []);

  const messages = useMemo(
    () => mergeDeep(getMessages(lang), copyTrees[lang] || copyTrees.en || {}),
    [lang, copyTrees],
  );

  useEffect(() => {
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
    localStorage.setItem('dm_lang', lang);
  }, [lang]);

  const toggle = useCallback(() => {
    setLang((l) => (l === 'en' ? 'hi' : 'en'));
  }, []);

  const t = useCallback(
    (path) => translate(messages, path),
    [messages]
  );

  /** Localized data arrays / objects — e.g. d('data.processSteps') */
  const d = useCallback(
    (path) => translateData(messages, path),
    [messages]
  );

  const localize = useCallback(
    (item, field = 'title') => loc(item, lang, field),
    [lang]
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
