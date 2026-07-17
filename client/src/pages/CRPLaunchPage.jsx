import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import PageHero from '../components/PageHero';
import { useLang } from '../context/LanguageContext';
import { IMAGES } from '../data/content';
import CRPAudiencePanel from '../components/CRPAudiencePanel';
import {
  fadeUp,
  statIcons,
  CRPStatsStrip,
  CRPCrossNav,
} from '../components/crp/crpShared';

export default function CRPLaunchPage({ compact = false }) {
  const { d } = useLang();
  const crp = d('pages.crp');
  const crpProgram = d('data.crpProgram');
  const crpAudienceTabs = d('data.crpAudienceTabs');
  const statItems = crp.statItems.map((s, i) => ({ ...s, icon: statIcons[i] }));
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const activeTab =
    params.get('audience') ||
    (['college-students', 'freshers', 'working-professionals'].includes(params.get('tab'))
      ? params.get('tab')
      : null) ||
    'college-students';
  const activeAudience = crpAudienceTabs.find((t) => t.id === activeTab) || crpAudienceTabs[0];
  const audienceHref = (id) => `/crp?tab=pathways&audience=${id}`;

  const body = (
    <section className={compact ? 'crp-pathways' : 'py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
      {!compact && <CRPCrossNav explore={crp.explore.nav} current="launch" />}

      <motion.div {...fadeUp} className={compact ? 'crp-pathways__intro' : 'text-center mb-10'}>
        <h2 className={compact ? 'crp-pathways__heading' : 'section-title mb-3'}>
          Choose where you are right now
        </h2>
      </motion.div>

      <div id="programs" className={compact ? 'crp-pathways__stages' : 'scroll-mt-28 mb-12'}>
        <div className={compact ? 'crp-stage-grid' : 'flex flex-wrap justify-center gap-2 mb-8'} role="tablist" aria-label="Age pathways">
          {crpAudienceTabs.map((audience, i) => {
            const active = audience.id === activeTab;
            return (
              <motion.div
                key={audience.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                whileHover={{ y: -3 }}
              >
                <Link
                  to={audienceHref(audience.id)}
                  role="tab"
                  aria-selected={active}
                  preventScrollReset
                  className={compact
                    ? `crp-stage-card crp-stage-card--${audience.id}${active ? ' is-active' : ''}`
                    : `px-4 py-2 rounded-full text-sm font-semibold border ${active ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-stone-200'}`
                  }
                  replace
                >
                  <span className={compact ? 'crp-stage-card__icon' : ''} aria-hidden>{audience.icon}</span>
                  <span className={compact ? 'crp-stage-card__body' : ''}>
                    <span className={compact ? 'crp-stage-card__label' : ''}>{audience.label}</span>
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={compact ? 'crp-pathways__detail' : 'px-2'}
        >
          <div className={compact ? 'crp-pathways__detail-head' : 'text-center mb-8'}>
            <span className={compact ? 'crp-pathways__detail-icon' : 'text-3xl mb-2 block'} aria-hidden>
              {activeAudience.icon}
            </span>
            <h3 className={compact ? 'crp-pathways__detail-title' : 'font-display text-xl font-bold text-theme-primary'}>
              {activeAudience.label}
            </h3>
          </div>
          <CRPAudiencePanel audience={activeAudience} compact={compact} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className={compact ? 'crp-pathways__outcomes' : 'mb-16'}
        id="outcomes"
      >
        {compact ? (
          <div className="crp-pathways__outcomes-panel">
            <h3 className="crp-pathways__section-title">{crp.outcomes.title}</h3>
            {crp.outcomes.subtitle ? (
              <p className="crp-pathways__outcomes-sub">{crp.outcomes.subtitle}</p>
            ) : null}
            <ul className="crp-outcomes-cards">
              {crpProgram.outcomes.map((o, i) => {
                const item = typeof o === 'string' ? { title: o, desc: '' } : o;
                const figures = ['📄', '🎤', '💰', '🏢', '✨', '🎯', '🗺️', '🤝'];
                return (
                  <motion.li
                    key={item.title}
                    className="crp-outcomes-cards__item"
                    initial={{ opacity: 0, y: 12, scale: 0.88 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 18 }}
                    whileHover={{ y: -3 }}
                  >
                    <span className={`crp-outcomes-cards__icon crp-outcomes-cards__icon--${(i % 8) + 1}`} aria-hidden>
                      {figures[i % figures.length]}
                    </span>
                    <span className="crp-outcomes-cards__copy">
                      <strong>{item.title}</strong>
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        ) : (
          <>
            <div className="text-center mb-3">
              <h3 className="section-title mb-3 text-center">{crp.outcomes.title}</h3>
            </div>
            {crp.outcomes.subtitle ? (
              <p className="text-center text-theme-muted max-w-2xl mx-auto mb-8 text-sm md:text-base">{crp.outcomes.subtitle}</p>
            ) : null}
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {crpProgram.outcomes.map((o, i) => {
                const item = typeof o === 'string' ? { title: o, desc: '' } : o;
                return (
                <motion.li
                  key={item.title}
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 280, damping: 22 }}
                  whileHover={{ y: -3, scale: 1.015 }}
                  className="flex gap-3 text-theme-body infigon-card p-4 glow-card text-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    <span className="font-medium text-sm block">{item.title}</span>
                  </span>
                </motion.li>
              );
              })}
            </ul>
          </>
        )}
      </motion.div>

      <motion.div
        {...fadeUp}
        className={compact ? 'crp-pathways__bridge' : 'text-center max-w-3xl mx-auto mb-16 px-4'}
        whileHover={compact ? { y: -2 } : undefined}
      >
        {compact ? (
          <div className="crp-pathways__bridge-icon" aria-hidden>
            📋
          </div>
        ) : null}
        <div className={compact ? 'crp-pathways__bridge-copy' : ''}>
          <h3 className={compact ? 'crp-pathways__bridge-title' : 'section-title mb-5'}>
            Next: see the full training plan
          </h3>
          <p className={compact ? 'crp-pathways__bridge-desc' : 'text-theme-muted'}>
            Once your stage is clear, review the 5 sessions, highlights, and program outcomes.
          </p>
        </div>
        <Link
          to="/crp?tab=launchpad"
          preventScrollReset
          className={compact ? 'crp-studio__btn crp-studio__btn--primary' : 'inline-flex items-center gap-2 mt-8 text-amber-600 font-semibold'}
        >
          Open AI Career Launchpad <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      <motion.div
        {...fadeUp}
        className={compact ? 'crp-pathways__cta' : 'infigon-card p-10 text-center bg-gradient-to-br from-amber-50 to-orange-50 glow-card max-w-2xl mx-auto'}
      >
        <div className={compact ? 'crp-pathways__cta-copy' : ''}>
          <h4 className={compact ? 'crp-pathways__cta-title' : 'font-display text-xl font-bold mb-4 text-theme-primary'}>
            {crp.ctaCard.title}
          </h4>
          {crp.ctaCard.desc ? (
            <p className="text-theme-muted mb-6">{crp.ctaCard.desc}</p>
          ) : null}
          <div className={compact ? 'crp-pathways__cta-actions' : ''}>
            <Link to="/contact#guidance" className={compact ? 'crp-studio__btn crp-studio__btn--primary' : 'btn-primary inline-flex items-center gap-2'}>
              {crp.ctaCard.button} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/signup" className={compact ? 'crp-studio__btn crp-studio__btn--ghost-dark' : 'block mt-4 text-sm font-semibold text-amber-700 hover:underline'}>
              {d('freeGuidance')?.login || 'Sign in to know more'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );

  if (compact) return body;

  return (
    <>
      <PageHero
        title={crp.launch.title}
        subtitle={crp.launch.subtitle}
        image={IMAGES.crp}
        cta={crp.launch.cta}
        ctaLink="/contact#guidance"
      />
      <CRPStatsStrip statItems={statItems} />
      {body}
    </>
  );
}
