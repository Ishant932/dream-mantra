import { ensureSiteSettings, getSiteSettings } from './siteSettings.js';
import { getData, saveData } from './database.js';
import { COUPONS as STATIC_COUPONS } from '../config/coupons.js';

export const COUNSELLING_ADDON_PRICE = 699;
export const COUNSELLING_TOPUP_PRICE = 999;

export const DEFAULT_COUNSELLING_ADDON = {
  title: 'Counselling session',
  price: COUNSELLING_ADDON_PRICE,
  description: 'Add a 1-on-1 session with our certified counsellor',
};

export const BASE_MODULE_CATALOG = [
  {
    slug: 'dmit',
    title: 'Brain Mapping',
    price: 1999,
    optionalCounselling: true,
    icon: '🧬',
    description: 'Fingerprint-based inborn talent mapping — learning styles, memory patterns & natural aptitudes.',
    counsellingAddon: { ...DEFAULT_COUNSELLING_ADDON },
  },
  {
    slug: 'psychometric',
    title: 'Skill Mapping',
    price: 699,
    optionalCounselling: true,
    icon: '🧠',
    description: '7 assessments for personality, work style, learning style, talents & career fit.',
    counsellingAddon: { ...DEFAULT_COUNSELLING_ADDON },
  },
  {
    slug: 'dmit-psychometric',
    title: 'Brain + Skill Mapping',
    price: 2999,
    optionalCounselling: false,
    includesCounselling: true,
    icon: '✨',
    description: 'Complete nature + nurture profile with expert counselling session included.',
  },
  {
    slug: 'crp-test',
    title: 'AI Career Launchpad',
    price: 1499,
    optionalCounselling: false,
    icon: '🚀',
    description: '5-session AI-powered career training for college students & freshers.',
  },
  {
    slug: 'career-readiness',
    title: 'Personalised Career Readiness Program',
    price: 2999,
    optionalCounselling: false,
    includesCounselling: true,
    icon: '🎯',
    description: 'Brain + Skill Mapping, five sessions, counselling pillars & placement assistance.',
  },
  {
    slug: 'counselling-topup',
    title: 'Additional Counselling Session',
    price: COUNSELLING_TOPUP_PRICE,
    optionalCounselling: false,
    includesCounselling: true,
    followUpOnly: true,
    icon: '💬',
    description: 'Extra 1-on-1 session with our certified counsellor — for follow-up after your first booking.',
  },
];

export function resolveCounsellingAddon(mod) {
  if (!mod) return { ...DEFAULT_COUNSELLING_ADDON };
  const raw = mod.counsellingAddon || {};
  return {
    title: String(raw.title || DEFAULT_COUNSELLING_ADDON.title).trim(),
    price: Math.max(0, Number(raw.price ?? DEFAULT_COUNSELLING_ADDON.price)),
    description: String(raw.description || DEFAULT_COUNSELLING_ADDON.description).trim(),
  };
}

function normalizeCounsellingAddon(input, fallback = DEFAULT_COUNSELLING_ADDON) {
  return {
    title: String(input?.title || fallback.title).trim(),
    price: Math.max(0, Number(input?.price ?? fallback.price)),
    description: String(input?.description || fallback.description).trim(),
  };
}

function cloneBaseCatalog() {
  return BASE_MODULE_CATALOG.map((m) => ({
    ...m,
    counsellingAddon: m.counsellingAddon ? { ...m.counsellingAddon } : undefined,
    source: 'static',
  }));
}

function syncBaseModulesIntoCatalog(catalog) {
  let added = false;
  for (const base of BASE_MODULE_CATALOG) {
    if (!catalog.some((m) => m.slug === base.slug)) {
      catalog.push({
        ...base,
        counsellingAddon: base.counsellingAddon ? { ...base.counsellingAddon } : undefined,
        source: 'static',
      });
      added = true;
    }
  }
  return added;
}

function ensureCatalogModulesArray(data) {
  if (!Array.isArray(data.site_settings.catalog_modules) || !data.site_settings.catalog_modules.length) {
    data.site_settings.catalog_modules = cloneBaseCatalog();
    saveData();
    return data.site_settings.catalog_modules;
  }
  const added = syncBaseModulesIntoCatalog(data.site_settings.catalog_modules);
  if (added) saveData();
  return data.site_settings.catalog_modules;
}

function normalizeModuleSlugs(slugs) {
  if (!Array.isArray(slugs) || !slugs.length) return ['all'];
  return slugs.map(String);
}

function normalizeVoucherRecord(voucher) {
  if (!voucher) return voucher;
  let visibility = 'everyone';
  if (voucher.visibility === 'selected_users') visibility = 'selected_users';
  else if (voucher.visibility === 'hidden') visibility = 'hidden';
  return {
    ...voucher,
    code: String(voucher.code || '').trim().toUpperCase(),
    moduleSlugs: normalizeModuleSlugs(voucher.moduleSlugs),
    active: voucher.active !== false,
    visibility,
    allowedUserIds: Array.isArray(voucher.allowedUserIds)
      ? voucher.allowedUserIds.map((x) => Number(x)).filter((n) => !Number.isNaN(n))
      : [],
    startsAt: voucher.startsAt || null,
  };
}

function staticVouchersFromConfig() {
  return Object.values(STATIC_COUPONS).map((coupon) => normalizeVoucherRecord({
    ...coupon,
    moduleSlugs: coupon.moduleSlugs || ['all'],
    active: coupon.active !== false,
    visibility: coupon.visibility || 'everyone',
    allowedUserIds: coupon.allowedUserIds || [],
    source: 'system',
  }));
}

function parseVoucherStart(startsAt, now = new Date()) {
  if (!startsAt) return true;
  const raw = String(startsAt).trim();
  const start = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T00:00:00.000`)
    : new Date(raw);
  if (Number.isNaN(start.getTime())) return true;
  return start <= now;
}

function isVoucherVisibleToUser(voucher, userId, now = new Date()) {
  const mode = voucher.visibility || 'everyone';
  if (mode === 'hidden') return false;
  if (mode === 'selected_users') {
    const uid = userId != null ? Number(userId) : null;
    const ids = Array.isArray(voucher.allowedUserIds) ? voucher.allowedUserIds.map(Number) : [];
    if (uid == null || !ids.includes(uid)) return false;
  }
  return true;
}

function isVoucherLive(voucher, now = new Date()) {
  return (
    voucher.active !== false
    && !isVoucherExpired(voucher.expiresAt, now)
    && parseVoucherStart(voucher.startsAt, now)
  );
}

function mergeVoucherLists(dbVouchers = [], systemVouchers = []) {
  const dbCodes = new Set(dbVouchers.map((v) => v.code));
  const merged = [
    ...dbVouchers.map((v) => ({ ...v, source: v.source || 'custom' })),
    ...systemVouchers.filter((v) => !dbCodes.has(v.code)),
  ];
  return merged.sort((a, b) => {
    const liveDiff = Number(isVoucherLive(b)) - Number(isVoucherLive(a));
    if (liveDiff !== 0) return liveDiff;
    return a.code.localeCompare(b.code);
  });
}
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || `module-${Date.now()}`;
}

/** Date-only expiry (YYYY-MM-DD) stays valid through end of that day */
export function parseVoucherExpiryEnd(expiresAt) {
  if (!expiresAt) return null;
  const raw = String(expiresAt).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(`${raw}T23:59:59.999`);
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isVoucherExpired(expiresAt, now = new Date()) {
  const end = parseVoucherExpiryEnd(expiresAt);
  return end != null && end < now;
}

function enrichCatalogModule(mod) {
  if (!mod?.slug) return null;
  const base = BASE_MODULE_CATALOG.find((m) => m.slug === mod.slug);
  const merged = {
    ...(base
      ? {
          ...base,
          counsellingAddon: base.counsellingAddon ? { ...base.counsellingAddon } : undefined,
        }
      : {}),
    ...mod,
  };
  if (merged.optionalCounselling) {
    merged.counsellingAddon = normalizeCounsellingAddon(
      mod.counsellingAddon,
      resolveCounsellingAddon(base || mod)
    );
  }
  if (base && !mod.source) merged.source = 'static';
  return merged;
}

export function getActiveModuleCatalog() {
  try {
    ensureSiteSettings();
    const data = getData();
    const stored = ensureCatalogModulesArray(data);
    const list = stored.filter((m) => m && !m.hidden).map(enrichCatalogModule).filter(Boolean);
    if (list.length) return list;
  } catch (e) {
    console.error('getActiveModuleCatalog failed:', e.message);
  }
  return BASE_MODULE_CATALOG.map((m) => enrichCatalogModule({ ...m, source: 'static' })).filter(Boolean);
}

export function listModulesForAdmin() {
  ensureSiteSettings();
  const data = getData();
  return ensureCatalogModulesArray(data).map(enrichCatalogModule).filter(Boolean);
}

export function upsertModule(input) {
  ensureSiteSettings();
  const data = getData();
  const catalog = ensureCatalogModulesArray(data);
  const title = String(input.title || '').trim();
  if (!title) throw new Error('Module title is required');
  const slug = input.slug?.trim() || slugify(title);
  if (!slug) throw new Error('Module slug is required');
  const idx = catalog.findIndex((m) => m.slug === slug);
  const prev = idx >= 0 ? catalog[idx] : null;
  const baseMatch = BASE_MODULE_CATALOG.find((m) => m.slug === slug);
  const module = {
    slug,
    title,
    price: Math.max(0, Number(input.price) || 0),
    optionalCounselling: !!input.optionalCounselling,
    includesCounselling: !!input.includesCounselling,
    followUpOnly: input.followUpOnly !== undefined ? !!input.followUpOnly : !!prev?.followUpOnly,
    description: String(input.description || '').trim(),
    icon: String(input.icon || prev?.icon || baseMatch?.icon || '📋').trim() || '📋',
    hidden: !!input.hidden,
    source: idx >= 0 ? (prev?.source || 'custom') : 'custom',
  };
  if (module.optionalCounselling) {
    module.counsellingAddon = normalizeCounsellingAddon(
      input.counsellingAddon,
      resolveCounsellingAddon(prev || baseMatch)
    );
  } else if (prev?.counsellingAddon) {
    module.counsellingAddon = prev.counsellingAddon;
  }
  if (idx >= 0) {
    catalog[idx] = { ...prev, ...module };
  } else {
    catalog.push(module);
  }
  saveData();
  return catalog[idx >= 0 ? idx : catalog.length - 1];
}

export function removeModule(slug) {
  ensureSiteSettings();
  const data = getData();
  ensureCatalogModulesArray(data);
  const mod = data.site_settings.catalog_modules.find((m) => m.slug === slug);
  if (!mod) return false;
  if (mod.source === 'static') {
    mod.hidden = true;
  } else {
    data.site_settings.catalog_modules = data.site_settings.catalog_modules.filter((m) => m.slug !== slug);
  }
  saveData();
  return true;
}

export function listVouchers() {
  ensureSiteSettings();
  const dbVouchers = (getSiteSettings().vouchers || []).map(normalizeVoucherRecord);
  return mergeVoucherLists(dbVouchers, staticVouchersFromConfig()).map((v) => ({
    ...v,
    live: isVoucherLive(v),
  }));
}

export function listPublicVouchers(userId = null) {
  const now = new Date();
  return listVouchers()
    .filter((v) => isVoucherLive(v, now) && isVoucherVisibleToUser(v, userId, now))
    .map(({ code, label, discountPercent, discountFixed, firstTimeOnly, moduleSlugs, startsAt, expiresAt }) => ({
      code,
      label,
      discountPercent,
      discountFixed,
      firstTimeOnly: !!firstTimeOnly,
      moduleSlugs,
      startsAt,
      expiresAt,
    }));
}

function isSystemVoucherCode(code) {
  return Object.prototype.hasOwnProperty.call(STATIC_COUPONS, String(code || '').trim().toUpperCase());
}

export function findStoredVoucher(code) {
  ensureSiteSettings();
  const normalized = String(code || '').trim().toUpperCase();
  return (getSiteSettings().vouchers || [])
    .map(normalizeVoucherRecord)
    .find((v) => v.code === normalized) || null;
}

export function upsertVoucher(input) {
  ensureSiteSettings();
  const data = getData();
  if (!Array.isArray(data.site_settings.vouchers)) {
    data.site_settings.vouchers = [];
  }
  const code = String(input.code || '').trim().toUpperCase();
  if (!code) throw new Error('Voucher code is required');
  const deactivating = input.active === false;
  const voucher = {
    code,
    label: String(input.label || '').trim() || code,
    discountPercent: input.discountPercent != null ? Math.min(100, Math.max(0, Number(input.discountPercent))) : null,
    discountFixed: input.discountFixed != null ? Math.max(0, Number(input.discountFixed)) : null,
    moduleSlugs: normalizeModuleSlugs(input.moduleSlugs),
    active: input.active !== false,
    firstTimeOnly: !!input.firstTimeOnly,
    startsAt: input.startsAt || null,
    expiresAt: input.expiresAt || null,
    visibility: ['selected_users', 'hidden'].includes(input.visibility) ? input.visibility : 'everyone',
    allowedUserIds: Array.isArray(input.allowedUserIds)
      ? input.allowedUserIds.map((x) => Number(x)).filter((n) => !Number.isNaN(n))
      : [],
    source: isSystemVoucherCode(code) ? 'override' : 'custom',
  };
  if (!deactivating && !voucher.discountPercent && !voucher.discountFixed) {
    throw new Error('Set a discount percent or fixed amount');
  }
  if (deactivating && !voucher.discountPercent && !voucher.discountFixed) {
    voucher.discountPercent = 0;
  }
  const idx = data.site_settings.vouchers.findIndex(
    (v) => String(v.code || '').trim().toUpperCase() === code
  );
  if (idx >= 0) {
    data.site_settings.vouchers[idx] = { ...data.site_settings.vouchers[idx], ...voucher };
  } else {
    data.site_settings.vouchers.push(voucher);
  }
  saveData();
  const saved = data.site_settings.vouchers[idx >= 0 ? idx : data.site_settings.vouchers.length - 1];
  return normalizeVoucherRecord(saved);
}

export function removeVoucher(code) {
  ensureSiteSettings();
  const normalized = String(code || '').trim().toUpperCase();
  if (isSystemVoucherCode(normalized)) {
    upsertVoucher({
      code: normalized,
      active: false,
      discountPercent: 0,
      label: 'Disabled',
      moduleSlugs: ['all'],
    });
    return true;
  }
  const data = getData();
  data.site_settings.vouchers = (data.site_settings.vouchers || []).filter(
    (v) => String(v.code || '').trim().toUpperCase() !== normalized
  );
  saveData();
  return true;
}

export function findVoucher(code) {
  const normalized = String(code || '').trim().toUpperCase();
  const stored = findStoredVoucher(normalized);
  if (stored) {
    if (stored.active === false) return null;
    return stored;
  }
  return staticVouchersFromConfig().find((v) => v.code === normalized && v.active !== false) || null;
}
