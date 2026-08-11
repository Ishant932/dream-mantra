import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, '../data/copy-overrides.json');

function readAll() {
  try {
    if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, 'utf8')) || {};
  } catch { /* ignore */ }
  return { en: {}, hi: {} };
}

function writeAll(data) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
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

export function listCopyPatches() {
  const all = readAll();
  return {
    en: all.en && typeof all.en === 'object' ? all.en : {},
    hi: all.hi && typeof all.hi === 'object' ? all.hi : {},
  };
}

export function getCopyOverrideTrees() {
  const patches = listCopyPatches();
  return {
    en: patchesToTree(patches.en),
    hi: patchesToTree(patches.hi),
  };
}

export function updateCopyPatches(lang, patches = {}) {
  const key = lang === 'hi' ? 'hi' : 'en';
  const all = listCopyPatches();
  const next = { ...all[key] };
  for (const [dotPath, value] of Object.entries(patches)) {
    if (typeof value !== 'string') continue;
    const trimmed = value;
    if (!trimmed) delete next[dotPath];
    else next[dotPath] = trimmed;
  }
  all[key] = next;
  writeAll(all);
  return { patches: all, trees: getCopyOverrideTrees() };
}
