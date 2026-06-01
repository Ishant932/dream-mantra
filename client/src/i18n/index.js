import { translations } from './translations';
import { siteEn } from './site.en';
import { siteHi } from './site.hi';
import { get, mergeDeep } from './utils';

const siteByLang = { en: siteEn, hi: siteHi };

export function getMessages(lang) {
  const base = translations[lang] || translations.en;
  const site = siteByLang[lang] || siteEn;
  return mergeDeep(base, site);
}

export function translate(messages, path) {
  const val = get(messages, path);
  if (val !== undefined && typeof val !== 'object') return val;
  const fallback = get(translations.en, path);
  if (fallback !== undefined && typeof fallback !== 'object') return fallback;
  const siteFallback = get(siteEn, path);
  if (siteFallback !== undefined && typeof siteFallback !== 'object') return siteFallback;
  return path;
}

export function translateData(messages, path) {
  const val = get(messages, path);
  if (val !== undefined) return val;
  const fallback = get(siteEn, path);
  if (fallback !== undefined) return fallback;
  if (import.meta.env.DEV) {
    console.warn(`[i18n] Missing translation key: ${path}`);
  }
  if (path.startsWith('pages.')) return {};
  return [];
}

export { get, loc } from './utils';
