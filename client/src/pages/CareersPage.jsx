import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Briefcase, Filter, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { careersApi } from '../api';
import { useLang } from '../context/LanguageContext';
import { useWhatsAppAgentLink } from '../hooks/useWhatsAppAgentLink';

function WhatsAppIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function CareersPage() {
  const { t } = useLang();
  const waHref = useWhatsAppAgentLink();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const [data, setData] = useState({ careers: [], total: 0, pages: 1, categories: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const category = searchParams.get('category') || 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const load = useCallback(async () => {
    setLoading(true);
    const params = { q: search || undefined, category, page, limit: 24 };
    try {
      setData(await careersApi.list(params));
    } catch {
      setData({ careers: [], total: 0, pages: 1, categories: [] });
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => {
    load();
  }, [load]);

  const updateParams = (updates) => {
    const p = new URLSearchParams(location.search);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === 'all' || v === null) p.delete(k);
      else p.set(k, String(v));
    });
    const qs = p.toString();
    navigate({ pathname: location.pathname, search: qs ? `?${qs}` : '' }, { replace: true });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ q: search, page: 1 });
  };

  return (
    <div className="min-h-screen career-page-root bg-gradient-to-b from-amber-50/80 via-[var(--bg-elevated)] to-amber-50/30 dark:from-[var(--bg-base)] dark:via-[var(--bg-muted)] dark:to-[var(--bg-alt)]">
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.14),_transparent_60%)] pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-7xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" /> Dream Mantra Career Library
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold text-sand-900 dark:text-amber-50 mb-4">
            <span className="gradient-text">1300+</span> {t('careers.title')}
          </h1>
          <p className="text-lg text-sand-600 dark:text-[var(--text-secondary)] max-w-2xl mx-auto">
            {t('careers.subtitle')} — education paths, salary insights, skills &amp; exams.
          </p>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/careers/pathways"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300 hover:underline"
            >
              Explore ITI &amp; degree pathways →
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="career-wa-cta inline-flex items-center gap-2 text-sm font-semibold"
            >
              <WhatsAppIcon className="w-4 h-4" />
              Ask Esh about careers on WhatsApp
            </a>
          </p>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="career-lib-toolbar career-page-filters mb-6 sm:mb-8 p-3 sm:p-4 rounded-2xl bg-[var(--bg-elevated)]/95 backdrop-blur-xl border border-amber-100 dark:border-[rgba(201,168,76,0.25)] shadow-lg"
        >
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sand-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('careers.search')}
                className="input-field pl-12 w-full"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
              <div className="relative flex-1 min-w-0">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400" />
                <select
                  value={category}
                  onChange={(e) => updateParams({ category: e.target.value, page: 1 })}
                  className="input-field pl-10 appearance-none w-full"
                >
                  <option value="all">{t('careers.all')}</option>
                  {data.categories?.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary w-full sm:w-auto sm:px-8 shrink-0">Search</button>
            </div>
          </form>
          <p className="text-sm text-sand-600 dark:text-[var(--text-secondary)] mt-3">
            Showing {data.careers?.length || 0} of {data.total || 1300}+ opportunities
          </p>

          {data.categories?.length > 0 && (
            <div className="career-lib-tabs-section mt-4 pt-4 border-t border-amber-100 dark:border-[rgba(201,168,76,0.2)]">
              <p className="career-lib-section-label">Browse by category</p>
              <div className="career-lib-tabs-scroll">
                <div className="career-lib-tabs" role="tablist" aria-label="Career categories">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={category === 'all'}
                    onClick={() => updateParams({ category: 'all', page: 1 })}
                    className={`career-lib-tab ${category === 'all' ? 'career-lib-tab--active' : ''}`}
                  >
                    {t('careers.all')}
                  </button>
                  {data.categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      role="tab"
                      aria-selected={category === c}
                      onClick={() => updateParams({ category: c, page: 1 })}
                      title={c}
                      className={`career-lib-tab ${category === c ? 'career-lib-tab--active' : ''}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="grid career-lib-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-sand-100 dark:bg-sand-800 animate-pulse" />
            ))}
          </div>
        ) : data.careers?.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sand-600 dark:text-[var(--text-secondary)] mb-4">No careers found.</p>
            <button type="button" onClick={() => { setSearch(''); updateParams({ q: '', page: 1 }); }} className="btn-outline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid career-lib-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {data.careers.map((career, i) => (
              <motion.div
                key={career.slug || career.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/careers/${career.slug}`}
                  className="group block h-full career-lib-card"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-amber-50">
                      <Briefcase className="w-5 h-5" />
                    </span>
                    <span className="career-lib-card__demand">{career.demand || career.outlook}</span>
                  </div>
                  <h3 className="career-lib-card__title group-hover:text-amber-700 dark:group-hover:text-amber-300 transition line-clamp-2">
                    {career.title}
                  </h3>
                  <p className="career-lib-card__category mt-1">{career.category}</p>
                  <p className="career-lib-card__desc line-clamp-2">{career.shortDescription}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="career-lib-tag">{career.salaryDisplay}</span>
                    <span className="career-lib-tag career-lib-tag--accent">Demand: {career.demand || career.outlook}</span>
                    {career.stream?.length > 0 && (
                      <span className="career-lib-tag">Stream: {career.stream.filter((s) => s !== 'PCMB').join(' · ')}</span>
                    )}
                  </div>
                  <p className="career-lib-card__link group-hover:underline">View roadmap &amp; full details →</p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {data.pages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button type="button" disabled={page <= 1} onClick={() => updateParams({ page: page - 1 })} className="p-3 rounded-full border disabled:opacity-40">
              <ChevronLeft />
            </button>
            <span className="font-medium text-sand-800 dark:text-[var(--text-primary)]">Page {page} of {data.pages}</span>
            <button type="button" disabled={page >= data.pages} onClick={() => updateParams({ page: page + 1 })} className="p-3 rounded-full border disabled:opacity-40">
              <ChevronRight />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
