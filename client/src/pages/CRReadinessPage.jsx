import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ChevronDown, Clock, Sparkles } from 'lucide-react';
import GuidanceCTA from '../components/GuidanceCTA';
import { useLang } from '../context/LanguageContext';
import { isPhoneViewport } from '../utils/mobilePerf';
import CmsPageSections from '../components/CmsPageSections';
import { cmsText, usePageCatalog } from '../hooks/usePageCatalog';
import { CRPStatsStrip, statIcons } from '../components/crp/crpShared';
import {
  READINESS_HERO,
  READINESS_SYSTEM,
  READINESS_INCLUDED,
  READINESS_SESSIONS,
  PROFILE_REVIEWS,
  MOCK_INTERVIEW,
  PERSONAL_BRANDING,
  AI_TOOLKIT,
  JOB_SEARCH_SYSTEM,
  INTERVIEW_KIT,
  OFFER_GUIDANCE,
  NINETY_DAY_PLAN,
  CAREER_TOOLKIT,
  BONUS_RESOURCES,
  WHY_DIFFERENT,
  READINESS_WHO,
  BEFORE_AFTER,
  COMPLETE_EXPERIENCE,
  READINESS_TONES,
  SESSION_PHOTOS,
  SESSION_STICKERS,
} from '../data/crReadinessContent';

const FLOW_STEPS = [
  { label: 'Discover', tone: 'orange' },
  { label: 'Decide', tone: 'green' },
  { label: 'Build', tone: 'purple' },
  { label: 'Search', tone: 'blue' },
  { label: 'Launch', tone: 'red' },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5 },
};

function toneAt(index) {
  return READINESS_TONES[index % READINESS_TONES.length];
}

function parseIncluded(item) {
  const parts = item.split(' — ');
  if (parts.length >= 2) {
    return { title: parts[0], desc: parts.slice(1).join(' — ') };
  }
  return { title: item, desc: '' };
}

function ToneSection({ tone, eyebrow, title, subtitle, children, className = '' }) {
  return (
    <motion.section
      className={`dash-overview-section dash-overview-section--${tone} crp-readiness-full__section ${className}`.trim()}
      {...fadeUp}
    >
      {eyebrow && <p className="dash-overview-section__eyebrow">{eyebrow}</p>}
      {title && <h3 className="dash-overview-section__title">{title}</h3>}
      {subtitle && <p className="crp-readiness-full__lede">{subtitle}</p>}
      {children}
    </motion.section>
  );
}

function BulletList({ items }) {
  return (
    <ul className="crp-readiness-full__bullets">
      {items.map((item, i) => (
        <li key={item} className={`crp-readiness-full__bullet crp-readiness-full__bullet--${toneAt(i)}`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function OutputBox({ label, text, tone }) {
  return (
    <div className={`crp-readiness-full__output crp-readiness-full__output--${tone}`}>
      <p className="crp-readiness-full__output-label">{label}</p>
      <p className="crp-readiness-full__output-text">{text}</p>
    </div>
  );
}

export default function CRReadinessPage({ compact = false }) {
  const { d, t } = useLang();
  const fg = d('freeGuidance') || {};
  const cms = usePageCatalog('career-readiness');
  const phone = isPhoneViewport();
  const [showMore, setShowMore] = useState(!phone);
  const heroTitle = cmsText(cms, 'heroTitle', READINESS_HERO.title);
  const heroSubtitle = cmsText(cms, 'heroSubtitle', READINESS_HERO.subtitle);
  const statItems = [
    { label: '8 Sessions', sub: 'Live training', icon: statIcons[0] },
    { label: 'Reviews', sub: 'LinkedIn + CV + Naukri', icon: statIcons[1] },
    { label: 'Mock', sub: 'Interview practice', icon: statIcons[2] },
    { label: '90 Days', sub: 'Launch plan', icon: statIcons[3] },
  ];

  const rootClass = compact
    ? 'crp-launchpad crp-readiness-v3 crp-readiness-full'
    : 'py-16 max-w-7xl mx-auto px-4 crp-readiness-full';

  return (
    <section className={rootClass}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={compact ? 'crp-launchpad__intro' : 'text-center mb-10'}
      >
        {compact && <div className="crp-launchpad__rocket"><span>🎯</span></div>}
        <div className={compact ? 'crp-launchpad__intro-copy' : ''}>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-800 text-sm px-4 py-2 mb-3 font-semibold">
            <Sparkles className="w-4 h-4" /> {READINESS_HERO.badge}
          </span>
          <h2 className={compact ? 'crp-launchpad__heading' : 'section-title'}>
            {heroTitle}
          </h2>
          <p className={compact ? 'crp-launchpad__intro-sub' : 'text-lg mt-3 max-w-3xl mx-auto'}>
            {heroSubtitle}
          </p>
        </div>
        <div className={compact ? 'crp-launchpad__meta' : 'flex justify-center gap-3 mt-6'}>
          <span className="crp-launchpad__chip"><Clock className="w-4 h-4" /> 8 live sessions</span>
          <Link to="/marketplace?tab=training" className="crp-launchpad__chip crp-launchpad__chip--cta">
            Book Now <ArrowRight className="w-4 h-4" />
          </Link>
          {compact && (
            <GuidanceCTA className="crp-launchpad__chip crp-launchpad__chip--cta">
              Free guidance call
            </GuidanceCTA>
          )}
        </div>
      </motion.div>

      {compact && <CRPStatsStrip statItems={statItems} />}

      {compact && (
        <motion.div className="crp-readiness-flow" {...fadeUp}>
          <p className="crp-readiness-flow__label">Your 5-step launch system</p>
          <div className="crp-readiness-flow__track">
            {FLOW_STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                className={`crp-readiness-flow__step crp-readiness-flow__step--${step.tone}`}
                whileHover={{ y: -6, scale: 1.04 }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <span className="crp-readiness-flow__num">{i + 1}</span>
                <span>{step.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {!compact && <CRPStatsStrip statItems={statItems} />}

      <ToneSection tone="orange" className="crp-readiness-full__intro-block">
        {READINESS_HERO.intro.map((p) => (
          <p key={p} className="crp-readiness-full__para">{p}</p>
        ))}
      </ToneSection>

      <ToneSection
        tone="green"
        title={READINESS_SYSTEM.title}
        className="mt-4"
      >
        {READINESS_SYSTEM.paragraphs.map((p) => (
          <p key={p} className="crp-readiness-full__para">{p}</p>
        ))}
        <div className="crp-readiness-v3__arc crp-readiness-full__journey">
          <p className="crp-readiness-v3__arc-label">{READINESS_SYSTEM.journeyLabel}</p>
          <p className="crp-readiness-v3__arc-flow">{READINESS_SYSTEM.journeyFlow}</p>
          <ul className="crp-readiness-full__journey-steps">
            {READINESS_SYSTEM.journeySteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      </ToneSection>

      <ToneSection tone="purple" title="What's included?" eyebrow="Program inclusions" className="mt-4">
        <ul className="crp-outcomes-cards">
          {READINESS_INCLUDED.map((item, i) => {
            const { title, desc } = parseIncluded(item);
            return (
              <motion.li
                key={item}
                className="crp-outcomes-cards__item"
                whileHover={{ y: -3 }}
                {...fadeUp}
              >
                <span className={`crp-outcomes-cards__icon crp-outcomes-cards__icon--${(i % 8) + 1}`}>✓</span>
                <span className="crp-outcomes-cards__copy">
                  <strong>{title}</strong>
                  {desc && <span className="block text-sm mt-1 opacity-90">{desc}</span>}
                </span>
              </motion.li>
            );
          })}
        </ul>
      </ToneSection>

      {phone && !showMore && (
        <div className="mobile-home-more-wrap">
          <button
            type="button"
            className="mobile-home-more-btn"
            onClick={() => setShowMore(true)}
          >
            {t('mobileNav.showMore')}
            <ChevronDown className="w-4 h-4" aria-hidden />
          </button>
        </div>
      )}

      {showMore && (
      <>
      <div className="crp-launchpad__sprints mt-5">
        <div className="crp-launchpad__section-head">
          <h2 className="crp-launchpad__section-title">The 8-Session Career Journey</h2>
        </div>
        <div className="crp-readiness-full__sessions">
          {READINESS_SESSIONS.map((session, i) => {
            const tone = toneAt(i);
            return (
              <motion.article
                key={session.number}
                className={`crp-readiness-full__session crp-readiness-full__session--${tone}${compact ? ' crp-readiness-full__session--visual' : ''}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.04 }}
                whileHover={compact ? { y: -4 } : undefined}
              >
                {compact && (
                  <div className="crp-readiness-full__session-visual">
                    <img src={SESSION_PHOTOS[i]} alt="" loading="lazy" />
                    {SESSION_STICKERS[i] && (
                      <img
                        src={SESSION_STICKERS[i]}
                        alt=""
                        className="crp-readiness-full__session-sticker"
                        loading="lazy"
                      />
                    )}
                    <span className={`crp-readiness-full__session-badge crp-readiness-full__session-badge--${tone}`}>
                      Session {session.number}
                    </span>
                  </div>
                )}
                <div className="crp-readiness-full__session-body">
                <div className="crp-readiness-full__session-head">
                  <span className="crp-readiness-full__session-num">
                    SESSION {String(session.number).padStart(2, '0')}
                  </span>
                  <h3 className="crp-readiness-full__session-title">{session.title}</h3>
                  <p className="crp-readiness-full__session-sub">{session.subtitle}</p>
                </div>
                <p className="crp-readiness-full__para">{session.intro}</p>
                <p className="crp-readiness-full__work-label">
                  {session.number === 5 || session.number === 6 || session.number === 8
                    ? "You'll learn:"
                    : session.number === 7
                      ? "You'll master:"
                      : "You'll work on:"}
                </p>
                <BulletList items={session.workOn} />
                <OutputBox label="Your output" text={session.output} tone={tone} />
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      <ToneSection
        tone="blue"
        title="Personal Profile Reviews"
        subtitle="Your career profile shouldn't just exist. It should work for you."
        eyebrow="Profile reviews"
        className="mt-5"
      >
        <p className="crp-readiness-full__para">
          Your professional profiles are often the first impression recruiters get. That&apos;s why the program includes personalised profile reviews.
        </p>
        <div className="crp-readiness-full__reviews-grid">
          {PROFILE_REVIEWS.map((review, i) => (
            <div key={review.title} className={`dash-overview-card dash-overview-card--${toneAt(i)}`}>
              <h4 className="font-bold text-base mb-2">{review.title}</h4>
              {review.intro && <p className="text-sm crp-readiness-full__meta mb-2">{review.intro}</p>}
              <p className="text-xs font-bold uppercase tracking-wide mb-2 opacity-80">We review:</p>
              <BulletList items={review.items} />
              <OutputBox label="Result" text={review.result} tone={toneAt(i)} />
            </div>
          ))}
        </div>
      </ToneSection>

      <ToneSection tone="red" title={MOCK_INTERVIEW.title} subtitle={MOCK_INTERVIEW.subtitle} className="mt-6">
        <p className="crp-readiness-full__para">{MOCK_INTERVIEW.intro}</p>
        <p className="text-xs font-bold uppercase tracking-wide mb-2 opacity-80">We evaluate:</p>
        <div className="crp-readiness-full__eval-grid">
          {MOCK_INTERVIEW.evaluate.map((item, i) => (
            <div key={item.label} className={`dash-overview-card dash-overview-card--${toneAt(i)}`}>
              <p className="font-bold">{item.label}</p>
              <p className="text-sm crp-readiness-full__meta mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
        <OutputBox label="You receive" text={MOCK_INTERVIEW.output} tone="red" />
      </ToneSection>

      <ToneSection tone="orange" title={PERSONAL_BRANDING.title} subtitle={PERSONAL_BRANDING.subtitle} className="mt-6">
        <p className="crp-readiness-full__para">{PERSONAL_BRANDING.intro}</p>
        <BulletList items={PERSONAL_BRANDING.channels} />
        <p className="text-xs font-bold uppercase tracking-wide mt-4 mb-2 opacity-80">You&apos;ll build:</p>
        <div className="crp-readiness-full__eval-grid">
          {PERSONAL_BRANDING.build.map((item, i) => (
            <div key={item.title} className={`dash-overview-card dash-overview-card--${toneAt(i + 1)}`}>
              <p className="font-bold">{item.title}</p>
              <p className="text-sm crp-readiness-full__meta mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </ToneSection>

      <ToneSection tone="green" title={AI_TOOLKIT.title} subtitle={AI_TOOLKIT.subtitle} className="mt-6">
        <p className="crp-readiness-full__para">{AI_TOOLKIT.intro}</p>
        <p className="text-xs font-bold uppercase tracking-wide mb-2 opacity-80">Use AI for:</p>
        <BulletList items={AI_TOOLKIT.uses} />
        <p className="crp-readiness-full__emphasis mt-4">{AI_TOOLKIT.footer}</p>
      </ToneSection>

      <ToneSection tone="purple" title={JOB_SEARCH_SYSTEM.title} subtitle={JOB_SEARCH_SYSTEM.subtitle} className="mt-6">
        <p className="crp-readiness-full__para">{JOB_SEARCH_SYSTEM.intro}</p>
        <p className="text-xs font-bold uppercase tracking-wide mb-2 opacity-80">You&apos;ll learn how to:</p>
        <BulletList items={JOB_SEARCH_SYSTEM.learn} />
        <OutputBox label="Your result" text={JOB_SEARCH_SYSTEM.result} tone="purple" />
      </ToneSection>

      <ToneSection tone="blue" title={INTERVIEW_KIT.title} subtitle={INTERVIEW_KIT.subtitle} className="mt-6">
        <p className="crp-readiness-full__para">
          You&apos;ll build your personal interview preparation system including:
        </p>
        <BulletList items={INTERVIEW_KIT.items} />
      </ToneSection>

      <ToneSection tone="red" title={OFFER_GUIDANCE.title} subtitle={OFFER_GUIDANCE.subtitle} className="mt-6">
        <p className="crp-readiness-full__para">Learn how to evaluate an opportunity from multiple perspectives.</p>
        <p className="text-xs font-bold uppercase tracking-wide mb-2 opacity-80">Evaluate:</p>
        <BulletList items={OFFER_GUIDANCE.evaluate} />
        <p className="text-xs font-bold uppercase tracking-wide mt-4 mb-2 opacity-80">You&apos;ll also learn:</p>
        <BulletList items={OFFER_GUIDANCE.learn} />
      </ToneSection>

      <ToneSection tone="orange" title={NINETY_DAY_PLAN.title} subtitle={NINETY_DAY_PLAN.subtitle} className="mt-6">
        <p className="crp-readiness-full__para">{NINETY_DAY_PLAN.intro}</p>
        <div className="crp-readiness-full__phases">
          {NINETY_DAY_PLAN.phases.map((phase, i) => (
            <div key={phase.label} className={`dash-overview-card dash-overview-card--${toneAt(i)}`}>
              <p className="font-bold">{phase.label}</p>
              <p className="text-sm crp-readiness-full__meta mt-1">{phase.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs font-bold uppercase tracking-wide mt-4 mb-2 opacity-80">You&apos;ll learn how to navigate:</p>
        <BulletList items={NINETY_DAY_PLAN.navigate} />
      </ToneSection>

      <ToneSection tone="green" title={CAREER_TOOLKIT.title} subtitle={CAREER_TOOLKIT.subtitle} className="mt-6">
        <div className="crp-readiness-full__toolkit-grid">
          {CAREER_TOOLKIT.groups.map((group, i) => (
            <div key={group.title} className={`dash-overview-card dash-overview-card--${toneAt(i)}`}>
              <h4 className="font-bold mb-2">{group.title}</h4>
              <BulletList items={group.items} />
            </div>
          ))}
        </div>
      </ToneSection>

      <ToneSection tone="purple" title={BONUS_RESOURCES.title} subtitle={BONUS_RESOURCES.subtitle} className="mt-6">
        <div className="crp-readiness-full__eval-grid">
          {BONUS_RESOURCES.items.map((item, i) => (
            <div key={item.title} className={`dash-overview-card dash-overview-card--${toneAt(i)}`}>
              <p className="font-bold">{item.title}</p>
              <p className="text-sm crp-readiness-full__meta mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </ToneSection>

      <ToneSection tone="blue" title="Why this program is different" eyebrow="Differentiators" className="mt-6">
        <div className="crp-readiness-full__eval-grid">
          {WHY_DIFFERENT.map((item, i) => (
            <div key={item.title} className={`dash-overview-card dash-overview-card--${toneAt(i)}`}>
              <p className="font-bold text-lg">{item.title}</p>
              <p className="text-sm crp-readiness-full__meta mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </ToneSection>

      <ToneSection tone="red" title="Who is this program for?" className="mt-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {READINESS_WHO.map((w, i) => (
            <div key={w.title} className={`dash-overview-card dash-overview-card--${toneAt(i)}`}>
              <p className="font-bold">{w.title}</p>
              <p className="text-sm crp-readiness-full__meta mt-1">{w.desc}</p>
            </div>
          ))}
        </div>
      </ToneSection>

      <ToneSection tone="orange" title="From confusion to career confidence" eyebrow="Transformation" className="mt-6">
        <div className="crp-readiness-full__before-after">
          {BEFORE_AFTER.map((row, i) => (
            <div key={row.before} className={`crp-readiness-full__ba-row crp-readiness-full__ba-row--${toneAt(i)}`}>
              <div className="crp-readiness-full__ba-col">
                <p className="crp-readiness-full__ba-label">Before</p>
                <p className="crp-readiness-full__ba-text">{row.before}</p>
              </div>
              <div className="crp-readiness-full__ba-col crp-readiness-full__ba-col--after">
                <p className="crp-readiness-full__ba-label">After</p>
                <p className="crp-readiness-full__ba-text">{row.after}</p>
              </div>
            </div>
          ))}
        </div>
      </ToneSection>

      <ToneSection tone="green" title="The complete experience" className="mt-6">
        <div className="crp-readiness-full__eval-grid">
          {COMPLETE_EXPERIENCE.map((item, i) => (
            <div key={item.title} className={`dash-overview-card dash-overview-card--${toneAt(i)}`}>
              <p className="font-bold">{item.title}</p>
              <p className="text-sm crp-readiness-full__meta mt-1 italic">{item.desc}</p>
            </div>
          ))}
        </div>
      </ToneSection>

      <motion.div
        className="dash-overview-section dash-overview-section--red crp-readiness-full__final-cta mt-5 text-center"
        {...fadeUp}
      >
        <h3 className="dash-overview-section__title">Your career should not be left to guesswork.</h3>
        <p className="crp-readiness-full__lede font-bold">DISCOVER. DECIDE. BUILD. SEARCH. PERFORM. LAUNCH.</p>
        <p className="crp-readiness-full__para mt-2">
          8 Sessions + 2 Mock Interviews. Personalised Reviews. Real Practice. Practical Tools. One Career Strategy.
        </p>
        <p className="crp-readiness-full__emphasis mt-3">Don&apos;t just prepare to get a job. Prepare to build a career.</p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link to="/dashboard?tab=assess&shop=career-readiness" className="crp-studio__btn crp-studio__btn--primary">
            Enrol Now <ArrowRight className="w-4 h-4" />
          </Link>
          <GuidanceCTA className="crp-studio__btn crp-studio__btn--ghost-dark">
            {fg.cta || 'Talk to a Career Counsellor'}
          </GuidanceCTA>
        </div>
      </motion.div>
      <CmsPageSections cms={cms} />
      </>
      )}
    </section>
  );
}
