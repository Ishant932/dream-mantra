import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Fingerprint,
  LogIn,
  MessageCircle,
  Rocket,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { programs as programImages } from '../data/content';

const PROBLEM_PREVIEW = 8;

const MODULE_ICONS = {
  dmit: Fingerprint,
  psychometric: BarChart3,
  combo: Brain,
  crp: Rocket,
  counselling: MessageCircle,
};

const panelMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

function resolvePurchasePath(mod) {
  if (!mod) return '/dashboard?tab=assess';
  if (mod.purchasePath) return mod.purchasePath;
  if (mod.productSlug) return `/dashboard?tab=assess&shop=${mod.productSlug}`;
  return mod.link || '/dashboard?tab=assess';
}

export default function AgePathwaysWorkspace() {
  const { d } = useLang();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const copy = d('pages.program');
  const tabsCopy = d('pages.counselling.tabs.programs');
  const detailsMap = d('data.programDetails');

  const ages = useMemo(
    () => d('programs').map((p, i) => ({ ...programImages[i], ...p })),
    [d],
  );

  const ageParam = new URLSearchParams(location.search).get('age');
  const activeSlug = ages.some((a) => a.slug === ageParam) ? ageParam : ages[0]?.slug;

  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [problemsExpanded, setProblemsExpanded] = useState(false);

  const details = activeSlug ? detailsMap?.[activeSlug] : null;
  const modules = details?.modules || [];
  const problems = details?.problems || [];
  const benefits = details?.benefits || details?.struggleGoals || [];

  useEffect(() => {
    if (!activeSlug) return;
    const params = new URLSearchParams(location.search);
    if (params.get('age') === activeSlug) return;
    params.set('tab', 'programs');
    params.set('age', activeSlug);
    params.delete('pathway');
    navigate({ pathname: location.pathname, search: `?${params.toString()}` }, { replace: true, preventScrollReset: true });
  }, [activeSlug, location.pathname, location.search, navigate]);

  useEffect(() => {
    setSelectedModuleId(null);
    setProblemsExpanded(false);
  }, [activeSlug]);

  const selectedModule = modules.find((m) => m.id === selectedModuleId) || null;
  const isLoggedIn = !!user;
  const step = !activeSlug ? 1 : !selectedModule ? 2 : !isLoggedIn ? 3 : 4;

  const setAge = (slug) => {
    const params = new URLSearchParams(location.search);
    params.set('tab', 'programs');
    params.set('age', slug);
    params.delete('pathway');
    navigate({ pathname: location.pathname, search: `?${params.toString()}` }, { replace: false, preventScrollReset: true });
  };

  const goBook = () => {
    if (!selectedModule) return;
    const purchasePath = resolvePurchasePath(selectedModule);
    if (!isLoggedIn) {
      navigate('/login', {
        state: {
          from: purchasePath,
          notice: copy.loginPayNotice || 'Sign in to continue to payment for your selected module.',
        },
      });
      return;
    }
    navigate(purchasePath);
  };

  const visibleProblems = problemsExpanded ? problems : problems.slice(0, PROBLEM_PREVIEW);
  const hasMoreProblems = problems.length > PROBLEM_PREVIEW;

  const activeAge = ages.find((a) => a.slug === activeSlug);

  return (
    <div className="age-pathways-workspace dm-saas why-saas why-saas--compact">
      <div className="age-pathways-workspace__intro text-center mx-auto mb-5 px-1">
        <span className="why-saas__label">
          <Sparkles className="w-3.5 h-3.5" /> {tabsCopy.badge}
        </span>
        <h2 className="why-saas__heading mt-3 mb-2">{tabsCopy.title}</h2>
        <p className="age-pathways-workspace__desc why-saas__lede">{tabsCopy.desc}</p>
      </div>

      <div className="age-pathways-window" role="region" aria-label={copy.workspaceLabel || 'Age pathways'}>
        <div className="age-pathways-tabs" role="tablist" aria-label={copy.ageTabsLabel || 'Age groups'}>
          {ages.map((age) => {
            const selected = age.slug === activeSlug;
            return (
              <button
                key={age.slug}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`age-pathways-tab ${selected ? 'age-pathways-tab--active' : ''}`}
                onClick={() => setAge(age.slug)}
              >
                <span className="age-pathways-tab__title">{age.title}</span>
                <span className="age-pathways-tab__sub">{age.subtitle}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlug}
            {...panelMotion}
            className="age-pathways-panel"
            role="tabpanel"
          >
            <div className="age-pathways-panel__intro">
              <h3 className="age-pathways-panel__title">
                {activeAge?.title}
                {activeAge?.subtitle ? (
                  <span className="age-pathways-panel__subtitle"> · {activeAge.subtitle}</span>
                ) : null}
              </h3>
              <p className="age-pathways-panel__desc">{details?.desc}</p>
            </div>

            <section className="age-pathways-section age-pathways-section--problems">
              <div className="age-pathways-section__head">
                <span className="age-pathways-section__icon age-pathways-section__icon--problems" aria-hidden>
                  <AlertCircle className="w-5 h-5" />
                </span>
                <div>
                  <p className="age-pathways-section__eyebrow">{copy.problemsLabel}</p>
                  <h4 className="age-pathways-section__title">{copy.challengesTitle}</h4>
                </div>
              </div>
              <ul className="age-pathways-list age-pathways-list--problems">
                {visibleProblems.map((problem, i) => (
                  <li key={problem.slice(0, 48)}>
                    <span className="age-pathways-problem__num" aria-hidden>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="age-pathways-problem__text">{problem}</span>
                  </li>
                ))}
              </ul>
              {hasMoreProblems && (
                <button
                  type="button"
                  className="age-pathways-show-more"
                  onClick={() => setProblemsExpanded((v) => !v)}
                >
                  {problemsExpanded
                    ? copy.showLessProblems || 'Show less'
                    : (copy.showMoreProblems || `Show ${problems.length - PROBLEM_PREVIEW} more`)}
                  <ChevronDown className={`w-4 h-4 ${problemsExpanded ? 'rotate-180' : ''}`} />
                </button>
              )}
            </section>

            <section className="age-pathways-section age-pathways-section--benefits">
              <div className="age-pathways-section__head">
                <span className="age-pathways-section__icon age-pathways-section__icon--benefits" aria-hidden>
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <p className="age-pathways-section__eyebrow">{copy.benefitsLabel || 'Benefits'}</p>
                  <h4 className="age-pathways-section__title">
                    {copy.benefitsTitle || 'What you gain'}
                  </h4>
                </div>
              </div>
              <ul className="age-pathways-list age-pathways-list--benefits">
                {benefits.map((benefit) => (
                  <li key={benefit.slice(0, 48)}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="age-pathways-section age-pathways-section--solutions" id="age-solutions">
              <div className="age-pathways-section__head">
                <span className="age-pathways-section__icon age-pathways-section__icon--solutions" aria-hidden>
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <p className="age-pathways-section__eyebrow">{copy.solutionsLabel || 'Solutions offered'}</p>
                  <h4 className="age-pathways-section__title">
                    {copy.solutionsTitle || 'Choose a module to continue'}
                  </h4>
                </div>
              </div>
              <div className="age-pathways-modules" role="radiogroup" aria-label={copy.solutionsTitle || 'Modules'}>
                {modules.map((mod) => {
                  const selected = selectedModuleId === mod.id;
                  const ModIcon = MODULE_ICONS[mod.id] || Sparkles;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`age-pathways-module ${selected ? 'age-pathways-module--selected' : ''}`}
                      onClick={() => setSelectedModuleId(mod.id)}
                    >
                      <span className="age-pathways-module__icon" aria-hidden>
                        <ModIcon className="w-5 h-5" />
                      </span>
                      <span className="age-pathways-module__body">
                        <span className="age-pathways-module__name">
                          {mod.name}
                          {mod.optional ? (
                            <span className="age-pathways-module__optional">{copy.optionalBadge}</span>
                          ) : null}
                        </span>
                        <span className="age-pathways-module__tagline">{mod.tagline}</span>
                      </span>
                      <span className={`age-pathways-module__check ${selected ? 'is-on' : ''}`} aria-hidden />
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="age-pathways-book">
              <button
                type="button"
                className="btn-primary age-pathways-book__cta"
                disabled={!selectedModule}
                onClick={goBook}
              >
                {isLoggedIn
                  ? (copy.bookContinuePay || 'Book Now — Continue to Payment')
                  : (copy.bookLoginPay || 'Book Now — Login & Pay')}
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="age-pathways-book__hint">
                {selectedModule
                  ? (copy.bookSelectedHint || 'Next: unlock this module with login and payment.')
                  : (copy.bookSelectHint || 'Select a solution above to enable Book Now.')}
              </p>
              {selectedModule?.link && selectedModule.link !== resolvePurchasePath(selectedModule) && (
                <Link to={selectedModule.link} className="age-pathways-book__soft">
                  {copy.exploreModule} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </section>
          </motion.div>
        </AnimatePresence>

        <div className="age-pathways-stepper" aria-label={copy.stepperLabel || 'What’s next'}>
          <p className="age-pathways-stepper__label">{copy.whatsNext || 'What’s next'}</p>
          <ol className="age-pathways-steps">
            {[
              { n: 1, label: copy.stepAge || 'Pick age', action: () => {} },
              {
                n: 2,
                label: copy.stepModule || 'Choose module',
                action: () => document.getElementById('age-solutions')?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
              },
              {
                n: 3,
                label: copy.stepLogin || 'Login',
                action: () => {
                  if (!selectedModule) return;
                  if (isLoggedIn) return;
                  goBook();
                },
              },
              {
                n: 4,
                label: copy.stepPay || 'Pay',
                action: () => {
                  if (!selectedModule || !isLoggedIn) return;
                  goBook();
                },
              },
            ].map((s) => {
              const done = step > s.n;
              const current = step === s.n;
              const clickable =
                (s.n === 2 && !!activeSlug) ||
                (s.n === 3 && !!selectedModule && !isLoggedIn) ||
                (s.n === 4 && !!selectedModule && isLoggedIn);
              return (
                <li key={s.n}>
                  <button
                    type="button"
                    className={`age-pathways-step ${done ? 'is-done' : ''} ${current ? 'is-current' : ''}`}
                    disabled={!clickable && s.n !== 1}
                    onClick={s.action}
                  >
                    <span className="age-pathways-step__num">
                      {done ? <CheckCircle2 className="w-4 h-4" /> : s.n === 3 ? <LogIn className="w-3.5 h-3.5" /> : s.n === 4 ? <CreditCard className="w-3.5 h-3.5" /> : s.n}
                    </span>
                    <span className="age-pathways-step__text">{s.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
