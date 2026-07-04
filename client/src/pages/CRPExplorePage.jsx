import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import PageHero from '../components/PageHero';
import CRPParameters from '../components/CRPParameters';
import CRPAdditionalHighlights from '../components/CRPAdditionalHighlights';
import { useLang } from '../context/LanguageContext';
import { IMAGES } from '../data/content';
import {
  fadeUp,
  staggerContainer,
  statIcons,
  SessionTopics,
  CRPStatsStrip,
  CRPCrossNav,
} from '../components/crp/crpShared';

export default function CRPExplorePage() {
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

  return (
    <>
      <PageHero
        title={crp.explore.title}
        subtitle={crp.explore.subtitle}
        image={IMAGES.professional}
        cta={crp.explore.cta}
        ctaLink="/crp/launch"
      />

      <CRPStatsStrip statItems={statItems} />

      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CRPCrossNav explore={crp.explore.nav} current="explore" />

        {/* AI Launch Blueprint */}
        <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-16 px-4">
          <motion.span
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-sm mb-6"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4" /> {crp.badge}
          </motion.span>
          <h2 className="section-title mb-5">{crpProgram.fullName}</h2>
          <p className="text-lg text-theme-body leading-relaxed">{crpProgram.description}</p>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mt-10"
          >
            <motion.span
              variants={fadeUp}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-50 text-amber-700 font-semibold shadow-sm"
            >
              <Clock className="w-5 h-5" /> {crpProgram.duration}
            </motion.span>
          </motion.div>
        </motion.div>

        {/* 5 AI Skill Sprints */}
        <div id="sessions" className="space-y-12 lg:space-y-16 mb-16 scroll-mt-28 pt-4">
          <motion.div {...fadeUp} className="text-center mb-4">
            <h2 className="section-title">
              {crp.sessions.title}{' '}
              <span className="gradient-text">{crp.sessions.titleHighlight}</span>
            </h2>
            <p className="text-theme-muted mt-3 max-w-xl mx-auto">{crp.sessions.subtitle}</p>
          </motion.div>

          {sessionGroups.map((group, gi) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, x: gi % 2 === 0 ? -50 : 50, rotateY: gi % 2 === 0 ? -4 : 4 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.65, delay: gi * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`flex flex-col lg:flex-row gap-10 lg:gap-14 items-stretch ${gi % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
            >
              <div className="lg:w-1/3 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.06, rotate: gi % 2 === 0 ? 3 : -3 }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ y: { duration: 4 + gi * 0.5, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: 0.3 } }}
                  className="crp-session-badge w-full max-w-xs aspect-square rounded-3xl bg-gradient-to-br from-amber-600 to-orange-500 flex flex-col items-center justify-center text-amber-50 shadow-2xl shadow-amber-500/30 relative overflow-hidden text-center px-4"
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  />
                  <span className="text-6xl mb-3 relative z-10">{group.icon}</span>
                  <span className="font-display text-xl font-bold relative z-10 leading-tight">{group.title}</span>
                  <span className="text-sm opacity-90 mt-2 relative z-10">{group.subtitle}</span>
                  <span className="font-bold text-lg mt-3 relative z-10">{group.duration}</span>
                </motion.div>
              </div>
              <div className="lg:w-2/3 space-y-6">
                {group.sessions.map((session) => (
                  <motion.div key={session.number} whileHover={{ y: -4 }} transition={{ duration: 0.25 }}>
                    <SessionTopics session={session} sessionLabel={crp.sessions.sessionLabel} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div id="highlights">
          <CRPAdditionalHighlights />
        </div>

        <div id="parameters">
          <CRPParameters />
        </div>

        {/* Outcomes — expanded */}
        <motion.div {...fadeUp} className="mb-16" id="outcomes">
          <h3 className="section-title mb-3 text-center">{crp.outcomes.title}</h3>
          <p className="text-center text-theme-muted max-w-2xl mx-auto mb-8 text-sm md:text-base">{crp.outcomes.subtitle}</p>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {crpProgram.outcomes.map((o, i) => (
              <motion.li
                key={o}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="flex gap-3 text-theme-body infigon-card p-4 glow-card"
              >
                <CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0" />
                <span className="font-medium text-sm">{o}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          {...fadeUp}
          className="infigon-card p-10 lg:p-12 text-center bg-gradient-to-br from-amber-50 to-orange-50 glow-card"
        >
          <h4 className="font-display text-xl font-bold mb-4">{crp.explore.footerTitle}</h4>
          <p className="text-theme-muted mb-6 max-w-xl mx-auto">{crp.explore.footerDesc}</p>
          <Link to="/crp/launch" className="btn-primary inline-flex">
            {crp.explore.cta} <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
    </>
  );
}
