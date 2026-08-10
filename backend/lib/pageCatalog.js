import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PAGE_CATALOG_DEFAULTS } from './pageCatalogDefaults.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_FILE = path.join(__dirname, '../data/page-catalog.json');

export const PAGE_CATALOG_DEFS = [
  { slug: 'home', label: 'Homepage', route: '/' },
  { slug: 'brain-mapping', label: 'Brain Mapping', route: '/counselling?tab=dmit' },
  { slug: 'skill-mapping', label: 'Skill Mapping', route: '/counselling?tab=psychometric' },
  { slug: 'combo', label: 'Brain + Skill Mapping', route: '/counselling?tab=combo' },
  { slug: 'counselling', label: 'Counselling Hub', route: '/counselling' },
  { slug: 'crp', label: 'AI Career Launchpad', route: '/crp' },
  { slug: 'career-readiness', label: 'Career Readiness Program', route: '/crp?tab=readiness' },
  { slug: 'marketplace', label: 'Book Now / Marketplace', route: '/marketplace' },
  { slug: 'careers', label: 'Career Library', route: '/careers' },
  { slug: 'blog', label: 'Blog', route: '/blog' },
  { slug: 'about', label: 'About Us', route: '/about' },
  { slug: 'contact', label: 'Contact', route: '/contact' },
  { slug: 'terms', label: 'Terms & Conditions', route: '/terms' },
  { slug: 'policies', label: 'Policies', route: '/policies' },
  { slug: 'privacy', label: 'Privacy Policy', route: '/privacy' },
  { slug: 'refund', label: 'Refund Policy', route: '/refund' },
];

function readAll() {
  try {
    if (fs.existsSync(CATALOG_FILE)) return JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8')) || {};
  } catch { /* ignore */ }
  return {};
}

function writeAll(data) {
  fs.mkdirSync(path.dirname(CATALOG_FILE), { recursive: true });
  fs.writeFileSync(CATALOG_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function mergePage(slug, stored = {}) {
  const def = PAGE_CATALOG_DEFS.find((p) => p.slug === slug);
  const defaults = PAGE_CATALOG_DEFAULTS[slug] || {};
  if (!def) return null;
  return {
    ...def,
    heroTitle: stored.heroTitle || defaults.heroTitle || def.label,
    heroSubtitle: stored.heroSubtitle || defaults.heroSubtitle || '',
    heroImage: stored.heroImage || defaults.heroImage || '',
    intro: stored.intro || defaults.intro || '',
    sections: stored.sections?.length ? stored.sections : (defaults.sections || []),
    fullHtml: stored.fullHtml || defaults.fullHtml || '',
    updated_at: stored.updated_at || null,
  };
}

export function listPageCatalog() {
  const all = readAll();
  return PAGE_CATALOG_DEFS.map((p) => mergePage(p.slug, all[p.slug] || {}));
}

export function getPageCatalog(slug) {
  return mergePage(slug, readAll()[slug] || {});
}

export function updatePageCatalog(slug, patch = {}) {
  if (!PAGE_CATALOG_DEFS.some((p) => p.slug === slug)) throw new Error('Unknown page');
  const all = readAll();
  all[slug] = {
    ...(all[slug] || {}),
    heroTitle: patch.heroTitle ?? all[slug]?.heroTitle ?? '',
    heroSubtitle: patch.heroSubtitle ?? all[slug]?.heroSubtitle ?? '',
    heroImage: patch.heroImage ?? all[slug]?.heroImage ?? '',
    intro: patch.intro ?? all[slug]?.intro ?? '',
    sections: Array.isArray(patch.sections) ? patch.sections : (all[slug]?.sections || []),
    fullHtml: patch.fullHtml ?? all[slug]?.fullHtml ?? '',
    updated_at: new Date().toISOString(),
  };
  writeAll(all);
  return getPageCatalog(slug);
}
