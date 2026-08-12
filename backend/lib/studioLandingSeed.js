import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getData, saveData } from './database.js';
import { BUILTIN_STUDIO_LANDINGS } from './studioLandings.js';
import {
  captureLandingFilesFromDisk,
  ensureStudioLandingStore,
  hydrateAllStudioLandings,
  readAllLandingMetaFromStore,
  writeAllLandingMetaToStore,
} from './studioLandingStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CUSTOM_FILE = path.join(__dirname, '../data/studio-landings-custom.json');
const META_FILE = path.join(__dirname, '../data/studio-landings-meta.json');

/** Default custom landings shipped with the repo — merged into DB if missing. */
export const DEFAULT_CUSTOM_STUDIO_LANDINGS = [
  {
    slug: 'personalized-career-readiness-program',
    label: 'Personalised Career Readiness Program',
    folder: 'landing page',
    productSlug: 'career-readiness',
  },
  {
    slug: 'counselling-guidance',
    label: 'Counselling Guidance',
    folder: 'Counselling Guidance',
    productSlug: 'dmit-psychometric',
    guidance: true,
  },
  {
    slug: 'brain-mapping-guidance',
    label: 'Brain Mapping Guidance',
    folder: 'Brain Mapping Guidance',
    productSlug: 'dmit',
    guidance: true,
  },
  {
    slug: 'skill-mapping-guidance',
    label: 'Skill Mapping Guidance',
    folder: 'Skill Mapping Guidance',
    productSlug: 'psychometric',
    guidance: true,
  },
  {
    slug: 'brain-skill-mapping-guidance',
    label: 'Brain Skill Mapping Guidance',
    folder: 'Brain Skill Mapping Guidance',
    productSlug: 'dmit-psychometric',
    guidance: true,
  },
];

function readJsonFile(filePath, fallback) {
  try {
    if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    /* ignore */
  }
  return fallback;
}

function defaultCustomLandings() {
  const fromFile = readJsonFile(CUSTOM_FILE, []);
  if (Array.isArray(fromFile) && fromFile.length) return fromFile;
  return DEFAULT_CUSTOM_STUDIO_LANDINGS;
}

function defaultLandingMeta() {
  const fromFile = readJsonFile(META_FILE, {});
  const base = fromFile && typeof fromFile === 'object' ? fromFile : {};
  const all = [...BUILTIN_STUDIO_LANDINGS, ...DEFAULT_CUSTOM_STUDIO_LANDINGS];
  for (const landing of all) {
    if (!base[landing.slug]) {
      base[landing.slug] = { published: true, ctaLabel: 'Join Now' };
    }
  }
  return base;
}

/** Merge default custom landings into DB and capture files for serving. */
export function seedStudioLandings() {
  const data = getData();
  ensureStudioLandingStore();

  const defaults = defaultCustomLandings();
  const current = Array.isArray(data.site_settings.studio_landing_custom)
    ? data.site_settings.studio_landing_custom
    : [];
  const bySlug = new Map(current.map((l) => [l.slug, l]));
  let customChanged = false;

  for (const entry of defaults) {
    if (!bySlug.has(entry.slug)) {
      bySlug.set(entry.slug, entry);
      customChanged = true;
    }
  }

  if (customChanged || current.length !== bySlug.size) {
    data.site_settings.studio_landing_custom = [...bySlug.values()];
  }

  const metaDefaults = defaultLandingMeta();
  const currentMeta = readAllLandingMetaFromStore();
  const mergedMeta = { ...currentMeta };
  let metaChanged = false;

  for (const [slug, meta] of Object.entries(metaDefaults)) {
    if (!mergedMeta[slug]) {
      mergedMeta[slug] = meta;
      metaChanged = true;
    }
  }

  if (metaChanged) {
    writeAllLandingMetaToStore(mergedMeta);
  }

  const allLandings = [...BUILTIN_STUDIO_LANDINGS, ...data.site_settings.studio_landing_custom];
  for (const landing of allLandings) {
    captureLandingFilesFromDisk(landing.slug, landing.folder);
  }
  const hydrated = hydrateAllStudioLandings(allLandings);

  if (customChanged || metaChanged) saveData();

  return {
    customCount: data.site_settings.studio_landing_custom.length,
    hydrated,
    restored: customChanged,
  };
}
