/** Deep get by dot path — e.g. get(obj, 'nav.home') */
export function get(obj, path) {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, key) => (acc != null ? acc[key] : undefined), obj);
}

export function mergeDeep(base, extra) {
  if (!extra) return { ...base };
  const out = { ...base };
  for (const key of Object.keys(extra)) {
    const bv = base[key];
    const ev = extra[key];
    if (
      ev &&
      typeof ev === 'object' &&
      !Array.isArray(ev) &&
      bv &&
      typeof bv === 'object' &&
      !Array.isArray(bv)
    ) {
      out[key] = mergeDeep(bv, ev);
    } else {
      out[key] = ev;
    }
  }
  return out;
}

/** Pick localized field from item with optional Hi suffix */
export function loc(item, lang, field = 'title') {
  if (!item) return '';
  const hiKey = `${field}Hi`;
  if (lang === 'hi' && item[hiKey]) return item[hiKey];
  return item[field] ?? '';
}
