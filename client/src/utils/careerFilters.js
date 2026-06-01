/** Filter + query careers — shared logic shape for API and client */
import { CLASS_11_STREAM_VALUES, matchesClassStream } from './careerStreams.js';

export { CLASS_11_STREAMS, CLASS_11_STREAM_VALUES } from './careerStreams.js';
export function filterCareersList(list, { q, category, stream, demand, sort } = {}) {
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
  }

  return filtered;
}

export function buildCareerQueryParams({ q, category, stream, demand, sort, page = 1, limit = 24 } = {}) {
  const params = { page: String(page), limit: String(limit) };
  const term = (q || '').trim();
  if (term) params.q = term;
  if (category && category !== 'all') params.category = category;
  if (stream && stream !== 'all') params.stream = stream;
  if (demand && demand !== 'all') params.demand = demand;
  if (sort && sort !== 'default') params.sort = sort;
  return params;
}

export function hasActiveCareerFilters({ q, category, stream, demand, sort } = {}) {
  return Boolean(
    (q || '').trim() ||
    (category && category !== 'all') ||
    (stream && stream !== 'all') ||
    (demand && demand !== 'all') ||
    (sort && sort !== 'default')
  );
}

export function paginateCareers(list, { page = 1, limit = 24 } = {}) {
  const p = Math.max(1, parseInt(page, 10));
  const l = Math.min(96, Math.max(12, parseInt(limit, 10)));
  const start = (p - 1) * l;
  return {
    total: list.length,
    page: p,
    limit: l,
    pages: Math.ceil(list.length / l) || 1,
    careers: list.slice(start, start + l).map(({ description, ...rest }) => ({
      ...rest,
      outlook: rest.outlook || 'Growing',
      salaryDisplay: rest.salaryDisplay || rest.salaryRange || 'Varies',
      demand: rest.demand || 'High',
    })),
  };
}

export function getCareerFacets(careers = []) {
  return {
    categories: [...new Set(careers.map((c) => c.category).filter(Boolean))].sort(),
    streams: CLASS_11_STREAM_VALUES,
    demands: [...new Set(careers.map((c) => c.demand).filter(Boolean))].sort(),
  };
}
