import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CUSTOM_FILE = path.join(__dirname, '../data/studio-landings-custom.json');

/** Built-in public URL slugs → Landing Pages folder + checkout module */
export const BUILTIN_STUDIO_LANDINGS = [
  { slug: 'counselling', label: 'Counselling', folder: 'Counselling', productSlug: 'dmit-psychometric' },
  { slug: 'brain-mapping', label: 'Brain Mapping', folder: 'Brain Mapping', productSlug: 'dmit' },
  { slug: 'skill-mapping', label: 'Skill Mapping', folder: 'Skill Mapping', productSlug: 'psychometric' },
  { slug: 'training-and-placement', label: 'Training & Placement', folder: 'Training And Placement', productSlug: 'career-readiness' },
];

/** @deprecated use getAllStudioLandings() */
export const STUDIO_LANDINGS = BUILTIN_STUDIO_LANDINGS;

export function readCustomLandings() {
  try {
    if (fs.existsSync(CUSTOM_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(CUSTOM_FILE, 'utf8'));
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function getAllStudioLandings() {
  return [...BUILTIN_STUDIO_LANDINGS, ...readCustomLandings()];
}

export function saveCustomLandings(list) {
  fs.mkdirSync(path.dirname(CUSTOM_FILE), { recursive: true });
  fs.writeFileSync(CUSTOM_FILE, JSON.stringify(list, null, 2), 'utf8');
}

export function studioSlugForProduct(productSlug) {
  return getAllStudioLandings().find((l) => l.productSlug === productSlug)?.slug || null;
}
