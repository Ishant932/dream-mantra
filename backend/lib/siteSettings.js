import { getData, saveData } from './database.js';

const DEFAULTS = {
  community_links: {
    'crp-test': '',
  },
};

export function ensureSiteSettings() {
  const data = getData();
  if (!data.site_settings) {
    data.site_settings = structuredClone(DEFAULTS);
    saveData();
  }
  if (!data.site_settings.community_links) {
    data.site_settings.community_links = { ...DEFAULTS.community_links };
    saveData();
  }
  return data.site_settings;
}

export function getSiteSettings() {
  return ensureSiteSettings();
}

export function getCommunityLink(productSlug = 'crp-test') {
  const settings = ensureSiteSettings();
  return settings.community_links?.[productSlug] || '';
}

export function updateSiteSettings(patch) {
  const data = getData();
  ensureSiteSettings();
  if (patch.community_links) {
    data.site_settings.community_links = {
      ...data.site_settings.community_links,
      ...patch.community_links,
    };
  }
  saveData();
  return data.site_settings;
}
