import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { STUDIO_LANDINGS } from './studioLandings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landingPagesDir = path.join(__dirname, '../../Landing Pages');

const FILE_KEYS = {
  html: 'index.html',
  css: 'styles.css',
  js: 'script.js',
};

function landingDir(slug) {
  const meta = STUDIO_LANDINGS.find((l) => l.slug === slug);
  if (!meta) throw new Error('Landing page not found');
  const dir = path.join(landingPagesDir, meta.folder);
  if (!fs.existsSync(dir)) throw new Error('Landing page folder missing on server');
  return { meta, dir };
}

export function listStudioLandingsForAdmin() {
  return STUDIO_LANDINGS.map((l) => {
    const dir = path.join(landingPagesDir, l.folder);
    const exists = fs.existsSync(dir);
    return {
      slug: l.slug,
      label: l.label,
      productSlug: l.productSlug,
      folder: l.folder,
      live: exists,
      localPath: `/studio/${l.slug}/`,
      productionPath: `https://dreammantra.in/studio/${l.slug}/`,
    };
  });
}

export function readStudioLanding(slug) {
  const { meta, dir } = landingDir(slug);
  const files = {};
  for (const [key, filename] of Object.entries(FILE_KEYS)) {
    const filePath = path.join(dir, filename);
    files[key] = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  }
  return {
    slug: meta.slug,
    label: meta.label,
    productSlug: meta.productSlug,
    files,
  };
}

export function writeStudioLanding(slug, files = {}) {
  const { meta, dir } = landingDir(slug);
  for (const [key, content] of Object.entries(files)) {
    const filename = FILE_KEYS[key];
    if (!filename || typeof content !== 'string') continue;
    fs.writeFileSync(path.join(dir, filename), content, 'utf8');
  }
  return readStudioLanding(slug);
}
