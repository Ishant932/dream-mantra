import GuidanceCTA from '../components/GuidanceCTA';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, ArrowRight, Brain, Users, Target, BookOpen,
  Sparkles, Phone, ChevronRight, BarChart3, Zap, Eye,
  Compass, Orbit, Monitor, Microscope, ClipboardList, MessageCircle,
} from 'lucide-react';
import { IMAGES } from '../data/content';
import { useLang } from '../context/LanguageContext';
import MappingHeroCollage from '../components/MappingHeroCollage';
import CmsPageSections from '../components/CmsPageSections';
import { cmsText, usePageCatalog } from '../hooks/usePageCatalog';

const fade = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

const stagger = {
  initial: { opacity: 0, y: 20, scale: 0.97 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true },
};

const accentMap = {
  amber: 'from-amber-500/15 to-amber-600/5 border-amber-200 dark:border-amber-800',
  orange: 'from-orange-500/15 to-orange-600/5 border-orange-200 dark:border-orange-800',
  green: 'from-emerald-500/15 to-emerald-600/5 border-emerald-200 dark:border-emerald-800',
  gold: 'from-yellow-500/15 to-amber-500/5 border-yellow-200 dark:border-yellow-800',
};

const TEST_ICONS = {
  mbti: Brain,
  disc: Zap,
  big5: BarChart3,
  vak: Eye,
  mit: Target,
  riasec: Compass,
  jung: Orbit,
};

const PROCESS_ICONS = [Monitor, Microscope, ClipboardList, MessageCircle];
const PROCESS_TONES = ['blue', 'purple', 'orange', 'green'];

export default function PsychometricPage({ compact = false }) {
  const { d } = useLang();
  const page = d('pages.psychometric');
  const hero = page.hero;
  const cms = usePageCatalog('skill-mapping');
  const heroTitle = cmsText(cms, 'heroTitle', '');
  const heroDesc = cmsText(cms, 'intro', hero.desc);
  const tests = d('data.psychometricTests');
  const profileCovers = d('data.psychoProfileCovers');
  const process = d('data.psychoProcess');
  const ageMap = d('data.psychoAgeMap');
  const whyItems = d('data.psychoWhy');
  const whatAre = page.whatAre;

  return (
    <div className={`overflow-hidden psycho-page dm-overview-tints${compact ? ' counselling-embed dm-saas' : ''}`}>
      <section className={`relative ${compact ? 'pt-0 pb-8 lg:pb-10' : 'pt-28 pb-20 lg:pt-32 lg:pb-28'} bg-gradient-to-b from-amber-50/80 to-[var(--bg-base)] dark:from-[#3d4a22]/40 dark:to-[var(--bg-base)]`}>
        <div className="absolute top-20 right-[10%] w-64 h-64 rounded-full blur-3xl opacity-30 animate-blob pointer-events-none" style={{ background: 'rgba(255,107,74,0.2)' }} />
        <div className="absolute bottom-10 left-[5%] w-48 h-48 rounded-full blur-3xl opacity-25 animate-blob-slow pointer-events-none" style={{ background: 'rgba(201,168,76,0.25)' }} />

        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative">
          <motion.div initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-sm font-semibold mb-6 psycho-badge-pop">
              <Sparkles className="w-4 h-4" /> {hero.badge}
            </span>
            <h1 className="hero-title text-theme-primary mb-4">
              {heroTitle || (
                <>{hero.titleBefore} <span className="gradient-text">{hero.titleHighlight}</span></>
              )}
            </h1>
            <p className="text-base md:text-lg text-sand-600 dark:text-sand-300 mb-3 leading-relaxed">
              {heroDesc}
            </p>
            <p className="text-sm text-sand-500 dark:text-sand-400 mb-8">
              {hero.subdesc}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup" className="btn-primary px-7 py-3.5 psycho-cta-shine">{hero.bookTest}</Link>
              <GuidanceCTA className="btn-outline">{hero.freeConsultation}</GuidanceCTA>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-amber-400/25 to-orange-500/15 blur-xl animate-breathe" />
            <MappingHeroCollage images={IMAGES.psychoCollage} alts={[hero.imageAlt]} />
          </motion.div>
        </div>
      </section>

      {page.challenge && (
        <section className="py-16 lg:py-24 why-challenge-wrap">
          <div className="px-4">
            <motion.div {...fade} className="why-challenge">
              <div className="why-challenge__inner">
                <div className="why-challenge__copy">
                  <p className="why-challenge__label">{page.challenge.label}</p>
                  <h2 className="why-challenge__title">{page.challenge.title}</h2>
                  <p className="why-challenge__lede">{page.challenge.p1}</p>
                  <p className="why-challenge__lede">
                    {page.challenge.p2Before}
                    <strong>{page.challenge.p2Highlight}</strong>
                    {page.challenge.p2After}
                  </p>
                </div>
                <div className="why-challenge__panel">
                  <h3 className="why-challenge__panel-title">{page.challenge.problemsTitle}</h3>
                  <ul className="why-challenge__list">
                    {(d('data.psychoProblems') || []).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <section className="py-16 lg:py-24 bg-gradient-to-b from-[var(--bg-elevated)] to-[var(--bg-base)]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fade} className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="home-headline mb-3">{whatAre.title}</h2>
            <div className="space-y-4 text-left max-w-2xl mx-auto">
              {whatAre.paragraphs.map((p) => (
                <p key={p.slice(0, 48)} className="text-sm md:text-base text-sand-600 dark:text-sand-400 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </motion.div>

          <motion.div {...fade} transition={{ delay: 0.08 }} className="mb-12">
            <h3 className="home-headline text-2xl text-center mb-2">{whatAre.benefitsTitle}</h3>
            {whatAre.profileAgeNote && (
              <p className="text-center text-sm text-amber-700 dark:text-amber-300 font-semibold mb-8">{whatAre.profileAgeNote}</p>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {whatAre.studentBenefits.map((b, i) => (
                <motion.div
                  key={b}
                  {...stagger}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -6 }}
                  className="glass-card p-5 psycho-card-hover border-l-4 border-l-amber-500"
                >
                  <CheckCircle className="w-5 h-5 text-amber-600 mb-3" />
                  <p className="text-sm font-medium text-sand-700 dark:text-sand-200 leading-relaxed">{b}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fade} className="glass-card p-6 lg:p-8 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-900/10">
            <h3 className="font-display font-bold text-lg mb-2">{whatAre.profileTitle}</h3>
            {whatAre.profileAgeNote && (
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-4">{whatAre.profileAgeNote}</p>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {profileCovers.map((c) => (
                <div key={c} className="flex gap-2 text-sm text-sand-600 dark:text-sand-400">
                  <ChevronRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  {c}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="tests-provided" className="py-16 lg:py-28 relative">
        <div className="absolute inset-0 psycho-grid-bg pointer-events-none opacity-40" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <motion.div {...fade} className="text-center mb-14">
            <p className="section-label mb-3">{page.testsProvided.label}</p>
            <h2 className="section-title mb-4">{page.testsProvided.title}</h2>
            <p className="text-sm md:text-base text-sand-600 dark:text-sand-400 max-w-2xl mx-auto">
              {page.testsProvided.desc}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {tests.map((test, i) => (
              <motion.article
                key={test.id}
                {...stagger}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -8, scale: 1.01 }}
                className={`psycho-test-card glass-card p-6 lg:p-7 border bg-gradient-to-br ${accentMap[test.color]}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <motion.span
                    className={`dm-saas__icon-circle dm-saas__icon-circle--${test.color === 'gold' ? 'yellow' : test.color === 'amber' ? 'orange' : test.color} psycho-icon-float`}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                    aria-hidden
                  >
                    {(() => {
                      const Icon = TEST_ICONS[test.id] || Brain;
                      return <Icon className="w-5 h-5" />;
                    })()}
                  </motion.span>
                  <div>
                    <h3 className="font-display font-bold text-lg leading-snug">{test.name}</h3>
                    <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1 font-medium">{test.developer}</p>
                  </div>
                </div>
                <p className="text-sm text-sand-600 dark:text-sand-400 leading-relaxed mb-4">{test.summary}</p>
                <ul className="space-y-1.5 mb-4">
                  {test.pairs.slice(0, 4).map((p) => (
                    <li key={p} className="text-xs text-sand-500 dark:text-sand-400 flex gap-2">
                      <span className="text-amber-500">•</span> {p}
                    </li>
                  ))}
                  {test.pairs.length > 4 && (
                    <li className="text-xs text-amber-600 font-semibold">+ {test.pairs.length - 4} {page.testsProvided.moreDimensions}</li>
                  )}
                </ul>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                  ✓ {test.outcome}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 psycho-section-orange relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-25 bg-white" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <motion.h2 {...fade} className="home-headline home-headline--on-orange text-center mb-12">
            {page.why.title}
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyItems.map((w, i) => (
              <motion.div
                key={w.title}
                {...stagger}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="p-6 rounded-2xl bg-white/95 border border-white/40 shadow-xl psycho-why-card"
              >
                <h3 className="font-accent font-bold text-lg text-amber-800 mb-2">{w.title}</h3>
                <p className="text-sm text-sand-700 leading-relaxed">{w.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div {...fade} className="text-center mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/counselling?tab=combo" className="btn-gold inline-flex items-center gap-2 shadow-lg">
              {page.why.comboCta} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/counselling?tab=dmit" className="px-6 py-3 rounded-xl border-2 border-white/70 text-white font-semibold hover:bg-white/15 transition">
              {page.why.learnDmit}
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-gradient-to-b from-amber-50/50 to-[var(--bg-base)]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fade} className="text-center mb-12">
            <h2 className="home-headline">{page.ageWise.title}</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6">
            {ageMap.map((row, i) => (
              <motion.div
                key={row.age}
                {...stagger}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="psycho-age-card"
              >
                <div className="psycho-age-card__header">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-500" />
                    <div>
                      <h3 className="font-accent font-bold text-lg">{row.age}</h3>
                      <p className="text-xs font-bold uppercase tracking-wide text-amber-600">{row.tag}</p>
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-sand-500 mb-2">{page.ageWise.testsLabel}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {row.frameworks.map((fw) => (
                      <span key={fw} className="psycho-fw-badge">{fw}</span>
                    ))}
                  </div>
                </div>
                {row.problem && (
                  <div className="psycho-age-problem mx-5 mb-3">
                    <p className="text-xs font-bold uppercase text-red-600 mb-1">{page.ageWise.problemLabel}</p>
                    <p className="text-sm text-sand-700 leading-relaxed">{row.problem}</p>
                  </div>
                )}
                {row.solution && (
                  <div className="psycho-age-solution mx-5 mb-4">
                    <p className="text-xs font-bold uppercase text-amber-700 mb-1">{page.ageWise.solutionLabel}</p>
                    <p className="text-sm text-sand-700 leading-relaxed">{row.solution}</p>
                  </div>
                )}
                <div className="px-5 pb-5 pt-2 border-t border-amber-100/80">
                  <Link to={row.program} className="text-sm font-bold text-orange-600 inline-flex items-center gap-1 hover:gap-2 transition-all">
                    {page.ageWise.viewProgram} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 psycho-section-orange-soft">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fade} className="text-center mb-14">
            <h2 className="home-headline">{page.process.title}</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((s, i) => {
              const StepIcon = PROCESS_ICONS[i % PROCESS_ICONS.length];
              const tone = PROCESS_TONES[i % PROCESS_TONES.length];
              return (
              <motion.div
                key={s.step}
                {...stagger}
                transition={{ delay: i * 0.1 }}
                className={`relative p-6 rounded-2xl overflow-hidden psycho-card-hover ${
                  s.title === 'Multi-Framework Analysis'
                    ? 'psycho-process-highlight'
                    : 'glass-card bg-white/80'
                }`}
              >
                <span className="absolute top-3 right-4 text-4xl font-display font-bold text-amber-500/15">{s.step}</span>
                <span className={`dm-saas__icon-circle dm-saas__icon-circle--${tone} mb-3`} aria-hidden>
                  <StepIcon className="w-5 h-5" />
                </span>
                <h3 className="font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-sand-600 dark:text-sand-400 leading-relaxed">{s.desc}</p>
                {i < process.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 w-6 h-0.5 bg-amber-300/50" />
                )}
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <motion.div
          {...fade}
          className="max-w-4xl mx-auto px-4 text-center glass-card p-10 lg:p-12 psycho-cta-block"
        >
          <Brain className="w-12 h-12 text-amber-600 mx-auto mb-4 animate-breathe" />
          <h2 className="section-title mb-3">{page.cta.title}</h2>
          <p className="text-sm md:text-base text-sand-600 dark:text-sand-400 mb-8 max-w-xl mx-auto">
            {page.cta.desc}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <GuidanceCTA className="btn-primary px-8 py-3.5">{page.cta.bookSession}</GuidanceCTA>
            <a href="tel:9680102276" className="btn-outline inline-flex items-center gap-2">
              <Phone className="w-4 h-4" /> 9680102276
            </a>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-sand-500">
            <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5 text-amber-500" /> {page.cta.frameworks}</span>
            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-amber-500" /> {page.cta.detailedReport}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-amber-500" /> {page.cta.expertCounselling}</span>
          </div>
        </motion.div>
      </section>
      <CmsPageSections cms={cms} />
    </div>
  );
}
