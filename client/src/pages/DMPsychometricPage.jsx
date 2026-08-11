import GuidanceCTA from '../components/GuidanceCTA';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, ArrowRight, Sparkles, Phone, GitMerge,
  Brain, Fingerprint, MessageCircle, Users, FileText,
  BarChart3, ClipboardList, Target, TrendingUp, RefreshCw,
} from 'lucide-react';
import { IMAGES } from '../data/content';
import { useLang } from '../context/LanguageContext';
import CounsellingProcessTimeline from '../components/CounsellingProcessTimeline';
import MappingHeroShowcase from '../components/MappingHeroShowcase';
import CmsPageSections from '../components/CmsPageSections';
import { cmsText, usePageCatalog } from '../hooks/usePageCatalog';

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

const STEP_ICONS = [Fingerprint, BarChart3, ClipboardList, MessageCircle];
const STEP_TONES = ['purple', 'blue', 'orange', 'green'];
const BENEFIT_ICONS = [GitMerge, Target, Users, ClipboardList, TrendingUp, RefreshCw];
const BENEFIT_TONES = ['orange', 'purple', 'green', 'blue', 'yellow', 'orange'];

export default function DMPsychometricPage({ compact = false }) {
  const { d } = useLang();
  const page = d('pages.dmitPsychometric');
  const hero = page.hero;
  const cms = usePageCatalog('combo');
  const heroTitle = cmsText(cms, 'heroTitle', hero.title);
  const heroDesc = cmsText(cms, 'intro', hero.desc);
  const steps = d('data.comboSteps');
  const compare = d('data.comboCompare');
  const benefits = d('data.comboBenefits');
  const reportIncludes = d('data.comboReportIncludes');
  const who = d('data.comboWho');

  return (
    <div className={`overflow-hidden combo-page dm-overview-tints${compact ? ' counselling-embed dm-saas' : ''}`}>
      <section className={`relative ${compact ? 'pt-0 pb-8 lg:pb-10' : 'pt-28 pb-20 lg:pt-32 lg:pb-28'} bg-gradient-to-br from-amber-50/90 via-[var(--bg-base)] to-emerald-50/40 dark:from-[#3d4a22]/30 dark:to-[var(--bg-base)]`}>
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 text-sm font-semibold mb-6">
              <GitMerge className="w-4 h-4" /> {hero.badge}
            </span>
            <h1 className="hero-title mb-4">
              <span className="gradient-text">{heroTitle}</span>
            </h1>
            <p className="text-base md:text-lg text-sand-600 dark:text-sand-300 leading-relaxed mb-4">
              {heroDesc}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup" className="btn-primary px-7 py-3.5">{hero.bookCombo}</Link>
              <GuidanceCTA className="btn-outline">{hero.freeConsultation}</GuidanceCTA>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-300/25 to-emerald-300/20 blur-2xl animate-breathe" />
            <div className="relative w-full max-w-none">
              <MappingHeroShowcase
                variant="combo"
                alt={hero.dmitAlt || hero.psychometricAlt}
              />
              {hero.mergeCard && (
              <motion.div
                className="glass-card p-3 mt-3 flex items-center gap-3 combo-merge-card"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-7 h-7 text-amber-600 shrink-0" />
                <p className="text-sm font-semibold text-theme-body">{hero.mergeCard}</p>
              </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-[var(--bg-elevated)]">
        <div className="max-w-7xl mx-auto px-4">
          <CounsellingProcessTimeline />
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fade} className="text-center mb-14">
            <p className="section-label mb-3">{page.process.label}</p>
            <h2 className="section-title">{page.process.title}</h2>
            <p className="text-sm md:text-base text-sand-600 dark:text-sand-400 max-w-2xl mx-auto mt-4">
              {page.process.desc}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => {
              const StepIcon = STEP_ICONS[i % STEP_ICONS.length];
              const tone = STEP_TONES[i % STEP_TONES.length];
              return (
              <motion.div
                key={s.step}
                {...fade}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -8 }}
                className="glass-card p-6 combo-step-card relative overflow-hidden"
              >
                <span className="absolute top-3 right-4 text-3xl font-display font-bold text-amber-500/20">{s.step}</span>
                <span className={`dm-saas__icon-circle dm-saas__icon-circle--${tone} mb-3`} aria-hidden>
                  <StepIcon className="w-5 h-5" />
                </span>
                <h3 className="font-display font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-sand-600 dark:text-sand-400 leading-relaxed mb-3">{s.desc}</p>
                {s.link && s.step !== '04' && (
                  <Link to={s.link} className="text-xs font-semibold text-amber-600 inline-flex items-center gap-1 hover:gap-2 transition-all">
                    {page.process.learnMore} <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
                {s.step === '04' && (
                  <GuidanceCTA className="text-xs font-semibold text-amber-600 inline-flex items-center gap-1">
                    {page.process.learnMore} <ArrowRight className="w-3 h-3" />
                  </GuidanceCTA>
                )}
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-[var(--bg-elevated)]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 {...fade} className="section-title text-center mb-12">{page.compare.title}</motion.h2>
          <motion.div {...fade} className="table-scroll overflow-x-auto rounded-2xl border border-amber-100 dark:border-sand-700 shadow-lg">
            <table className="w-full text-sm combo-table">
              <thead>
                <tr className="bg-amber-50 dark:bg-amber-900/20">
                  <th className="text-left p-4 font-display font-bold">{page.compare.aspect}</th>
                  <th className="text-left p-4 font-display font-bold"><Fingerprint className="w-4 h-4 inline mr-1" />{page.compare.dmit}</th>
                  <th className="text-left p-4 font-display font-bold"><Brain className="w-4 h-4 inline mr-1" />{page.compare.psychometric}</th>
                  <th className="text-left p-4 font-display font-bold text-amber-700 dark:text-amber-300"><GitMerge className="w-4 h-4 inline mr-1" />{page.compare.combo}</th>
                </tr>
              </thead>
              <tbody>
                {compare.map((row, i) => (
                  <motion.tr
                    key={row.aspect}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="border-t border-amber-50 dark:border-sand-800"
                  >
                    <td className="p-4 font-semibold text-sand-700 dark:text-sand-200">{row.aspect}</td>
                    <td className="p-4 text-sand-600 dark:text-sand-400">{row.dmit}</td>
                    <td className="p-4 text-sand-600 dark:text-sand-400">{row.psychometric}</td>
                    <td className="p-4 font-medium text-amber-800 dark:text-amber-200 bg-amber-50/50 dark:bg-amber-900/10">{row.combo}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 {...fade} className="section-title text-center mb-12">{page.benefitsTitle}</motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b, i) => {
              const BenIcon = BENEFIT_ICONS[i % BENEFIT_ICONS.length];
              const tone = BENEFIT_TONES[i % BENEFIT_TONES.length];
              return (
              <motion.div key={b.title} {...fade} transition={{ delay: i * 0.06 }} whileHover={{ scale: 1.02 }} className="glass-card p-6 combo-card-hover">
                <span className={`dm-saas__icon-circle dm-saas__icon-circle--${tone} mb-3`} aria-hidden>
                  <BenIcon className="w-5 h-5" />
                </span>
                <h3 className="font-display font-bold mb-2">{b.title}</h3>
                <p className="text-sm text-sand-600 dark:text-sand-400 leading-relaxed">{b.desc}</p>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 combo-report-section text-amber-50 relative overflow-hidden">
        <div className="combo-report-section__orb combo-report-section__orb--1" aria-hidden="true" />
        <div className="combo-report-section__orb combo-report-section__orb--2" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 relative">
          <motion.div {...fade}>
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-6 h-6 text-amber-400" />
              <h2 className="font-display text-xl md:text-2xl font-bold">{page.reportTitle}</h2>
            </div>
            <ul className="space-y-3">
              {reportIncludes.map((item, i) => (
                <motion.li key={item} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="flex gap-3 text-sm text-sand-200">
                  <CheckCircle className="w-5 h-5 text-amber-400 shrink-0" /> {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
          <motion.div {...fade} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-6 h-6 text-amber-400" />
              <h2 className="font-display text-xl md:text-2xl font-bold">{page.whoTitle}</h2>
            </div>
            <ul className="space-y-3">
              {who.map((item, i) => (
                <motion.li key={item} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="flex gap-3 text-sm text-sand-200">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-2" /> {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <motion.div {...fade} className="max-w-4xl mx-auto px-4 text-center glass-card p-10 lg:p-12 combo-cta-block">
          <MessageCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h2 className="section-title mb-3">{page.counselling.title}</h2>
          <p className="text-sm md:text-base text-sand-600 dark:text-sand-400 mb-8 max-w-xl mx-auto leading-relaxed">
            {page.counselling.desc}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup" className="btn-primary px-8 py-3.5">{page.counselling.bookCombo}</Link>
            <a href="tel:9680102276" className="btn-outline inline-flex items-center gap-2">
              <Phone className="w-4 h-4" /> 9680102276
            </a>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs">
            <Link to="/counselling?tab=dmit" className="text-amber-600 font-semibold hover:underline">{page.counselling.dmitOnly}</Link>
            <Link to="/counselling?tab=psychometric" className="text-amber-600 font-semibold hover:underline">{page.counselling.psychometricOnly}</Link>
            <Link to="/counselling?tab=overview" className="text-amber-600 font-semibold hover:underline">{page.counselling.processLink}</Link>
          </div>
        </motion.div>
      </section>
      <CmsPageSections cms={cms} />
    </div>
  );
}
