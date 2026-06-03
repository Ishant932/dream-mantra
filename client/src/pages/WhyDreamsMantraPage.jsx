import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Phone, Mail, MapPin, CheckCircle2, Sparkles, HeartHandshake } from 'lucide-react';
import PageHero from '../components/PageHero';
import SuccessStoriesSection from '../components/SuccessStoriesSection';
import { IMAGES, founder as founderBase } from '../data/content';
import { useLang } from '../context/LanguageContext';
import { whoWeGuideRoutes } from '../i18n/navRoutes';

const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.55 } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 24 } } };

export default function WhyDreamsMantraPage() {
  const { t, d } = useLang();
  const page = d('pages.whyDreamsMantra');
  const content = d('data.whyDreamsMantra');
  const founderLoc = d('data.founder');
  const instagramReels = d('data.instagramReels');
  const whoWeGuide = d('data.whoWeGuide').map((w, i) => ({ ...w, link: whoWeGuideRoutes[i] }));

  const founder = {
    ...founderBase,
    quote: founderLoc.quote ?? founderBase.quote,
    certs: founderLoc.certs ?? founderBase.certs,
  };

  const contactInfo = {
    phone: '9680102276',
    email: 'info@dreammantra.in',
    hours: 'Mon–Sat, 11am–7pm',
  };

  return (
    <>
      <PageHero
        title={page.hero.title}
        subtitle={page.hero.subtitle}
        image={IMAGES.hero}
        cta={page.hero.cta}
        ctaLink="/contact"
      />

      <section className="py-16 max-w-7xl mx-auto px-4">
        <motion.div {...fade} className="text-center mb-12">
          <motion.span
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold mb-4"
          >
            <Sparkles className="w-4 h-4" /> {page.hero.tagline}
          </motion.span>
          <p className="text-lg text-theme-muted max-w-3xl mx-auto leading-relaxed">
            {page.intro}
          </p>
        </motion.div>

        {content.impactStats?.length > 0 && (
          <motion.div
            {...fade}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto"
          >
            {content.impactStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="infigon-card p-4 text-center"
              >
                <p className="text-2xl font-display font-bold text-amber-600">{s.value}</p>
                <p className="text-xs text-theme-muted mt-1 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          {...fade}
          whileHover={{ scale: 1.01 }}
          className="infigon-card p-10 mb-12 bg-gradient-to-br from-amber-50 to-amber-50 dark:from-amber-900/20 dark:to-amber-900/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.span
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-amber-50 shadow-lg"
            >
              <HeartHandshake className="w-6 h-6" />
            </motion.span>
            <h2 className="section-title !mb-0">{content.dreamzPromise.title}</h2>
          </div>
          <p className="text-theme-body text-lg mb-4 leading-relaxed">{content.dreamzPromise.text}</p>
          <p className="text-theme-muted mb-6">{content.dreamzPromise.subtext}</p>
          <motion.ul variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid sm:grid-cols-2 gap-3">
            {content.dreamzPromise.benefits.map((b) => (
              <motion.li key={b} variants={itemUp} className="flex gap-2 text-theme-body">
                <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" /> {b}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {content.comparisons && (
          <motion.div {...fade} className="mb-12">
            <h2 className="section-title text-center mb-3">{content.comparisons.title}</h2>
            <p className="text-center text-theme-muted max-w-3xl mx-auto mb-8">{content.comparisons.subtitle}</p>
            <div className="overflow-x-auto rounded-2xl border border-amber-200/60 dark:border-amber-800/40 shadow-lg mb-8">
              <table className="w-full text-sm why-counselling-table min-w-[640px]">
                <thead>
                  <tr>
                    {content.comparisons.tableHeaders.map((h) => (
                      <th key={h} className="text-left py-3 px-4 font-bold bg-amber-50 dark:bg-amber-950/40 text-theme-primary">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {content.comparisons.rows.map((row) => (
                    <tr key={row[0]} className="border-t border-amber-100 dark:border-amber-900/40">
                      {row.map((cell, ci) => (
                        <td key={`${row[0]}-${ci}`} className={`py-3 px-4 align-top ${ci === 3 ? 'bg-amber-50/70 dark:bg-amber-900/20 font-medium text-theme-primary' : 'text-theme-body'}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {content.comparisons.stats.map((s) => (
                <div key={s.label} className="infigon-card p-5 text-center">
                  <p className="text-2xl font-display font-bold text-amber-600">{s.value}</p>
                  <p className="text-sm font-semibold text-theme-primary mt-1">{s.label}</p>
                  <p className="text-xs text-theme-muted mt-1">{s.source}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div {...fade} className="mb-12">
          <h2 className="section-title text-center mb-10">{page.howWorksTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {content.howDreamzWorks.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, type: 'spring', stiffness: 300 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(124,58,237,0.15)' }}
                className="infigon-card p-8 text-center glow-card relative overflow-hidden"
              >
                <motion.span
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.3 }}
                  className="text-4xl block"
                >
                  {s.icon}
                </motion.span>
                <p className="text-xs font-bold text-amber-600 mt-4">{page.stepLabel} {s.step}</p>
                <h3 className="font-display text-xl font-bold mt-1">{s.title}</h3>
                <p className="text-theme-muted mt-3 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fade} className="mb-12">
          <h2 className="section-title text-center mb-8">{page.whoWeGuideTitle}</h2>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {whoWeGuide.map((w) => (
              <motion.div key={w.title} variants={itemUp} whileHover={{ scale: 1.03 }}>
                <Link to={w.link} className="infigon-card p-6 hover:border-amber-400 group transition block h-full">
                  <h3 className="font-bold group-hover:text-amber-700">{w.title}</h3>
                  <p className="text-sm text-theme-muted">{w.subtitle}</p>
                  <span className="text-amber-600 text-sm font-semibold mt-3 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    {t('common.learnMore')} <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div {...fade} className="mb-12">
          <h2 className="section-title text-center mb-8">{page.featuredTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {content.featuredAssessments.map((a, i) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <Link to={a.link} className="infigon-card p-6 hover:shadow-xl transition group block h-full">
                  <motion.span
                    whileHover={{ rotate: 12, scale: 1.15 }}
                    className="text-3xl inline-block"
                  >
                    {a.icon}
                  </motion.span>
                  <h3 className="font-bold mt-3 group-hover:text-amber-700">{a.title}</h3>
                  <p className="text-sm text-theme-muted mt-2">{a.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          {...fade}
          className="infigon-card p-10 mb-12"
        >
          <h2 className="section-title mb-6">{page.whyDifferentTitle}</h2>
          <motion.ul variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-3">
            {content.whyDifferent.map((item) => (
              <motion.li key={item} variants={itemUp} className="flex gap-3 text-theme-body">
                <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" /> {item}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="infigon-card p-10 mb-12 text-center max-w-3xl mx-auto"
        >
          <h2 className="section-title mb-4">{page.founderTitle}</h2>
          <blockquote className="text-lg text-theme-body italic leading-relaxed mb-6">&ldquo;{founder.quote}&rdquo;</blockquote>
          <p className="font-bold text-amber-700">{founder.name}</p>
          <p className="text-sm text-theme-muted">{founderLoc.role ?? founder.role}</p>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-wrap justify-center gap-2 mt-4">
            {founder.certs.map((c) => (
              <motion.span key={c} variants={itemUp} className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">
                {c}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        <SuccessStoriesSection page={page} instagramReels={instagramReels} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-gradient-to-r from-[#b45309] to-[#f97316] p-10 text-amber-50 text-center relative overflow-hidden"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[var(--bg-elevated)]/10 blur-2xl"
          />
          <h2 className="font-display text-2xl font-bold mb-6 relative">{page.contactTitle}</h2>
          <div className="flex flex-wrap justify-center gap-8 mb-8 relative">
            <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-2 hover:text-amber-300 transition">
              <Phone className="w-5 h-5" /> {contactInfo.phone}
            </a>
            <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-2 hover:text-amber-300 transition">
              <Mail className="w-5 h-5" /> {contactInfo.email}
            </a>
            <span className="flex items-center gap-2"><MapPin className="w-5 h-5" /> {contactInfo.hours}</span>
          </div>
          <p className="text-amber-200 mb-4 relative">📍 {content.locations.join(' · ')}</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="relative inline-block">
            <Link to="/contact" className="btn-gold">{page.contactCta}</Link>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
