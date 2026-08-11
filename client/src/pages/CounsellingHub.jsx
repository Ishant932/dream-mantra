import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { counsellingPath, parseCounsellingPath } from '../utils/pathRoutes';
import GuidanceCTA from '../components/GuidanceCTA';
import { useGuidanceModal } from '../context/GuidanceModalContext';
import { programs as programImages } from '../data/content';
import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import CmsPageSections from '../components/CmsPageSections';
import { cmsText, usePageCatalog } from '../hooks/usePageCatalog';
import AgePathwaysSection, { InstitutionsPathways } from '../components/AgePathwaysSection';
import HomeHowDreamzWorks from '../components/HomeHowDreamzWorks';
import HomeWhyCounselling from '../components/HomeWhyCounselling';
import { animations } from '../utils/animations';
import WhyCounsellingPanel from '../components/WhyCounsellingPanel';
import DMITPage from './DMITPage';
import PsychometricPage from './PsychometricPage';
import DMPsychometricPage from './DMPsychometricPage';
import {
  ArrowRight,
  BookOpenCheck,
  Brain,
  Briefcase,
  Building2,
  Calendar,
  Compass,
  Fingerprint,
  GraduationCap,
  HeartHandshake,
  LayoutGrid,
  Layers,
  LogIn,
  ShieldCheck,
  Target,
  TrendingUp,
  User,
} from 'lucide-react';

const { tabFadeUp } = animations;

function splitCounsellingTitle(title) {
  const raw = (title || 'Counselling').trim();
  if (/\s&\s/.test(raw)) {
    const parts = raw.split(/\s*&\s*/);
    return { lead: `${parts[0]} &`, accent: parts.slice(1).join(' & ') };
  }
  const words = raw.split(/\s+/);
  if (words.length < 2) return { lead: '', accent: raw };
  return { lead: words.slice(0, -1).join(' '), accent: words[words.length - 1] };
}

const TAB_ICONS = {
  overview: LayoutGrid,
  why: HeartHandshake,
  dmit: Fingerprint,
  psychometric: Brain,
  combo: Layers,
  programs: GraduationCap,
  institutions: Building2,
};

const PROCESS_STEP_ICONS = [Fingerprint, Brain, BookOpenCheck, TrendingUp, ShieldCheck];
const PROCESS_STEP_TONES = ['red', 'purple', 'green', 'blue', 'orange'];

const AGE_CARD_STYLES = [
  { Icon: GraduationCap, tone: 'emerald' },
  { Icon: Brain, tone: 'pink' },
  { Icon: Target, tone: 'blue' },
  { Icon: Compass, tone: 'orange' },
  { Icon: User, tone: 'teal' },
  { Icon: Briefcase, tone: 'purple' },
];

export default function CounsellingHub() {
  const { t, d } = useLang();
  const fg = d('freeGuidance') || {};
  const counsellingTabs = d('data.counsellingTabs');
  const processSteps = d('data.processSteps');
  const counsellingPage = d('pages.counselling');
  const tabs = counsellingPage.tabs;
  const overview = tabs.overview;
  const location = useLocation();
  const navigate = useNavigate();
  const { openGuidance } = useGuidanceModal();
  const cms = usePageCatalog('counselling');

  const parsed = parseCounsellingPath(location.pathname, location.search);
  const tab = parsed.tab || 'overview';
  const programAge = parsed.age || null;

  useEffect(() => {
    if (parsed.redirect) {
      navigate(parsed.redirect, { replace: true, preventScrollReset: true });
    }
  }, [parsed.redirect, navigate]);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    if (p.get('pathway') === 'institutions') {
      navigate(counsellingPath('institutions'), { replace: true, preventScrollReset: true });
      return;
    }
    if (p.get('tab') === 'book') {
      navigate(counsellingPath('overview'), { replace: true, preventScrollReset: true });
      openGuidance();
    }
  }, [location.search, navigate, openGuidance]);

  const setTab = (tabId) => {
    navigate(counsellingPath(tabId), { replace: true, preventScrollReset: true });
  };

  const ages = useMemo(
    () => d('programs').map((p, i) => ({ ...programImages[i], ...p })),
    [d],
  );

  const counsellingTitle = splitCounsellingTitle(cmsText(cms, 'heroTitle', counsellingPage.title));
  const counsellingSubtitle = cmsText(cms, 'heroSubtitle', counsellingPage.subtitle);
  const nextStepTitle = counsellingPage.nextStepTitle || 'Ready for personal guidance?';
  const nextStepDesc =
    counsellingPage.nextStepDesc ||
    'Talk to a counsellor — no commitment. We’ll help you choose the right next step.';
  const processSection = (
    <motion.section {...tabFadeUp} className="counselling-overview__process">
      <div className="counselling-overview__process-head">
        <h2 className="home-headline home-headline--oneline mb-2">
          How <span className="gradient-text text-pop">counselling</span> works
        </h2>
      </div>
      <ol className="counselling-overview__timeline">
        {(processSteps || []).map((step, i) => {
          const StepIcon = PROCESS_STEP_ICONS[i] || Fingerprint;
          const stepTone = PROCESS_STEP_TONES[i % PROCESS_STEP_TONES.length];
          return (
            <motion.li
              key={step.title}
              className={`counselling-overview__timeline-step counselling-overview__timeline-step--${stepTone}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="counselling-overview__timeline-node" aria-hidden>
                <span className="counselling-overview__timeline-icon">
                  <StepIcon className="w-5 h-5" />
                </span>
                <span className="counselling-overview__timeline-num">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="counselling-overview__timeline-copy">
                <h3 className="counselling-overview__timeline-title">{step.title}</h3>
                {step.points?.length > 0 ? (
                  <ul className="counselling-overview__timeline-points">
                    {step.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : (
                  step.desc && (
                    <p className="counselling-overview__timeline-desc">{step.desc}</p>
                  )
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </motion.section>
  );

  return (
    <div className="counselling-hub-page counselling-hub-page--tight no-reveal">
      <header className="counselling-masthead">
        <div className="counselling-masthead__overlay" aria-hidden />
        <motion.div {...tabFadeUp} className="counselling-masthead__inner">
          <div className="counselling-masthead__copy">
            <h1 className="counselling-masthead__title font-accent">
              {counsellingTitle.lead}
              {counsellingTitle.lead ? ' ' : null}
              {counsellingTitle.accent ? (
                <span className="counselling-masthead__title-accent">{counsellingTitle.accent}</span>
              ) : null}
            </h1>
            <p className="counselling-masthead__subtitle">{counsellingSubtitle}</p>
            <div className="counselling-masthead__actions">
              <GuidanceCTA className="counselling-masthead__btn counselling-masthead__btn--primary">
                <Calendar className="w-4 h-4" aria-hidden />
                {counsellingPage.cta}
                <ArrowRight className="w-4 h-4" />
              </GuidanceCTA>
              <Link to="/signup" className="counselling-masthead__btn counselling-masthead__btn--ghost">
                <LogIn className="w-4 h-4" aria-hidden />
                {fg.login || 'Sign in to know more'}
              </Link>
            </div>
          </div>
        </motion.div>
      </header>

      <CmsPageSections cms={cms} className="!py-8" />
      <div className="counselling-hub-page__body max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="counselling-shell counselling-shell--guide">
        <nav className="counselling-tabs" aria-label="Counselling sections" role="tablist">
          {counsellingTabs.map((item) => {
            const Icon = TAB_ICONS[item.id] || LayoutGrid;
            const active = tab === item.id;
            const featured = ['dmit', 'psychometric', 'combo', 'why'].includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`counselling-tabs__item counselling-tabs__item--${item.id}${featured ? ' counselling-tabs__item--featured' : ''}${active ? ' is-active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                <span className="counselling-tabs__icon" aria-hidden>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="counselling-tabs__label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="counselling-shell__panel" role="tabpanel">
          {tab === 'overview' && (
            <div className="counselling-overview space-y-12 lg:space-y-16">
              <CmsPageSections cms={cms} />
              <section className="counselling-overview__why-home">
                <HomeWhyCounselling />
              </section>

              {processSection}

              <section className="counselling-overview__products counselling-overview__how">
                <HomeHowDreamzWorks
                  headingTitle="Counselling"
                  headingHighlight="Process"
                  pathwayToggle={false}
                  showSubtitle={false}
                  showGroupSubtitle={false}
                  layout="counselling"
                />
              </section>

              <motion.section
                {...tabFadeUp}
                transition={{ delay: 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="counselling-overview__ages"
              >
                <div className="counselling-overview__head">
                  <div>
                    <p className="counselling-overview__eyebrow">
                      {overview.agesEyebrow || 'Who we counsel'}
                    </p>
                    <h2 className="section-title mb-2">
                      {overview.agesTitle || 'Ages we do counselling for'}
                    </h2>
                    <p className="text-sand-600 text-base sm:text-lg max-w-2xl leading-relaxed">
                      {overview.agesDesc || 'From Class 1 to working professionals — pick your stage.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="counselling-overview__more"
                    onClick={() => setTab('programs')}
                  >
                    {overview.exploreMore || t('common.knowMore')} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="counselling-overview__age-grid" role="list">
                  {ages.map((age, i) => {
                    const style = AGE_CARD_STYLES[i % AGE_CARD_STYLES.length];
                    const AgeIcon = style.Icon;
                    return (
                      <Link
                        key={age.slug}
                        role="listitem"
                        to={counsellingPath('programs', { age: age.slug })}
                        preventScrollReset
                        className={`counselling-overview__age-card counselling-overview__age-card--${style.tone}`}
                      >
                        <span className="counselling-overview__age-icon" aria-hidden>
                          <AgeIcon className="w-5 h-5" />
                        </span>
                        <span className="counselling-overview__age-title">{age.title}</span>
                        <span className="counselling-overview__age-sub">{age.subtitle}</span>
                      </Link>
                    );
                  })}
                </div>
              </motion.section>

              <motion.aside
                {...tabFadeUp}
                transition={{ delay: 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="counselling-next"
              >
                <div className="counselling-next__copy">
                  <p className="counselling-next__eyebrow">
                    {counsellingPage.nextStepEyebrow || 'Your next step'}
                  </p>
                  <h2 className="counselling-next__title">{nextStepTitle}</h2>
                  <p className="counselling-next__desc">{nextStepDesc}</p>
                </div>
                <GuidanceCTA className="btn-primary counselling-next__cta">
                  {counsellingPage.cta}
                  <ArrowRight className="w-4 h-4" />
                </GuidanceCTA>
              </motion.aside>
            </div>
          )}

          {tab === 'why' && <WhyCounsellingPanel compact />}

          {tab === 'dmit' && <DMITPage compact />}

          {tab === 'psychometric' && <PsychometricPage compact />}

          {tab === 'combo' && <DMPsychometricPage compact />}

          {tab === 'programs' && <AgePathwaysSection />}

          {tab === 'institutions' && <InstitutionsPathways />}
        </div>
      </div>
      </div>
    </div>
  );
}
