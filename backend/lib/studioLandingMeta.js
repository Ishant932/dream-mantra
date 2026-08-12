import {
  ensureStudioLandingStore,
  readAllLandingMetaFromStore,
  writeAllLandingMetaToStore,
  hasLandingFilesInStore,
} from './studioLandingStore.js';

export function getLandingMeta(slug) {
  const all = readAllLandingMetaFromStore();
  return all[slug] || { published: true, ctaLabel: 'Join Now' };
}

export function setLandingMeta(slug, patch = {}) {
  const all = readAllLandingMetaFromStore();
  all[slug] = { ...getLandingMeta(slug), ...patch, updated_at: new Date().toISOString() };
  writeAllLandingMetaToStore(all);
  return all[slug];
}

export function isLandingPublished(slug, filesExist = true) {
  const meta = getLandingMeta(slug);
  if (meta.published === false) return false;
  return filesExist || hasLandingFilesInStore(slug);
}

export function deleteLandingMeta(slug) {
  const all = readAllLandingMetaFromStore();
  delete all[slug];
  writeAllLandingMetaToStore(all);
}

export function ensureLandingMetaStore() {
  return ensureStudioLandingStore();
}
