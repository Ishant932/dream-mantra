import {
  readCustomLandingsFromStore,
  saveCustomLandingsToStore,
} from './studioLandingStore.js';

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
  return readCustomLandingsFromStore();
}

export function getAllStudioLandings() {
  return [...BUILTIN_STUDIO_LANDINGS, ...readCustomLandings()];
}

export function saveCustomLandings(list) {
  saveCustomLandingsToStore(list);
}

export function studioSlugForProduct(productSlug) {
  return getAllStudioLandings().find((l) => l.productSlug === productSlug)?.slug || null;
}
