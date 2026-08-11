import GuidanceCTA from '../components/GuidanceCTA';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle, XCircle, ArrowRight, Fingerprint, Brain, Target, Users, Star,
  Microscope, Shield, BookOpen, Dna, Globe2,
} from 'lucide-react';
import { IMAGES } from '../data/content';
import { useLang } from '../context/LanguageContext';
import DermatoglyphicsDeepDive from '../components/DermatoglyphicsDeepDive';
import MappingHeroShowcase from '../components/MappingHeroShowcase';
import CmsPageSections from '../components/CmsPageSections';
import { cmsText, usePageCatalog } from '../hooks/usePageCatalog';

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

const WHY_ICONS = [Brain, Users, Target, Star];
const SCIENCE_ICONS = [Dna, Brain, Globe2];
const SCIENCE_TONES = ['purple', 'orange', 'blue'];

function SectionLabel({ children }) {
  return (
    <span className="home-eyebrow inline-flex items-center gap-2 mb-4 dm-saas__section-label">{children}</span>
  );
}

export default function DMITPage({ compact = false }) {
  const { d } = useLang();
  const page = d('pages.dmit');
  const hero = page.hero;
  const cms = usePageCatalog('brain-mapping');
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);
  const heroTitle = cmsText(cms, 'heroTitle', '');
  const heroDesc = cmsText(cms, 'intro', hero.desc);

  return (
    <div className={`overflow-hidden dmit-page dm-saas dm-overview-tints${compact ? ' counselling-embed' : ''}`}>
      {/* Hero */}
      <section className={`relative ${compact ? 'pt-0 pb-8 lg:pb-10' : 'pt-28 pb-16 lg:pt-32 lg:pb-20'} bg-gradient-to-b from-amber-50 to-[var(--bg-base)] dark:from-[#5c6b2e] dark:to-[#523010]`}>
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-bold mb-6">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {hero.badge}
            </span>
            <h1 className="home-headline text-sand-900 dark:text-amber-50 mb-4">
              {heroTitle || (
                <>
                  {hero.titleBefore}{' '}
                  <span className="gradient-text text-pop">{hero.titleHighlight}</span>
                  {hero.titleAfter ? ` ${hero.titleAfter}` : ''}
                </>
              )}
            </h1>
            <p className="text-base text-sand-600 dark:text-sand-300 mb-8 leading-relaxed">{heroDesc}</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup" className="btn-primary text-base px-8 py-4">{hero.bookTest}</Link>
              <GuidanceCTA className="btn-outline">{hero.freeConsultation}</GuidanceCTA>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <MappingHeroShowcase variant="brain" alt={hero.imageAlt} />
          </motion.div>
        </div>
      </section>

      {/* 1. What is Brain Mapping */}
      <section className="py-20 lg:py-28 bg-[var(--bg-elevated)]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fade} className="text-center max-w-3xl mx-auto mb-14">
            <SectionLabel><Microscope className="w-4 h-4" /> {page.whatIs.label}</SectionLabel>
            <h2 className="home-headline mb-6">{page.whatIs.title}</h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-10 mb-14">
            <motion.div {...fade} className="space-y-4">
              {page.whatIs.paragraphs.map((p) => (
                <p key={p.slice(0, 40)} className="text-sand-600 dark:text-sand-400 leading-relaxed">{p}</p>
              ))}
            </motion.div>
            <motion.div {...fade} transition={{ delay: 0.1 }} className="glass-card p-8">
              <h3 className="font-accent font-bold text-lg mb-5 flex items-center gap-2">
                <Brain className="w-5 h-5 text-amber-600" /> {page.whatIs.revealsTitle}
              </h3>
              <ul className="space-y-3">
                {page.whatIs.reveals.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    className="flex gap-2 text-sm text-sand-700 dark:text-sand-300"
                  >
                    <CheckCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div {...fade} className="mb-10">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-3">
              <h3 className="home-headline text-2xl text-center">{page.whatIs.scienceTitle}</h3>
              <button type="button" className="dmit-deep-dive-btn" onClick={() => setDeepDiveOpen(true)}>
                <BookOpen className="w-5 h-5" aria-hidden />
                In-depth scientific history
              </button>
            </div>
            <p className="text-center text-sand-600 dark:text-sand-400 max-w-2xl mx-auto mb-8">{page.whatIs.scienceIntro}</p>
            <div className="grid sm:grid-cols-3 gap-6">
              {page.whatIs.scienceFields.map((field, i) => {
                const SciIcon = SCIENCE_ICONS[i % SCIENCE_ICONS.length];
                const tone = SCIENCE_TONES[i % SCIENCE_TONES.length];
                return (
                <motion.div
                  key={field.title}
                  {...fade}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -6 }}
                  className={`infigon-card p-6 text-center glow-card dm-saas__science-card dm-saas__science-card--${tone}`}
                >
                  <span className={`dm-saas__icon-circle dm-saas__icon-circle--${tone}`} aria-hidden>
                    <SciIcon className="w-6 h-6" />
                  </span>
                  <h4 className="font-bold mb-2">{field.title}</h4>
                  <p className="text-sm text-sand-600 dark:text-sand-400">{field.desc}</p>
                </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            {...fade}
            className="rounded-2xl p-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200/40 text-center"
          >
            <h3 className="font-accent font-bold text-lg mb-2">{page.whatIs.purposeTitle}</h3>
            <p className="text-sand-700 dark:text-sand-300 max-w-2xl mx-auto leading-relaxed">{page.whatIs.purpose}</p>
          </motion.div>
        </div>
      </section>

      {/* 2. How is it Done */}
      <section className="py-20 lg:py-28 psycho-section-orange text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: 'rgba(251,191,36,0.25)' }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <motion.div {...fade} className="text-center mb-14">
            <SectionLabel><Fingerprint className="w-4 h-4" /> {page.howDone.label}</SectionLabel>
            <h2 className="home-headline home-headline--on-orange mb-4">{page.howDone.title}</h2>
            <p className="text-white/90 max-w-xl mx-auto">{page.howDone.subtitle}</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {page.howDone.steps.map((s, i) => (
              <motion.div
                key={s.num}
                {...fade}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="relative p-6 rounded-2xl bg-white/12 backdrop-blur-sm border border-white/25 shadow-lg"
              >
                <span className="text-4xl font-accent font-bold text-white/40">{s.num}</span>
                <h3 className="text-lg font-bold mt-2 mb-4 text-white">{s.title}</h3>
                <ul className="space-y-2">
                  {s.points.map((pt) => (
                    <li key={pt} className="flex gap-2 text-sm text-white/90">
                      <span className="text-amber-200">•</span> {pt}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/signup" className="btn-gold">{page.getStarted}</Link>
          </div>
        </div>
      </section>

      {/* 3. Who is it For */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-brand-50/60 to-[var(--bg-base)]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fade} className="text-center mb-14">
            <SectionLabel><Users className="w-4 h-4" /> {page.whoFor.label}</SectionLabel>
            <h2 className="home-headline mb-4">{page.whoFor.title}</h2>
            <p className="text-sand-600 dark:text-sand-400 max-w-2xl mx-auto">{page.whoFor.subtitle}</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {page.whoFor.groups.map((g, i) => (
              <motion.div
                key={g.stage}
                {...fade}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="infigon-card p-6 glow-card h-full"
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-3xl">{g.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg">{g.stage}</h3>
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">{g.tag}</p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {g.points.map((pt) => (
                    <li key={pt} className="flex gap-2 text-sm text-sand-600 dark:text-sand-400">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" /> {pt}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 35-Page Report */}
      <section className="py-20 lg:py-28 bg-[var(--bg-elevated)]">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-start">
          <motion.div {...fade}>
            <SectionLabel><BookOpen className="w-4 h-4" /> Report</SectionLabel>
            <h2 className="home-headline mb-4">{page.report.title}</h2>
            <p className="text-sand-600 dark:text-sand-400 mb-8 leading-relaxed">{page.report.desc}</p>
            <Link to="/signup" className="btn-primary inline-flex gap-2">
              {hero.bookTest} <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
          <motion.div {...fade} transition={{ delay: 0.1 }}>
            <ul className="grid sm:grid-cols-2 gap-2">
              {page.report.sections.map((item, i) => (
                <li key={item} className="flex gap-2 text-sm p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition">
                  <span className="text-amber-500 font-bold shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* 8 Intelligences */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fade} className="text-center mb-14">
            <h2 className="home-headline mb-3">{page.intelligences.title}</h2>
            <p className="text-sand-600 dark:text-sand-400 max-w-xl mx-auto">{page.intelligences.subtitle}</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {page.intelligences.items.map((intel, i) => (
              <motion.div
                key={intel.name}
                {...fade}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5 }}
                className="glass-card p-5 text-center"
              >
                <span className="text-3xl mb-2 block">{intel.icon}</span>
                <h3 className="font-bold text-sm">{intel.name}</h3>
                <p className="text-xs text-amber-600 font-medium mb-3">{intel.type}</p>
                <ul className="text-xs text-sand-600 dark:text-sand-400 space-y-1 text-left">
                  {intel.traits.map((t) => <li key={t}>• {t}</li>)}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-amber-50/50 to-[var(--bg-base)]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 {...fade} className="home-headline text-center mb-12">{page.comparison.title}</motion.h2>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div {...fade} className="rounded-2xl p-8 border border-red-200/50 bg-red-50/30 dark:bg-red-950/20">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-red-700 dark:text-red-400">
                <XCircle className="w-5 h-5" /> {page.comparison.traditional.label}
              </h3>
              <ul className="space-y-3">
                {page.comparison.traditional.items.map((item) => (
                  <li key={item.text} className="flex gap-2 text-sm text-sand-700 dark:text-sand-300">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" /> {item.text}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div {...fade} transition={{ delay: 0.1 }} className="rounded-2xl p-8 border border-amber-300/50 bg-amber-50/50 dark:bg-amber-950/20">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <CheckCircle className="w-5 h-5" /> {page.comparison.dmit.label}
              </h3>
              <ul className="space-y-3">
                {page.comparison.dmit.items.map((item) => (
                  <li key={item.text} className="flex gap-2 text-sm text-sand-700 dark:text-sand-300">
                    <CheckCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> {item.text}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Media & Scientific Research */}
      <section className="py-20 lg:py-28 bg-[var(--bg-elevated)]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fade} className="text-center mb-14">
            <SectionLabel><Shield className="w-4 h-4" /> {page.validation.label}</SectionLabel>
            <h2 className="home-headline mb-4">{page.validation.title}</h2>
            <p className="text-sand-600 dark:text-sand-400 max-w-2xl mx-auto">{page.validation.subtitle}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {page.validation.items.map((item, i) => (
              <motion.div
                key={item.title}
                {...fade}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="infigon-card p-8 glow-card h-full flex flex-col"
              >
                <span className="text-4xl mb-4">{item.icon}</span>
                <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-sm text-sand-600 dark:text-sand-400 leading-relaxed flex-1">{item.desc}</p>
                {item.source && (
                  <p className="text-xs font-semibold text-amber-600 mt-4 italic">{item.source}</p>
                )}
                {item.bullets && (
                  <ul className="mt-4 space-y-2">
                    {item.bullets.map((b) => (
                      <li key={b} className="flex gap-2 text-sm text-sand-600 dark:text-sand-400">
                        <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" /> {b}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 {...fade} className="home-headline text-center mb-14">{page.whyChooseTitle}</motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {page.whyChoose.map((item, i) => {
              const Icon = WHY_ICONS[i];
              return (
                <motion.div key={item.title} {...fade} transition={{ delay: i * 0.08 }} className="glass-card p-6 text-center hover:-translate-y-2 transition-transform">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-amber-600" />
                  </div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-sand-600 dark:text-sand-400">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <motion.div
          {...fade}
          className={`max-w-3xl mx-auto text-center rounded-3xl p-12 ${
            compact
              ? 'dm-saas__bottom-cta'
              : 'bg-gradient-to-r from-amber-600 to-orange-600 text-amber-50'
          }`}
        >
          <h2 className={`home-headline mb-4 ${compact ? '' : 'text-amber-50'}`}>{page.cta.title}</h2>
          <p className={`mb-8 ${compact ? 'text-sand-600' : 'opacity-90'}`}>{page.cta.desc}</p>
          <Link to="/signup" className={`inline-flex gap-2 ${compact ? 'btn-primary px-8 py-3.5' : 'btn-gold'}`}>
            {page.cta.button} <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
      <DermatoglyphicsDeepDive open={deepDiveOpen} onClose={() => setDeepDiveOpen(false)} />
      <CmsPageSections cms={cms} />
    </div>
  );
}
