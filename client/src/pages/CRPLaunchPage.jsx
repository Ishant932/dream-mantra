import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock, Users } from 'lucide-react';
import PageHero from '../components/PageHero';
import SubTabs from '../components/SubTabs';
import { useLang } from '../context/LanguageContext';
import { IMAGES } from '../data/content';
import CRPAudiencePanel from '../components/CRPAudiencePanel';
import {
  fadeUp,
  staggerContainer,
  statIcons,
  CRPStatsStrip,
  CRPCrossNav,
} from '../components/crp/crpShared';

export default function CRPLaunchPage() {
  const { d } = useLang();
  const crp = d('pages.crp');
  const crpProgram = d('data.crpProgram');
  const crpAudienceTabs = d('data.crpAudienceTabs');
  const statItems = crp.statItems.map((s, i) => ({ ...s, icon: statIcons[i] }));
  const location = useLocation();
  const activeTab = new URLSearchParams(location.search).get('tab') || 'college-students';
  const activeAudience = crpAudienceTabs.find((t) => t.id === activeTab) || crpAudienceTabs[0];

  return (
    <>
      <PageHero
        title={crp.launch.title}
        subtitle={crp.launch.subtitle}
        image={IMAGES.crp}
        cta={crp.launch.cta}
        ctaLink="/contact"
      />

      <CRPStatsStrip statItems={statItems} />

      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CRPCrossNav explore={crp.explore.nav} current="launch" />

        <div id="programs" className="scroll-mt-28 mb-12">
          <SubTabs tabs={crpAudienceTabs} defaultTab="college-students" id="crp-audience">
            {(tab) => {
              const audience = crpAudienceTabs.find((t) => t.id === tab) || crpAudienceTabs[0];
              return (
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="px-2"
                >
                  <div className="text-center mb-8">
                    <span className="text-3xl mb-2 block" aria-hidden="true">{audience.icon}</span>
                    <h3 className="font-display text-xl font-bold text-theme-primary">{audience.label}</h3>
                    <p className="text-sm text-theme-muted mt-1">{audience.desc}</p>
                  </div>
                  <CRPAudiencePanel audience={audience} />
                </motion.div>
              );
            }}
          </SubTabs>
        </div>

        <motion.div
          {...fadeUp}
          className="text-center max-w-3xl mx-auto mb-16 px-4"
        >
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
            <motion.span
              variants={fadeUp}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 text-white font-semibold shadow-md"
            >
              <Users className="w-5 h-5" /> {crp.forAudiencePrefix} {activeAudience.label}
            </motion.span>
          </motion.div>
          <Link
            to="/crp/explore"
            className="inline-flex items-center gap-2 mt-8 text-amber-600 font-semibold hover:gap-3 transition-all"
          >
            {crp.launch.exploreLink} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Outcomes */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16"
          id="outcomes"
        >
          <h3 className="section-title mb-3 text-center">{crp.outcomes.title}</h3>
          <p className="text-center text-theme-muted max-w-2xl mx-auto mb-8 text-sm md:text-base">{crp.outcomes.subtitle}</p>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {crpProgram.outcomes.map((o, i) => (
              <motion.li
                key={o}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                className="flex gap-3 text-theme-body infigon-card p-4 glow-card text-sm"
              >
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="font-medium">{o}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          {...fadeUp}
          whileHover={{ scale: 1.01 }}
          className="infigon-card p-10 mb-16 text-center bg-gradient-to-br from-amber-50 to-orange-50 glow-card relative overflow-hidden max-w-2xl mx-auto"
        >
          <h4 className="font-display text-xl font-bold mb-4 text-theme-primary">{crp.ctaCard.title}</h4>
          <p className="text-theme-muted mb-6">{crp.ctaCard.desc}</p>
          <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
            {crp.ctaCard.button} <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/pillars" className="block mt-4 text-amber-600 font-semibold hover:underline">
            {crp.ctaCard.seePillars}
          </Link>
          <Link to="/crp/explore" className="block mt-3 text-sm text-theme-muted hover:text-amber-600">
            {crp.launch.exploreLink}
          </Link>
        </motion.div>
      </section>
    </>
  );
}
