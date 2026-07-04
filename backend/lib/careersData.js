import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CLASS_11_STREAM_VALUES, matchesClassStream } from './careerStreams.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PATHS = [
  path.join(__dirname, '../data/careers.json'),
  path.join(__dirname, '../../client/public/data/careers.json'),
  path.join(__dirname, '../../client/dist/data/careers.json'),
];

let cache = null;

export function loadCareersData() {
  if (cache) return cache;
  for (const p of PATHS) {
    try {
      if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        const careers = data.careers || [];
        const slugIndex = new Map(careers.map((c) => [c.slug, c]));
        const categories = [...new Set(careers.map((c) => c.category))].sort();
        cache = { ...data, careers, slugIndex, categories };
        return cache;
      }
    } catch {
      /* try next */
    }
  }
  cache = { careers: [], meta: { total: 0 }, slugIndex: new Map(), categories: [] };
  return cache;
}

function careerMixKey(c) {
  const raw = `${c.category || ''}|${c.title || ''}|${c.id || ''}`;
  let h = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const ROLE_PREFIX = /^(senior|junior|lead|principal|chief|assistant|associate|specialist|head|executive|staff|entry[- ]level|mid[- ]level|trainee|intern)\s+/i;
const ROLE_SUFFIX = /\s+(i|ii|iii|iv|v|1|2|3|4|5)$/i;

/** Group key so "Senior Data Analyst" and "Data Analyst" are spread apart in default browse */
function careerFamilyKey(title = '') {
  return String(title)
    .trim()
    .replace(ROLE_PREFIX, '')
    .replace(ROLE_SUFFIX, '')
    .toLowerCase();
}

function mixedCareerSort(list) {
  return [...list].sort((a, b) => careerMixKey(a) - careerMixKey(b));
}

/** Interleave careers that share the same family title — avoids Data Analyst / Senior Data Analyst clusters */
function spreadSimilarCareers(list) {
  if (list.length < 2) return list;

  const buckets = new Map();
  for (const career of list) {
    const key = careerFamilyKey(career.title) || career.slug || String(career.id);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(career);
  }

  const groups = [...buckets.values()].map((group) => mixedCareerSort(group));
  groups.sort((a, b) => careerMixKey(a[0]) - careerMixKey(b[0]));

  const spread = [];
  let depth = 0;
  while (spread.length < list.length) {
    for (const group of groups) {
      if (depth < group.length) spread.push(group[depth]);
    }
    depth += 1;
  }
  return spread;
}

function filterCareersList(list, { q, category, stream, demand, sort } = {}) {
  let filtered = [...list];

  if (q) {
    const term = q.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title?.toLowerCase().includes(term) ||
        c.category?.toLowerCase().includes(term) ||
        (c.shortDescription || '').toLowerCase().includes(term) ||
        (c.sector || '').toLowerCase().includes(term) ||
        (c.skills || []).some((s) => s.toLowerCase().includes(term)) ||
        (c.topEmployers || []).some((e) => e.toLowerCase().includes(term)) ||
        (c.exams || []).some((e) => e.toLowerCase().includes(term))
    );
  }
  if (category && category !== 'all') {
    filtered = filtered.filter((c) => c.category === category);
  }
  if (stream && stream !== 'all') {
    filtered = filtered.filter((c) => matchesClassStream(c, stream));
  }
  if (demand && demand !== 'all') {
    filtered = filtered.filter((c) => (c.demand || '').toLowerCase() === demand.toLowerCase());
  }
  if (sort === 'salary-high') {
    filtered.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
  } else if (sort === 'salary-low') {
    filtered.sort((a, b) => (a.salaryMin || 0) - (b.salaryMin || 0));
  } else if (sort === 'title') {
    filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else if (sort === 'demand') {
    const rank = { 'Very High': 4, High: 3, Growing: 2, Stable: 1 };
    filtered.sort((a, b) => (rank[b.demand] || 0) - (rank[a.demand] || 0));
  } else {
    filtered = spreadSimilarCareers(filtered);
  }

  return filtered;
}

export function queryCareers({ q, category, stream, demand, sort, page = 1, limit = 24 } = {}) {
  const data = loadCareersData();
  const all = data.careers || [];
  const list = filterCareersList(all, { q, category, stream, demand, sort });

  const p = Math.max(1, parseInt(page, 10));
  const l = Math.min(96, Math.max(12, parseInt(limit, 10)));
  const start = (p - 1) * l;
  const categories = data.categories?.length
    ? data.categories
    : [...new Set(all.map((c) => c.category))].sort();
  const streams = CLASS_11_STREAM_VALUES;
  const demands = [...new Set(all.map((c) => c.demand).filter(Boolean))].sort();

  return {
    total: list.length,
    page: p,
    limit: l,
    pages: Math.ceil(list.length / l) || 1,
    categories,
    streams,
    demands,
    careers: list.slice(start, start + l).map(({ description, ...rest }) => ({
      ...rest,
      outlook: rest.outlook || 'Growing',
      salaryDisplay: rest.salaryDisplay || rest.salaryRange || 'Varies',
      demand: rest.demand || 'High',
    })),
  };
}

export function getCareerBySlug(slug) {
  const data = loadCareersData();
  const career = data.slugIndex?.get(slug) || (data.careers || []).find((c) => c.slug === slug);
  if (!career) return null;
  const related = data.careers
    .filter((c) => c.category === career.category && c.id !== career.id)
    .slice(0, 6);
  return { career, related };
}
