import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Briefcase, ChevronLeft, ChevronRight, Bookmark,
  Sparkles, X, SlidersHorizontal, TrendingUp, ArrowUpDown,
} from 'lucide-react';
import {
  buildCareerQueryParams,
  CLASS_11_STREAMS,
} from '../utils/careerFilters';
import { loadCareersLocal, prefetchCareers } from '../utils/loadCareers';

const SORT_OPTIONS = [
  { value: 'default', label: 'Relevance' },
  { value: 'demand', label: 'Highest Demand' },
  { value: 'salary-high', label: 'Salary: High to Low' },
  { value: 'salary-low', label: 'Salary: Low to High' },
  { value: 'title', label: 'A → Z' },
];

const PAGE_SIZES = [24, 48, 96];

const EMPTY_FACETS = { categories: [], streams: [], demands: [] };

async function fetchCareerResults(params) {
  return loadCareersLocal(params);
}

export default function CareerLibraryExplorer({
  savedCareers = [],
  onSaveCareer,
  showHeader = true,
  embedded = false,
  initialStream = null,
}) {
  const [facets, setFacets] = useState(EMPTY_FACETS);
  const [data, setData] = useState({ careers: [], total: 0, pages: 1, page: 1, limit: 24 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [stream, setStream] = useState(initialStream || 'all');
  const [demand, setDemand] = useState('all');
  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(embedded ? 48 : 24);
  const [filtersOpen, setFiltersOpen] = useState(embedded);

  const activeFilters = [category, stream, demand, sort].filter((v) => v && v !== 'all' && v !== 'default').length;

  useEffect(() => {
    prefetchCareers();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const seed = await loadCareersLocal({ page: 1, limit: 1 });
        if (!cancelled) {
          setFacets({
            categories: seed.categories || [],
            streams: seed.streams || [],
            demands: seed.demands || [],
          });
        }
      } catch {
        /* facets stay empty until first successful load */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = buildCareerQueryParams({ q: query, category, stream, demand, sort, page, limit });
    try {
      const res = await fetchCareerResults(params);
      setData(res);
    } catch {
      setData({ careers: [], total: 0, pages: 1, page, limit });
    } finally {
      setLoading(false);
    }
  }, [query, category, stream, demand, sort, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(search.trim());
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setQuery('');
    setCategory('all');
    setStream('all');
    setDemand('all');
    setSort('default');
    setPage(1);
  };

  const filterBarClass = embedded
    ? 'career-lib-toolbar career-lib-toolbar--embedded'
    : 'career-lib-toolbar career-lib-toolbar--standalone sticky top-[calc(var(--site-header-h,4.5rem)+0.75rem)] z-20';

  const showFilterPanel = embedded || filtersOpen;

  const categoryPills = (
    <div className="career-lib-tabs" role="tablist" aria-label="Career categories">
      <button
        type="button"
        role="tab"
        aria-selected={category === 'all'}
        onClick={() => { setCategory('all'); setPage(1); }}
        className={`career-lib-tab ${category === 'all' ? 'career-lib-tab--active' : ''}`}
      >
        All
      </button>
      {facets.categories.map((c) => (
        <button
          key={c}
          type="button"
          role="tab"
          aria-selected={category === c}
          onClick={() => { setCategory(c); setPage(1); }}
          title={c}
          className={`career-lib-tab ${category === c ? 'career-lib-tab--active' : ''}`}
        >
          {c}
        </button>
      ))}
    </div>
  );

  const streamPills = (
    <div className="career-lib-tabs career-lib-tabs--streams" role="tablist" aria-label="Class 11+ streams">
      <button
        type="button"
        role="tab"
        aria-selected={stream === 'all'}
        onClick={() => { setStream('all'); setPage(1); }}
        className={`career-lib-tab career-lib-tab--stream ${stream === 'all' ? 'career-lib-tab--active' : ''}`}
      >
        All streams
      </button>
      {CLASS_11_STREAMS.map((s) => (
        <button
          key={s.value}
          type="button"
          role="tab"
          aria-selected={stream === s.value}
          onClick={() => { setStream(s.value); setPage(1); }}
          title={s.label}
          className={`career-lib-tab career-lib-tab--stream ${stream === s.value ? 'career-lib-tab--active' : ''}`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className={`career-lib-root ${embedded ? 'career-lib-root--embedded' : ''}`}>
      {showHeader && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex flex-wrap items-center justify-between gap-3 ${embedded ? 'mb-2' : 'mb-6'}`}
        >
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
              <Sparkles className="w-6 h-6 text-amber-600" />
              Career Library
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Search, filter &amp; bookmark careers — full database access
            </p>
          </div>
          <motion.span
            key={data.total}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-amber-50 text-sm font-bold shadow-lg shadow-amber-500/25"
          >
            {data.total || 950} careers
          </motion.span>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={filterBarClass}
      >
        <div className="career-lib-toolbar-inner">
          {embedded && (
            <div className="career-lib-tabs-section">
              <p className="career-lib-section-label">Filter by stream (Class 11+)</p>
              <div className="career-lib-tabs-scroll">
                {streamPills}
              </div>
            </div>
          )}

          {embedded && (
            <div className="career-lib-tabs-section">
              <p className="career-lib-section-label">Browse by category</p>
              <div className="career-lib-tabs-scroll">
                {categoryPills}
              </div>
            </div>
          )}

          <form onSubmit={handleSearch} className="career-lib-search-row">
            <div className="relative flex-1 group career-lib-search-wrap">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${query ? 'text-amber-600' : 'text-sand-400 group-focus-within:text-amber-600'}`} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, skills, exams, employers..."
                className="input-field pl-12 pr-10 !rounded-xl border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 w-full"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-sand-400 hover:text-sand-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="career-lib-search-actions">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary !rounded-xl px-6 sm:px-8 flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" /> Search
              </motion.button>
              {!embedded && (
                <button
                  type="button"
                  onClick={() => setFiltersOpen((v) => !v)}
                  className={`btn-outline !rounded-xl flex items-center gap-2 ${filtersOpen ? 'border-amber-500 text-amber-700 bg-amber-50' : ''}`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilters > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-amber-50 text-xs flex items-center justify-center">{activeFilters}</span>
                  )}
                </button>
              )}
            </div>
          </form>

          <AnimatePresence initial={false}>
            {showFilterPanel && (
              <motion.div
                initial={embedded ? false : { height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="career-lib-filters-panel"
              >
                <div className="career-lib-filters-grid">
                  <div className="career-lib-filter-field">
                    <label className="career-lib-filter-label">
                      <Filter className="w-3 h-3" /> Category
                    </label>
                    <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="input-field !py-2 !text-sm !rounded-xl w-full">
                      <option value="all">All categories ({facets.categories.length})</option>
                      {facets.categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="career-lib-filter-field">
                    <label className="career-lib-filter-label">
                      <Briefcase className="w-3 h-3" /> Stream
                    </label>
                    <select value={stream} onChange={(e) => { setStream(e.target.value); setPage(1); }} className="input-field !py-2 !text-sm !rounded-xl w-full">
                      <option value="all">All streams (Class 11+)</option>
                      {CLASS_11_STREAMS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="career-lib-filter-field">
                    <label className="career-lib-filter-label">
                      <TrendingUp className="w-3 h-3" /> Demand
                    </label>
                    <select value={demand} onChange={(e) => { setDemand(e.target.value); setPage(1); }} className="input-field !py-2 !text-sm !rounded-xl w-full">
                      <option value="all">All demand levels</option>
                      {facets.demands.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="career-lib-filter-field">
                    <label className="career-lib-filter-label">
                      <ArrowUpDown className="w-3 h-3" /> Sort by
                    </label>
                    <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="input-field !py-2 !text-sm !rounded-xl w-full">
                      {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="career-lib-filters-meta">
                  <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="input-field !py-1.5 !px-3 !text-sm !rounded-lg w-auto">
                    {PAGE_SIZES.map((n) => <option key={n} value={n}>{n} per page</option>)}
                  </select>
                  {(activeFilters > 0 || query) && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={clearFilters}
                      className="text-sm text-amber-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Clear all filters
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {(activeFilters > 0 || query) && (
            <div className="career-lib-chips">
              {query && (
                <span className="career-lib-chip">
                  Search: {query}
                  <button type="button" onClick={() => { setSearch(''); setQuery(''); setPage(1); }} aria-label="Clear search"><X className="w-3 h-3" /></button>
                </span>
              )}
              {category !== 'all' && (
                <span className="career-lib-chip">
                  {category}
                  <button type="button" onClick={() => { setCategory('all'); setPage(1); }} aria-label="Clear category"><X className="w-3 h-3" /></button>
                </span>
              )}
              {stream !== 'all' && (
                <span className="career-lib-chip">
                  {CLASS_11_STREAMS.find((s) => s.value === stream)?.label || stream}
                  <button type="button" onClick={() => { setStream('all'); setPage(1); }} aria-label="Clear stream"><X className="w-3 h-3" /></button>
                </span>
              )}
              {demand !== 'all' && (
                <span className="career-lib-chip">
                  Demand: {demand}
                  <button type="button" onClick={() => { setDemand('all'); setPage(1); }} aria-label="Clear demand"><X className="w-3 h-3" /></button>
                </span>
              )}
              {sort !== 'default' && (
                <span className="career-lib-chip">
                  Sort: {SORT_OPTIONS.find((o) => o.value === sort)?.label}
                  <button type="button" onClick={() => { setSort('default'); setPage(1); }} aria-label="Clear sort"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {!embedded && (
            <div className="career-lib-tabs-section">
              <p className="career-lib-section-label">Filter by stream (Class 11+)</p>
              <div className="career-lib-tabs-scroll">
                {streamPills}
              </div>
            </div>
          )}

          {!embedded && (
            <div className="career-lib-tabs-section">
              <p className="career-lib-section-label">Browse by category</p>
              <div className="career-lib-tabs-scroll">
                {categoryPills}
              </div>
            </div>
          )}

          <p className="career-lib-results-meta">
            Showing <strong>{data.careers?.length || 0}</strong> of{' '}
            <strong>{data.total || 950}</strong> careers
            {query && <> matching &ldquo;{query}&rdquo;</>}
            {data.pages > 1 && <> · Page {page} of {data.pages}</>}
          </p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {[...Array(Math.min(limit, 12))].map((_, i) => (
              <div
                key={i}
                className="h-56 rounded-2xl bg-gradient-to-br from-amber-100 to-sand-100 dark:from-sand-800 dark:to-sand-700 animate-pulse"
              />
            ))}
          </motion.div>
        ) : data.careers?.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 career-lib-card"
          >
            <Briefcase className="w-12 h-12 text-sand-300 mx-auto mb-4" />
            <p className="text-sand-600 dark:text-[var(--text-secondary)] mb-4">No careers match your filters.</p>
            <button type="button" onClick={clearFilters} className="btn-outline">Clear filters</button>
          </motion.div>
        ) : (
          <motion.div
            key={`${page}-${query}-${category}-${stream}-${demand}-${sort}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {data.careers.map((c, i) => {
              const saved = savedCareers.some((s) => s.slug === c.slug);
              return (
                <motion.article
                  key={c.slug || c.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.35) }}
                  className="career-lib-card group"
                >
                  <button
                    type="button"
                    onClick={() => onSaveCareer?.(c)}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-xl transition ${
                      saved ? 'text-amber-600 bg-amber-100 shadow-sm' : 'text-sand-400 hover:text-amber-600 hover:bg-amber-50'
                    }`}
                    aria-label="Save career"
                  >
                    <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                  </button>
                  <Link to={`/careers/${c.slug}`} className="block h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-amber-50 shadow-md">
                        <Briefcase className="w-4 h-4" />
                      </span>
                      <span className="career-lib-card__demand">
                        {c.demand || 'High'}
                      </span>
                    </div>
                    <p className="career-lib-card__category">{c.category}</p>
                    <h3 className="career-lib-card__title group-hover:text-amber-700 dark:group-hover:text-amber-300 transition pr-8 line-clamp-2 mt-0.5">
                      {c.title}
                    </h3>
                    <p className="career-lib-card__desc line-clamp-3">
                      {c.shortDescription}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="career-lib-tag">{c.salaryDisplay || 'Salary varies'}</span>
                      <span className="career-lib-tag career-lib-tag--accent">Demand: {c.demand || c.outlook || 'High'}</span>
                      {((c.classStreams?.length ? c.classStreams : c.stream) || [])
                        .filter((s) => s !== 'PCMB')
                        .slice(0, 4)
                        .length > 0 && (
                        <span className="career-lib-tag">
                          Stream: {(c.classStreams?.length ? c.classStreams : c.stream)
                            .filter((s) => s !== 'PCMB')
                            .slice(0, 4)
                            .join(' · ')}
                        </span>
                      )}
                    </div>
                    <p className="career-lib-card__link group-hover:underline">
                      View roadmap &amp; details →
                    </p>
                  </Link>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {data.pages > 1 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-10"
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="p-3 rounded-xl border border-amber-200 disabled:opacity-40 hover:bg-amber-50 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1 flex-wrap justify-center">
            {[...Array(Math.min(data.pages, 7))].map((_, i) => {
              let pageNum;
              if (data.pages <= 7) pageNum = i + 1;
              else if (page <= 4) pageNum = i + 1;
              else if (page >= data.pages - 3) pageNum = data.pages - 6 + i;
              else pageNum = page - 3 + i;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition ${
                    page === pageNum
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-amber-50 shadow-lg'
                      : 'hover:bg-amber-50 text-sand-600 dark:text-[var(--text-secondary)]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
            className="p-3 rounded-xl border border-amber-200 disabled:opacity-40 hover:bg-amber-50 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
