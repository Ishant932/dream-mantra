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

function migrateCustomFromFile() {
  const parsed = readJsonFile(CUSTOM_FILE, []);
  return Array.isArray(parsed) ? parsed : [];
}

function migrateMetaFromFile() {
  const parsed = readJsonFile(META_FILE, {});
  return parsed && typeof parsed === 'object' ? parsed : {};
}

export function ensureStudioLandingStore() {
  const settings = ensureSiteSettings();
  let changed = false;
  if (!Array.isArray(settings.studio_landing_custom)) {
    settings.studio_landing_custom = migrateCustomFromFile();
    changed = true;
  }
  if (!settings.studio_landing_meta || typeof settings.studio_landing_meta !== 'object') {
    settings.studio_landing_meta = migrateMetaFromFile();
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
  return !!(files.html || files.css || files.js || files.assets?.hero || files.assets?.logo);
}

export function saveLandingFilesToStore(slug, files = {}) {
  const data = getData();
  ensureStudioLandingStore();
  const prev = data.site_settings.studio_landing_files[slug] || {};
  const next = { ...prev };
  for (const [key, content] of Object.entries(files)) {
    if (key === 'assets') {
      if (content && typeof content === 'object') {
        next.assets = { ...(prev.assets || {}), ...content };
      }
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

const ASSET_FILES = {
  hero: 'hero.png',
  logo: 'logo.png',
  esha: 'esha-new.png',
};

function readAssetsFromDisk(dir) {
  const assetsDir = path.join(dir, 'assets');
  if (!fs.existsSync(assetsDir)) return {};
  const assets = {};
  for (const [key, filename] of Object.entries(ASSET_FILES)) {
    const filePath = path.join(assetsDir, filename);
    if (fs.existsSync(filePath)) {
      assets[key] = fs.readFileSync(filePath).toString('base64');
    }
  }
  return assets;
}

function readFilesFromDisk(dir) {
  const files = {};
  for (const [key, filename] of Object.entries(FILE_KEYS)) {
    const filePath = path.join(dir, filename);
    if (fs.existsSync(filePath)) files[key] = fs.readFileSync(filePath, 'utf8');
  }
  const assets = readAssetsFromDisk(dir);
  if (Object.keys(assets).length) files.assets = assets;
  return files;
}

function writeAssetFiles(assetsDir, assets = {}) {
  fs.mkdirSync(assetsDir, { recursive: true });
  const heroB64 = assets.hero || assets.heroImage;
  const logoB64 = assets.logo || assets.logoImage;
  if (heroB64) fs.writeFileSync(path.join(assetsDir, 'hero.png'), Buffer.from(heroB64, 'base64'));
  if (logoB64) fs.writeFileSync(path.join(assetsDir, 'logo.png'), Buffer.from(logoB64, 'base64'));
  if (assets.esha) fs.writeFileSync(path.join(assetsDir, 'esha-new.png'), Buffer.from(assets.esha, 'base64'));
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
    writeAssetFiles(path.join(dir, 'assets'), files.assets);
  }
}

export function saveLandingAssetsToStore(slug, assets = {}) {
  const data = getData();
  ensureStudioLandingStore();
  const prev = data.site_settings.studio_landing_files[slug] || {};
  const next = { ...prev, assets: { ...(prev.assets || {}), ...assets }, updated_at: new Date().toISOString() };
  data.site_settings.studio_landing_files[slug] = next;
  saveData();
  return next;
}

export function captureLandingFilesFromDisk(slug, folder) {
  const dir = path.join(landingPagesDir, folder);
  if (!fs.existsSync(dir)) return null;
  const files = readFilesFromDisk(dir);
  if (!files.html && !files.css && !files.js) return null;
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
