/** Flatten nested i18n objects into editable string rows. */
export function flattenStrings(obj, prefix = '') {
  const rows = [];
  if (obj == null) return rows;
  if (typeof obj === 'string') {
    if (prefix) rows.push({ path: prefix, value: obj });
    return rows;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      rows.push(...flattenStrings(item, prefix ? `${prefix}.${i}` : String(i)));
    });
    return rows;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      rows.push(...flattenStrings(v, prefix ? `${prefix}.${k}` : k));
    }
  }
  return rows;
}

export function setPath(obj, dotPath, value) {
  const keys = String(dotPath || '').split('.').filter(Boolean);
  if (!keys.length) return obj;
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const nextIsIndex = /^\d+$/.test(keys[i + 1]);
    if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = nextIsIndex ? [] : {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return obj;
}

export function patchesToTree(patches = {}) {
  const tree = {};
  for (const [dotPath, value] of Object.entries(patches)) {
    if (typeof value === 'string') setPath(tree, dotPath, value);
  }
  return tree;
}
