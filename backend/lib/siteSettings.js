import { getData, saveData } from './database.js';

const DEFAULTS = {
  community_links: {
    'crp-test': '',
  },
  community_schedule: [],
  skill_mapping_combos: [],
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
  if (!Array.isArray(data.site_settings.community_schedule)) {
    data.site_settings.community_schedule = [];
    saveData();
  }
  if (!Array.isArray(data.site_settings.catalog_modules)) {
    data.site_settings.catalog_modules = [];
  }
  if (!Array.isArray(data.site_settings.vouchers)) {
    data.site_settings.vouchers = [];
    saveData();
  }
  if (!Array.isArray(data.site_settings.studio_landing_custom)) {
    data.site_settings.studio_landing_custom = [];
  }
  if (!data.site_settings.studio_landing_meta || typeof data.site_settings.studio_landing_meta !== 'object') {
    data.site_settings.studio_landing_meta = {};
  }
  if (!data.site_settings.studio_landing_files || typeof data.site_settings.studio_landing_files !== 'object') {
    data.site_settings.studio_landing_files = {};
  }
  if (!data.site_settings.blog_media || typeof data.site_settings.blog_media !== 'object') {
    data.site_settings.blog_media = {};
  }
  return data.site_settings;
}

export function getSiteSettings() {
  return ensureSiteSettings();
}

function parseTs(iso) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : null;
}

/** Active community link for product — date-window entry wins, else legacy single link */
export function getCommunityLink(productSlug = 'crp-test', at = new Date(), userRegisteredAt = null) {
  const settings = ensureSiteSettings();
  const now = at instanceof Date ? at.getTime() : new Date(at).getTime();
  const regTs = userRegisteredAt ? parseTs(userRegisteredAt) : null;
  const schedule = (settings.community_schedule || []).filter((e) => e.product_slug === productSlug || !e.product_slug);

  const active = schedule
    .filter((e) => e.active !== false && String(e.url || '').trim())
    .filter((e) => {
      const start = parseTs(e.start_at);
      const end = parseTs(e.end_at);
      if (start != null && now < start) return false;
      if (end != null && now > end) return false;
      if (regTs != null && (e.user_registered_from || e.user_registered_to)) {
        const regFrom = parseTs(e.user_registered_from);
        const regTo = parseTs(e.user_registered_to);
        if (regFrom != null && regTs < regFrom) return false;
        if (regTo != null && regTs > regTo) return false;
      }
      return true;
    })
    .sort((a, b) => (parseTs(b.start_at) || 0) - (parseTs(a.start_at) || 0));

  if (active.length) {
    const entry = active[0];
    return {
      url: String(entry.url).trim(),
      title: entry.title || 'Community',
      description: entry.description || '',
      start_at: entry.start_at || null,
      end_at: entry.end_at || null,
      id: entry.id,
    };
  }

  const legacy = settings.community_links?.[productSlug] || '';
  if (!legacy) return null;
  return { url: legacy, title: 'Community', description: '', start_at: null, end_at: null, id: null };
}

export function getCommunityLinkUrl(productSlug = 'crp-test') {
  const link = getCommunityLink(productSlug);
  return link?.url || '';
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
  if (patch.community_schedule) {
    data.site_settings.community_schedule = patch.community_schedule;
  }
  if (patch.skill_mapping_combos) {
    data.site_settings.skill_mapping_combos = patch.skill_mapping_combos;
  }
  saveData();
  return data.site_settings;
}

export function upsertCommunityScheduleEntry(entry) {
  const data = getData();
  ensureSiteSettings();
  const list = data.site_settings.community_schedule || [];
  const id = entry.id || `comm-${Date.now()}`;
  const row = {
    id,
    product_slug: entry.product_slug || 'crp-test',
    title: String(entry.title || '').trim(),
    description: String(entry.description || '').trim(),
    url: String(entry.url || '').trim(),
    start_at: entry.start_at || null,
    end_at: entry.end_at || null,
    user_registered_from: entry.user_registered_from || null,
    user_registered_to: entry.user_registered_to || null,
    active: entry.active !== false,
    updated_at: new Date().toISOString(),
    created_at: entry.created_at || new Date().toISOString(),
  };
  const idx = list.findIndex((e) => e.id === id);
  if (idx >= 0) list[idx] = { ...list[idx], ...row };
  else list.push(row);
  data.site_settings.community_schedule = list;
  saveData();
  return row;
}

export function deleteCommunityScheduleEntry(id) {
  const data = getData();
  ensureSiteSettings();
  const before = (data.site_settings.community_schedule || []).length;
  data.site_settings.community_schedule = (data.site_settings.community_schedule || []).filter((e) => e.id !== id);
  saveData();
  return before !== data.site_settings.community_schedule.length;
}
