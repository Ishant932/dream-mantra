/** Load careers from static JSON — cached in memory for fast filtering */
import { filterCareersList, paginateCareers, getCareerFacets } from './careerFilters';

let careersCache = null;
let careersPromise = null;

async function getCareersRaw() {
  if (careersCache) return careersCache;
  if (!careersPromise) {
    careersPromise = fetch('/data/careers.json')
      .then((r) => {
        if (!r.ok) throw new Error('Careers data not found');
        return r.json();
      })
      .then((raw) => {
        careersCache = raw;
        return raw;
      })
      .catch((err) => {
        careersPromise = null;
        throw err;
      });
  }
  return careersPromise;
}

/** Prefetch careers JSON — call on app/dashboard mount for faster first filter */
export function prefetchCareers() {
  return getCareersRaw().catch(() => null);
}

export async function loadCareersLocal(params = {}) {
  const raw = await getCareersRaw();
  const all = raw.careers || [];
  const { q, category, stream, demand, sort, page = 1, limit = 24 } = params;
  const filtered = filterCareersList(all, { q, category, stream, demand, sort });
  const facets = getCareerFacets(all);
  const paged = paginateCareers(filtered, { page, limit });
  return { ...paged, ...facets };
}

export function getCachedCareersCount() {
  return careersCache?.careers?.length || 0;
}

export async function getCareerBySlugLocal(slug) {
  const raw = await getCareersRaw();
  const career = (raw.careers || []).find((c) => c.slug === slug);
  if (!career) return null;
  const related = raw.careers
    .filter((c) => c.category === career.category && c.id !== career.id)
    .slice(0, 6);
  return { career, related };
}
