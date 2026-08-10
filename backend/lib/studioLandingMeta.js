import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const META_FILE = path.join(__dirname, '../data/studio-landings-meta.json');

function readAll() {
  try {
    if (fs.existsSync(META_FILE)) return JSON.parse(fs.readFileSync(META_FILE, 'utf8')) || {};
  } catch { /* ignore */ }
  return {};
}

function writeAll(data) {
  fs.mkdirSync(path.dirname(META_FILE), { recursive: true });
  fs.writeFileSync(META_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export function getLandingMeta(slug) {
  const all = readAll();
  return all[slug] || { published: true, ctaLabel: 'Join Now' };
}

export function setLandingMeta(slug, patch = {}) {
  const all = readAll();
  all[slug] = { ...getLandingMeta(slug), ...patch, updated_at: new Date().toISOString() };
  writeAll(all);
  return all[slug];
}

export function isLandingPublished(slug, filesExist = true) {
  const meta = getLandingMeta(slug);
  if (meta.published === false) return false;
  return filesExist;
}

export function deleteLandingMeta(slug) {
  const all = readAll();
  delete all[slug];
  writeAll(all);
}
