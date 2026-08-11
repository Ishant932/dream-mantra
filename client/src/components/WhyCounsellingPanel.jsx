import { Link } from 'react-router-dom';
import GuidanceCTA from './GuidanceCTA';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  Check,
  Compass,
  Fingerprint,
  Layers,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import SuccessStoriesSection from './SuccessStoriesSection';
import { founder as founderBase } from '../data/content';
import { useLang } from '../context/LanguageContext';
import { whoWeGuideRoutes } from '../i18n/navRoutes';

const fade = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};

const HOW_ICONS = [Fingerprint, Search, Compass];
const HOW_TONES = ['orange', 'purple', 'green'];
const FEATURED_ICONS = [Fingerprint, Brain, Layers];
const FEATURED_TONES = ['green', 'orange', 'purple'];
const STAT_TONES = ['orange', 'purple', 'green', 'blue'];
const GUIDE_TONES = ['orange', 'purple', 'green', 'blue', 'yellow', 'orange'];
const COMPARE_STAT_TONES = ['orange', 'purple', 'green', 'blue', 'yellow', 'orange'];

/** Shared “Why Career Counselling” body — Counselling hub tab + standalone page */
export default function WhyCounsellingPanel({ compact = false }) {
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
    <div className={compact ? 'why-saas why-saas--compact dm-overview-tints' : 'why-saas why-saas--page py-10 sm:py-14 px-4 sm:px-6 lg:px-8 dm-overview-tints'}>
      <motion.header {...fade} className="why-saas__hero">
        <span className="why-saas__label">
          <Sparkles className="w-3.5 h-3.5" aria-hidden />
          {page.hero.tagline}
        </span>
        <h2 className="why-saas__title">
          Why Career <span className="why-saas__title-accent">Counselling?</span>
        </h2>
        <p className="why-saas__lede">{page.intro}</p>
      </motion.header>

      {d('pages.psychometric.challenge') && (
        <motion.section {...fade} className="why-saas__section why-challenge">
          <div className="why-challenge__inner">
            <div className="why-challenge__copy">
              <p className="why-challenge__label">{d('pages.psychometric.challenge.label')}</p>
              <h3 className="why-challenge__title">{d('pages.psychometric.challenge.title')}</h3>
              <p className="why-challenge__lede">{d('pages.psychometric.challenge.p1')}</p>
              <p className="why-challenge__lede">
                {d('pages.psychometric.challenge.p2Before')}
                <strong>{d('pages.psychometric.challenge.p2Highlight')}</strong>
                {d('pages.psychometric.challenge.p2After')}
              </p>
            </div>
            <div className="why-challenge__panel">
              <h4 className="why-challenge__panel-title">{d('pages.psychometric.challenge.problemsTitle')}</h4>
              <ul className="why-challenge__list">
                {(d('data.psychoProblems') || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>
      )}

      {content.impactStats?.length > 0 && (
        <motion.section {...fade} className="why-saas__section" aria-label="Impact">
          <div className="why-saas__stats">
            {content.impactStats.map((s, i) => (
              <motion.article
                key={s.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`why-saas__stat why-saas__stat--${STAT_TONES[i % STAT_TONES.length]}`}
              >
                <p className="why-saas__stat-value">{s.value}</p>
                <p className="why-saas__stat-label">{s.label}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>
      )}

      <motion.section {...fade} className="why-saas__section">
        <article className="why-saas__card why-saas__card--promise">
          <div className="why-saas__card-head">
            <span className="why-saas__icon why-saas__icon--orange" aria-hidden>
              <Target className="w-5 h-5" />
            </span>
            <div>
              <p className="why-saas__eyebrow">Our promise</p>
              <h3 className="why-saas__card-title">{content.dreamzPromise.title}</h3>
            </div>
          </div>
          <p className="why-saas__body">{content.dreamzPromise.text}</p>
          <p className="why-saas__muted">{content.dreamzPromise.subtext}</p>
          <ul className="why-saas__checks">
            {content.dreamzPromise.benefits.map((b) => (
              <li key={b}>
                <span className="why-saas__check" aria-hidden>
                  <Check className="w-3.5 h-3.5" />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </article>
      </motion.section>

      {content.comparisons && (
        <motion.section {...fade} className="why-saas__section">
          <div className="why-saas__section-head">
            <p className="why-saas__eyebrow">Comparison</p>
            <h3 className="why-saas__heading">{content.comparisons.title}</h3>
            <p className="why-saas__lede why-saas__lede--section">{content.comparisons.subtitle}</p>
          </div>

          <div className="why-saas__table-wrap">
            <table className="why-saas__table">
              <thead>
                <tr>
                  {content.comparisons.tableHeaders.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {content.comparisons.rows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, ci) => (
                      <td key={`${row[0]}-${ci}`} className={ci === 3 ? 'is-accent' : undefined}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="why-saas__grid why-saas__grid--3">
            {content.comparisons.stats.map((s, i) => (
              <article
                key={s.label}
                className={`why-saas__card why-saas__card--soft why-saas__card--${COMPARE_STAT_TONES[i % COMPARE_STAT_TONES.length]}`}
              >
                <p className="why-saas__stat-value why-saas__stat-value--sm">{s.value}</p>
                <p className="why-saas__card-title why-saas__card-title--sm">{s.label}</p>
                <p className="why-saas__caption">{s.source}</p>
              </article>
            ))}
          </div>

          {content.comparisons.milestones?.length > 0 && (
            <div className="why-saas__milestones">
              <div className="why-saas__section-head">
                <p className="why-saas__eyebrow">Journey</p>
                <h3 className="why-saas__heading">Career guidance at every stage</h3>
              </div>
              <div className="why-saas__table-wrap">
                <table className="why-saas__table">
                  <thead>
                    <tr>
                      {(content.comparisons.milestoneHeaders || ['Stage', 'Typical approach', 'Dream Mantra approach']).map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {content.comparisons.milestones.map((row) => (
                      <tr key={row[0]}>
                        {row.map((cell, ci) => (
                          <td key={`${row[0]}-${ci}`} className={ci === 2 ? 'is-accent' : undefined}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.section>
      )}

      <motion.section {...fade} className="why-saas__section">
        <div className="why-saas__section-head">
          <p className="why-saas__eyebrow">Process</p>
          <h3 className="why-saas__heading">{page.howWorksTitle}</h3>
        </div>
        <div className="why-saas__grid why-saas__grid--3">
          {content.howDreamzWorks.map((s, i) => {
            const Icon = HOW_ICONS[i % HOW_ICONS.length];
            const tone = HOW_TONES[i % HOW_TONES.length];
            return (
              <motion.article
                key={s.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`why-saas__card why-saas__card--step why-saas__card--${tone}`}
              >
                <span className={`why-saas__icon why-saas__icon--${tone}`} aria-hidden>
                  <Icon className="w-5 h-5" />
                </span>
                <p className="why-saas__step-label">
                  {page.stepLabel} {String(s.step).padStart(2, '0')}
                </p>
                <h4 className="why-saas__card-title">{s.title}</h4>
                <p className="why-saas__muted">{s.desc}</p>
              </motion.article>
            );
          })}
        </div>
      </motion.section>

      <motion.section {...fade} className="why-saas__section">
        <div className="why-saas__section-head">
          <p className="why-saas__eyebrow">Audience</p>
          <h3 className="why-saas__heading">{page.whoWeGuideTitle}</h3>
        </div>
        <div className="why-saas__grid why-saas__grid--3">
          {whoWeGuide.map((w, i) => (
            <Link
              key={w.title}
              to={w.link}
              className={`why-saas__card why-saas__card--link why-saas__card--${GUIDE_TONES[i % GUIDE_TONES.length]}`}
            >
              <span className={`why-saas__icon why-saas__icon--${GUIDE_TONES[i % GUIDE_TONES.length]}`} aria-hidden>
                <Users className="w-5 h-5" />
              </span>
              <h4 className="why-saas__card-title why-saas__card-title--sm">{w.title}</h4>
              <p className="why-saas__muted">{w.subtitle}</p>
              <span className="why-saas__text-link">
                {t('common.learnMore')} <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </motion.section>

      <motion.section {...fade} className="why-saas__section">
        <div className="why-saas__section-head">
          <p className="why-saas__eyebrow">Assessments</p>
          <h3 className="why-saas__heading">{page.featuredTitle}</h3>
        </div>
        <div className="why-saas__grid why-saas__grid--3">
          {content.featuredAssessments.map((a, i) => {
            const Icon = FEATURED_ICONS[i % FEATURED_ICONS.length];
            const tone = FEATURED_TONES[i % FEATURED_TONES.length];
            return (
              <Link
                key={a.title}
                to={a.link}
                preventScrollReset
                className={`why-saas__card why-saas__card--link why-saas__card--${tone}`}
              >
                <span className={`why-saas__icon why-saas__icon--${tone}`} aria-hidden>
                  <Icon className="w-5 h-5" />
                </span>
                <h4 className="why-saas__card-title why-saas__card-title--sm">{a.title}</h4>
                <p className="why-saas__muted">{a.desc}</p>
                <span className="why-saas__text-link">
                  Explore <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </motion.section>

      <motion.section {...fade} className="why-saas__section">
        <article className="why-saas__card">
          <p className="why-saas__eyebrow">Differentiation</p>
          <h3 className="why-saas__card-title">{page.whyDifferentTitle}</h3>
          <ul className="why-saas__checks why-saas__checks--stack">
            {content.whyDifferent.map((item) => (
              <li key={item}>
                <span className="why-saas__check" aria-hidden>
                  <Check className="w-3.5 h-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </article>
      </motion.section>

      <motion.section {...fade} className="why-saas__section">
        <article className="why-saas__card why-saas__card--founder">
          <p className="why-saas__eyebrow">Founder</p>
          <h3 className="why-saas__card-title">{page.founderTitle}</h3>
          <blockquote className="why-saas__quote">&ldquo;{founder.quote}&rdquo;</blockquote>
          <p className="why-saas__founder-name">{founder.name}</p>
          <p className="why-saas__muted">{founderLoc.role ?? founder.role}</p>
          <div className="why-saas__chips">
            {founder.certs.map((c) => (
              <span key={c} className="why-saas__chip">{c}</span>
            ))}
          </div>
        </article>
      </motion.section>

      <div className="why-saas__stories">
        <SuccessStoriesSection page={page} instagramReels={instagramReels} />
      </div>

      <motion.section {...fade} className="why-saas__section why-saas__section--cta">
        <article className="why-saas__cta">
          <div className="why-saas__cta-copy">
            <p className="why-saas__eyebrow">Next step</p>
            <h3 className="why-saas__heading">{page.contactTitle}</h3>
            <p className="why-saas__muted">{content.locations.join(' · ')}</p>
            <div className="why-saas__contact-row">
              <a href={`tel:${contactInfo.phone}`} className="why-saas__contact-link">
                <Phone className="w-4 h-4" /> {contactInfo.phone}
              </a>
              <a href={`mailto:${contactInfo.email}`} className="why-saas__contact-link">
                <Mail className="w-4 h-4" /> {contactInfo.email}
              </a>
              <span className="why-saas__contact-link">
                <MapPin className="w-4 h-4" /> {contactInfo.hours}
              </span>
            </div>
          </div>
          <GuidanceCTA className="why-saas__btn">
            {page.contactCta}
            <ArrowRight className="w-4 h-4" />
          </GuidanceCTA>
        </article>
      </motion.section>
    </div>
  );
}
