import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureSiteSettings } from './siteSettings.js';
import { getData, saveData } from './database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CUSTOM_FILE = path.join(__dirname, '../data/studio-landings-custom.json');
const META_FILE = path.join(__dirname, '../data/studio-landings-meta.json');
const landingPagesDir = path.join(__dirname, '../../Landing Pages');

const FILE_KEYS = {
  html: 'index.html',
  css: 'styles.css',
  js: 'script.js',
};

function readJsonFile(filePath, fallback) {
  try {
    if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    /* ignore */
  }
  return fallback;
}

export function ensureStudioLandingStore() {
  const settings = ensureSiteSettings();
  let changed = false;
  if (!Array.isArray(settings.studio_landing_custom)) {
    settings.studio_landing_custom = readJsonFile(CUSTOM_FILE, []);
    changed = true;
  }
  if (!settings.studio_landing_meta || typeof settings.studio_landing_meta !== 'object') {
    settings.studio_landing_meta = readJsonFile(META_FILE, {});
    changed = true;
  }
  if (!settings.studio_landing_files || typeof settings.studio_landing_files !== 'object') {
    settings.studio_landing_files = {};
    changed = true;
  }
  if (changed) saveData();
  return settings;
}

export function readCustomLandingsFromStore() {
  return [...(ensureStudioLandingStore().studio_landing_custom || [])];
}

export function saveCustomLandingsToStore(list) {
  const data = getData();
  ensureStudioLandingStore();
  data.site_settings.studio_landing_custom = Array.isArray(list) ? list : [];
  saveData();
}

export function readAllLandingMetaFromStore() {
  return { ...(ensureStudioLandingStore().studio_landing_meta || {}) };
}

export function writeAllLandingMetaToStore(next) {
  const data = getData();
  ensureStudioLandingStore();
  data.site_settings.studio_landing_meta = next && typeof next === 'object' ? next : {};
  saveData();
}

export function getLandingFilesFromStore(slug) {
  const files = ensureStudioLandingStore().studio_landing_files?.[slug];
  return files && typeof files === 'object' ? files : null;
}

export function hasLandingFilesInStore(slug) {
  const files = getLandingFilesFromStore(slug);
  if (!files) return false;
  return !!(files.html || files.css || files.js);
}

export function saveLandingFilesToStore(slug, files = {}) {
  const data = getData();
  ensureStudioLandingStore();
  const prev = data.site_settings.studio_landing_files[slug] || {};
  const next = { ...prev };
  for (const [key, content] of Object.entries(files)) {
    if (key === 'assets') {
      next.assets = content && typeof content === 'object' ? content : {};
      continue;
    }
    if (typeof content !== 'string') continue;
    next[key] = content;
  }
  next.updated_at = new Date().toISOString();
  data.site_settings.studio_landing_files[slug] = next;
  saveData();
  return next;
}

export function deleteLandingFilesFromStore(slug) {
  const data = getData();
  ensureStudioLandingStore();
  if (data.site_settings.studio_landing_files[slug]) {
    delete data.site_settings.studio_landing_files[slug];
    saveData();
  }
}

function readFilesFromDisk(dir) {
  const files = {};
  for (const [key, filename] of Object.entries(FILE_KEYS)) {
    const filePath = path.join(dir, filename);
    if (fs.existsSync(filePath)) files[key] = fs.readFileSync(filePath, 'utf8');
  }
  files.assets = readAssetsFromDisk(dir);
  return files;
}

function readAssetsFromDisk(dir) {
  const assetsDir = path.join(dir, 'assets');
  if (!fs.existsSync(assetsDir)) return {};
  const out = {};
  const walk = (rel, base) => {
    for (const name of fs.readdirSync(base)) {
      const full = path.join(base, name);
      const relPath = rel ? `${rel}/${name}` : name;
      if (fs.statSync(full).isDirectory()) walk(relPath, full);
      else out[relPath] = fs.readFileSync(full).toString('base64');
    }
  };
  walk('', assetsDir);
  return out;
}

function writeFilesToDisk(dir, files = {}) {
  fs.mkdirSync(dir, { recursive: true });
  for (const [key, content] of Object.entries(files)) {
    if (key === 'assets') continue;
    const filename = FILE_KEYS[key];
    if (!filename || typeof content !== 'string') continue;
    fs.writeFileSync(path.join(dir, filename), content, 'utf8');
  }
  if (files.assets && typeof files.assets === 'object') {
    writeAssetsToDisk(dir, files.assets);
  }
}

function writeAssetsToDisk(dir, assets = {}) {
  const assetsDir = path.join(dir, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });
  for (const [relPath, b64] of Object.entries(assets)) {
    if (!b64 || typeof b64 !== 'string') continue;
    const dest = path.join(assetsDir, relPath);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, Buffer.from(b64, 'base64'));
  }
}

export function writeLandingAssetsToDisk(dir, { heroImage, logoImage } = {}) {
  if (!heroImage && !logoImage) return;
  const assetsDir = path.join(dir, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });
  if (heroImage) {
    const buf = Buffer.from(heroImage, 'base64');
    fs.writeFileSync(path.join(assetsDir, 'hero.png'), buf);
    fs.writeFileSync(path.join(assetsDir, 'esha-new.png'), buf);
  }
  if (logoImage) {
    fs.writeFileSync(path.join(assetsDir, 'logo.png'), Buffer.from(logoImage, 'base64'));
  }
}

export function captureLandingFilesFromDisk(slug, folder) {
  const dir = path.join(landingPagesDir, folder);
  if (!fs.existsSync(dir)) return null;
  const files = readFilesFromDisk(dir);
  if (!files.html && !files.css && !files.js && !Object.keys(files.assets || {}).length) return null;
  saveLandingFilesToStore(slug, files);
  return files;
}

export function ensureLandingFilesOnDisk(meta) {
  if (!meta?.slug || !meta?.folder) return false;
  const dir = path.join(landingPagesDir, meta.folder);
  const hasDisk = fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'));
  if (hasDisk) {
    if (!hasLandingFilesInStore(meta.slug)) captureLandingFilesFromDisk(meta.slug, meta.folder);
    return true;
  }
  const stored = getLandingFilesFromStore(meta.slug);
  if (!stored?.html && !stored?.css && !stored?.js) return false;
  writeFilesToDisk(dir, stored);
  return fs.existsSync(path.join(dir, 'index.html'));
}

export function persistLandingFiles(meta, files = {}) {
  saveLandingFilesToStore(meta.slug, files);
  const dir = path.join(landingPagesDir, meta.folder);
  writeFilesToDisk(dir, files);
  return files;
}

export function hydrateAllStudioLandings(landings = []) {
  let hydrated = 0;
  for (const landing of landings) {
    if (ensureLandingFilesOnDisk(landing)) hydrated += 1;
  }
  return hydrated;
}
