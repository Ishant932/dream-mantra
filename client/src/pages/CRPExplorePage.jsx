import GuidanceCTA from '../components/GuidanceCTA';
import GuidanceLink from '../components/GuidanceLink';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import PageHero from '../components/PageHero';
import CRPAdditionalHighlights from '../components/CRPAdditionalHighlights';
import { useLang } from '../context/LanguageContext';
import { IMAGES } from '../data/content';
import {
  fadeUp,
  statIcons,
  SessionTopics,
  CRPStatsStrip,
  CRPCrossNav,
} from '../components/crp/crpShared';

export default function CRPExplorePage({ compact = false }) {
  const { d } = useLang();
  const crp = d('pages.crp');
  const crpProgram = d('data.crpProgram');
  const statItems = crp.statItems.map((s, i) => ({ ...s, icon: statIcons[i] }));
  const sessionGroups = useMemo(
    () => (crp.sessions.groups || []).map((group) => ({
      ...group,
      sessions: crpProgram.sessions.filter((s) => group.sessionNumbers.includes(s.number)),
    })),
    [crp.sessions.groups, crpProgram.sessions],
  );

  const body = (
    <section className={compact ? 'crp-launchpad' : 'py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
      {!compact && <CRPCrossNav explore={crp.explore.nav} current="explore" />}

      <motion.div
        {...fadeUp}
        className={compact ? 'crp-launchpad__intro' : 'text-center max-w-3xl mx-auto mb-16 px-4'}
      >
        {compact ? (
          <div className="crp-launchpad__rocket" aria-hidden>
            <span>🚀</span>
          </div>
        ) : null}
        <div className={compact ? 'crp-launchpad__intro-copy' : ''}>
          {!compact && crp.badge ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-800 font-semibold text-sm px-5 py-2.5 mb-6">
              <Sparkles className="w-4 h-4" /> {crp.badge}
            </span>
          ) : null}
          {compact ? (
            <>
              <h2 className="crp-launchpad__heading">
                AI Career Launchpad
                <br />
                Job Ready Accelerator
              </h2>
              <p className="crp-launchpad__intro-sub">
                Practical training. Real skills. Career clarity.
                <br />
                Everything you need to get job-ready.
              </p>
            </>
          ) : (
            <>
              <h2 className="section-title mb-5">{crpProgram.fullName}</h2>
              {crpProgram.description ? (
                <p className="text-lg text-theme-body leading-relaxed">{crpProgram.description}</p>
              ) : null}
            </>
          )}
        </div>
        <div className={compact ? 'crp-launchpad__meta' : 'flex flex-wrap justify-center gap-3 mt-10'}>
          <motion.span
            className={compact ? 'crp-launchpad__chip' : 'flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-50 text-amber-700 font-semibold shadow-sm'}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            whileHover={{ y: -3, scale: 1.02 }}
          >
            <Clock className="w-4 h-4" /> {crpProgram.duration}
          </motion.span>
          {(crp.statItems || [])
            .slice(compact ? 1 : 0, compact ? 4 : 3)
            .map((s, i) => (
            <motion.span
              key={s.label}
              className={compact ? 'crp-launchpad__chip crp-launchpad__chip--soft' : 'hidden'}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.06 }}
              whileHover={{ y: -3, scale: 1.02 }}
            >
              <strong>{s.label}</strong>
              <span>{s.sub}</span>
            </motion.span>
          ))}
        </div>
      </motion.div>

      <div id="sessions" className={compact ? 'crp-launchpad__sprints' : 'space-y-12 lg:space-y-16 mb-16 scroll-mt-28 pt-4'}>
        <div className={compact ? 'crp-launchpad__section-head' : 'text-center mb-4'}>
          <h2 className={compact ? 'crp-launchpad__section-title' : 'section-title'}>
            {crp.sessions.title}{' '}
            <span className="gradient-text">{crp.sessions.titleHighlight}</span>
          </h2>
          {crp.sessions.subtitle ? (
            <p className="text-theme-muted mt-3 max-w-xl mx-auto">{crp.sessions.subtitle}</p>
          ) : null}
        </div>

        <div className={compact ? 'crp-sprint-rail' : ''}>
          {compact ? (
            <div className="crp-roadmap">
              <div className="crp-roadmap__grid">
                {crpProgram.sessions.map((session, i) => (
                  <SessionTopics
                    key={session.number}
                    session={session}
                    sessionLabel={crp.sessions.sessionLabel}
                    variant="roadmap"
                    index={i}
                  />
                ))}
              </div>
            </div>
          ) : (
            sessionGroups.map((group, gi) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: gi * 0.06 }}
                className={`flex flex-col lg:flex-row gap-10 lg:gap-14 items-stretch ${gi % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className="lg:w-1/3 flex items-center justify-center">
                  <motion.div
                    className="crp-session-badge w-full max-w-xs aspect-square rounded-3xl bg-gradient-to-br from-amber-600 to-orange-500 flex flex-col items-center justify-center text-amber-50 shadow-2xl text-center px-4"
                    initial={{ opacity: 0, scale: 0.82, rotate: -4 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ type: 'spring', stiffness: 220, damping: 18, delay: gi * 0.05 }}
                    whileHover={{ scale: 1.04, y: -4 }}
                  >
                    <motion.span
                      className="text-6xl mb-3"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: gi * 0.2 }}
                    >
                      {group.icon}
                    </motion.span>
                    <span className="font-display text-xl font-bold">{group.title}</span>
                    <span className="text-sm opacity-90 mt-2">{group.subtitle}</span>
                    <span className="font-bold text-lg mt-3">{group.duration}</span>
                  </motion.div>
                </div>
                <div className="lg:w-2/3 space-y-6">
                  {group.sessions.map((session) => (
                    <SessionTopics
                      key={session.number}
                      session={session}
                      sessionLabel={crp.sessions.sessionLabel}
                      variant="default"
                    />
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <div id="highlights">
        <CRPAdditionalHighlights compact={compact} />
      </div>

      <motion.div {...fadeUp} className={compact ? 'crp-launchpad__outcomes' : 'mb-16'} id="outcomes">
        <div className={compact ? 'crp-launchpad__section-head' : 'text-center mb-3'}>
          <h3 className={compact ? 'crp-launchpad__section-title' : 'section-title mb-3 text-center'}>{crp.outcomes.title}</h3>
        </div>
        {crp.outcomes.subtitle ? (
          <p className="text-center text-theme-muted max-w-2xl mx-auto mb-8 text-sm md:text-base">{crp.outcomes.subtitle}</p>
        ) : null}
        {compact ? (
          <ul className="crp-outcomes-cards">
            {(crpProgram.outcomes || []).map((o, i) => {
              const item = typeof o === 'string' ? { title: o, desc: '' } : o;
              const figures = ['📄', '🎤', '💰', '🏢', '✨', '🎯', '🗺️', '🤝'];
              return (
                <motion.li
                  key={item.title}
                  className="crp-outcomes-cards__item"
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
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
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {(crpProgram.outcomes || []).map((o, i) => {
              const item = typeof o === 'string' ? { title: o, desc: '' } : o;
              return (
                <motion.li
                  key={item.title}
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 280, damping: 22 }}
                  whileHover={{ y: -3, scale: 1.015 }}
                  className="flex gap-3 text-theme-body infigon-card p-4 glow-card"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#FF6B4A] shrink-0" />
                  <span>
                    <span className="font-medium text-sm block">{item.title}</span>
                  </span>
                </motion.li>
              );
            })}
          </ul>
        )}
      </motion.div>

      <motion.div {...fadeUp} className={compact ? 'crp-launchpad__cta' : 'infigon-card p-10 lg:p-12 text-center bg-gradient-to-br from-amber-50 to-orange-50 glow-card'}>
        {compact ? (
          <>
            <div className="crp-launchpad__cta-visual crp-launchpad__cta-visual--left" aria-hidden>
              <img src="/images/crp/crp-cta-students.png?v=2" alt="" loading="lazy" />
            </div>
            <div className="crp-launchpad__cta-copy">
              <h4 className="crp-launchpad__cta-title">
                {crp.explore.footerTitle}{' '}
                <span className="crp-launchpad__cta-accent">{crp.explore.footerAccent || 'preparation.'}</span>
              </h4>
              {crp.explore.footerMeta ? (
                <p className="crp-launchpad__cta-meta">{crp.explore.footerMeta}</p>
              ) : null}
              {crp.explore.footerDesc ? (
                <p className="crp-launchpad__cta-desc">{crp.explore.footerDesc}</p>
              ) : null}
              <div className="crp-launchpad__cta-actions">
                <GuidanceCTA className="crp-studio__btn crp-studio__btn--primary">
                  {crp.explore.cta} <ArrowRight className="w-5 h-5" />
                </GuidanceCTA>
                <Link to="/signup" className="crp-studio__btn crp-studio__btn--ghost-dark">
                  {d('freeGuidance')?.login || 'Sign in to know more'} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="crp-launchpad__cta-visual crp-launchpad__cta-visual--right" aria-hidden>
              <img src="/images/crp/crp-cta-growth.png?v=2" alt="" loading="lazy" />
            </div>
          </>
        ) : (
          <>
            <div className="crp-launchpad__cta-copy">
              <h4 className="font-display text-xl font-bold mb-4">{crp.explore.footerTitle}</h4>
              {crp.explore.footerDesc ? (
                <p className="text-theme-muted mb-6 max-w-xl mx-auto">{crp.explore.footerDesc}</p>
              ) : null}
            </div>
            <div className="crp-launchpad__cta-actions">
              <GuidanceCTA className="btn-primary inline-flex">
                {crp.explore.cta} <ArrowRight className="w-5 h-5" />
              </GuidanceCTA>
              <Link to="/signup" className="block mt-4 text-sm font-semibold text-amber-700 hover:underline">
                {d('freeGuidance')?.login || 'Sign in to know more'}
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </section>
  );

  if (compact) return body;

  return (
    <>
      <PageHero
        title={crp.explore.title}
        subtitle={crp.explore.subtitle}
        image={IMAGES.professional}
        cta={crp.explore.cta}
        ctaLink="/contact#guidance"
      />
      <CRPStatsStrip statItems={statItems} />
      {body}
    </>
  );
}
