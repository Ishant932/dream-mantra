import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, GraduationCap, Rocket } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { isMobilePerf } from '../utils/mobilePerf';

const AUTO_ROTATE_MS = 4200;

const easeSoft = [0.22, 1, 0.36, 1];

function ProcessPanel({ mod, exploreLabel, lite = false }) {
  if (!mod) return null;

  const stepList = {
    hidden: {},
    show: {
      transition: { staggerChildren: lite ? 0 : 0.045, delayChildren: lite ? 0 : 0.04 },
    },
  };
  const stepItem = {
    hidden: lite ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.32, ease: easeSoft },
    },
  };

  return (
    <div className="home-processes__module-card home-processes__module-card--panel">
      <div className="home-processes__module-head">
        <span className="home-processes__module-icon" aria-hidden>{mod.icon}</span>
        <h3 className="home-processes__module-title">{mod.title}</h3>
      </div>
      <motion.ol
        className="home-processes__module-steps"
        variants={stepList}
        initial="hidden"
        animate="show"
      >
        {mod.steps.map((label, i) => (
          <motion.li key={label} className="home-processes__module-step" variants={stepItem}>
            <span className="home-processes__module-step-num" aria-hidden>
              {i + 1}
            </span>
            <span>{label}</span>
          </motion.li>
        ))}
      </motion.ol>
      <Link to={mod.link} className="home-processes__link inline-flex items-center gap-2">
        {exploreLabel} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default function HomeHowDreamzWorks({
  heading,
  headingTitle,
  headingHighlight,
  pathwayToggle = true,
  showSubtitle = true,
  showGroupSubtitle = true,
  layout = 'default',
}) {
  const { d } = useLang();
  const copy = d('home.howDreamzWorks');
  const mobile = isMobilePerf();
  const isCounsellingLayout = layout === 'counselling';

  const counsellingMods = (copy.moduleProcesses || []).filter((m) => m.group !== 'training');
  const trainingMods = (copy.moduleProcesses || []).filter((m) => m.group === 'training');

  const [pathway, setPathway] = useState('counselling');
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const modules = pathway === 'counselling' ? counsellingMods : trainingMods;
  const active = modules[Math.min(activeIdx, Math.max(0, modules.length - 1))] || modules[0];
  const subtitle =
    pathway === 'counselling'
      ? copy.counsellingGroupSubtitle
      : copy.trainingGroupSubtitle;

  useEffect(() => {
    setActiveIdx(0);
    setPaused(false);
  }, [pathway]);

  useEffect(() => {
    if (paused || modules.length < 2) return undefined;
    const id = window.setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % modules.length);
    }, AUTO_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused, modules.length, pathway]);

  const panelTransition = mobile
    ? { duration: 0.22, ease: 'easeOut' }
    : { duration: 0.38, ease: easeSoft };

  const panelEnter = mobile
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.985 };
  const panelCenter = mobile
    ? { opacity: 1 }
    : { opacity: 1, scale: 1 };
  const panelExit = mobile
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.99 };

  return (
    <div className={`home-how-dreamz relative overflow-hidden no-reveal${isCounsellingLayout ? ' home-how-dreamz--counselling' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className={`text-center max-w-4xl mx-auto${isCounsellingLayout ? ' mb-5 lg:mb-6' : ' mb-6 lg:mb-8'}`}>
          <h2 className="home-headline home-headline--oneline mb-3">
            {headingTitle || headingHighlight ? (
              <>
                {headingTitle}
                {headingHighlight ? (
                  <>
                    {headingTitle ? ' ' : null}
                    <span className="gradient-text text-pop">{headingHighlight}</span>
                  </>
                ) : null}
              </>
            ) : heading ? (
              heading
            ) : (
              <>
                {copy.title}
                {copy.titleHighlight ? (
                  <>
                    {' '}
                    <span className="gradient-text text-pop">{copy.titleHighlight}</span>
                  </>
                ) : null}
              </>
            )}
          </h2>
          {showSubtitle ? (
            <p className="text-secondary-theme text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">{copy.subtitle}</p>
          ) : null}
        </div>

        <div className={`home-processes home-processes--chooser${isCounsellingLayout ? ' home-processes--counselling' : ''}`}>
          {pathwayToggle ? (
            <div
              className="home-processes__segment"
              role="tablist"
              aria-label={copy.choosePathwayLabel || 'Choose your path'}
            >
              <button
                type="button"
                role="tab"
                aria-selected={pathway === 'counselling'}
                className={`home-processes__segment-btn${pathway === 'counselling' ? ' is-active' : ''}`}
                onClick={() => setPathway('counselling')}
              >
                <GraduationCap className="w-4 h-4" aria-hidden />
                <span>{copy.counsellingGroupLabel || 'Counselling'}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={pathway === 'training'}
                className={`home-processes__segment-btn${pathway === 'training' ? ' is-active' : ''}`}
                onClick={() => setPathway('training')}
              >
                <Rocket className="w-4 h-4" aria-hidden />
                <span>{copy.trainingGroupLabel || 'Training & Placement'}</span>
              </button>
            </div>
          ) : null}

          {showGroupSubtitle ? (
            <div className="home-processes__chooser-sub-wrap">
              <AnimatePresence mode="wait">
                {subtitle ? (
                  <motion.p
                    key={pathway}
                    className="home-processes__chooser-sub"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    {subtitle}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>
          ) : null}

          <div
            className={`home-processes__chooser-body${modules.length > 1 ? ' home-processes__chooser-body--with-nav' : ''}`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {modules.length > 1 ? (
              isCounsellingLayout ? (
                <div className="home-processes__nav-col">
                  <div
                    className="home-processes__tabs"
                    role="tablist"
                    aria-label={
                      pathway === 'counselling'
                        ? copy.counsellingGroupLabel || 'Counselling'
                        : copy.trainingGroupLabel || 'Training & Placement'
                    }
                  >
                    {modules.map((mod, i) => (
                      <button
                        key={mod.id}
                        type="button"
                        role="tab"
                        aria-selected={activeIdx === i}
                        onClick={() => {
                          setActiveIdx(i);
                          setPaused(true);
                        }}
                        className={`home-processes__tab${activeIdx === i ? ' home-processes__tab--active' : ''}`}
                      >
                        <span className="home-processes__tab-icon" aria-hidden>{mod.icon}</span>
                        <span className="home-processes__tab-label">{mod.title}</span>
                      </button>
                    ))}
                  </div>
                  <div className="home-processes__dots" aria-hidden>
                    {modules.map((mod, i) => (
                      <span
                        key={mod.id}
                        className={`home-processes__dot${activeIdx === i ? ' home-processes__dot--active' : ''}`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className="home-processes__tabs"
                  role="tablist"
                  aria-label={
                    pathway === 'counselling'
                      ? copy.counsellingGroupLabel || 'Counselling'
                      : copy.trainingGroupLabel || 'Training & Placement'
                  }
                >
                  {modules.map((mod, i) => (
                    <button
                      key={mod.id}
                      type="button"
                      role="tab"
                      aria-selected={activeIdx === i}
                      onClick={() => {
                        setActiveIdx(i);
                        setPaused(true);
                      }}
                      className={`home-processes__tab${activeIdx === i ? ' home-processes__tab--active' : ''}`}
                    >
                      <span className="home-processes__tab-icon" aria-hidden>{mod.icon}</span>
                      <span className="home-processes__tab-label">{mod.title}</span>
                    </button>
                  ))}
                </div>
              )
            ) : null}

            <div className="home-processes__panel" role="tabpanel">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${pathway}-${active?.id || activeIdx}`}
                  className="home-processes__panel-anim"
                  initial={panelEnter}
                  animate={panelCenter}
                  exit={panelExit}
                  transition={panelTransition}
                >
                  <ProcessPanel mod={active} exploreLabel={copy.exploreModule} lite={mobile} />
                </motion.div>
              </AnimatePresence>
            </div>

            {!isCounsellingLayout && modules.length > 1 ? (
              <div className="home-processes__dots" aria-hidden>
                {modules.map((mod, i) => (
                  <span
                    key={mod.id}
                    className={`home-processes__dot${activeIdx === i ? ' home-processes__dot--active' : ''}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
