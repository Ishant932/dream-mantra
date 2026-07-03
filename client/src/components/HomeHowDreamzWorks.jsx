import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { isMobilePerf } from '../utils/mobilePerf';

const panelVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.3 } },
};

const panelVariantsLite = {
  initial: { opacity: 1, x: 0 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 1, x: 0, transition: { duration: 0.2 } },
};

export default function HomeHowDreamzWorks() {
  const { d } = useLang();
  const copy = d('home.howDreamzWorks');
  const mobile = isMobilePerf();
  const [activeStep, setActiveStep] = useState(0);
  const [activeModule, setActiveModule] = useState(0);

  const pickStep = (i) => {
    setActiveStep(i);
    setActiveModule(i % copy.moduleProcesses.length);
  };

  const pickModule = (i) => {
    setActiveModule(i);
    setActiveStep(Math.min(i, copy.steps.length - 1));
  };

  useEffect(() => {
    if (mobile) return undefined;
    const timer = setInterval(() => {
      setActiveStep((i) => {
        const next = (i + 1) % copy.steps.length;
        setActiveModule(next % copy.moduleProcesses.length);
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [mobile, copy.steps.length, copy.moduleProcesses.length]);

  const progress = ((activeStep + 1) / copy.steps.length) * 100;
  const headerMotion = mobile
    ? { initial: { opacity: 1, y: 0 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
    : { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.6 } };
  const stepMotion = mobile
    ? { initial: { opacity: 1, x: 0 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true } }
    : { initial: { opacity: 0, x: -20 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { delay: 0, duration: 0.5 } };

  const activeMod = copy.moduleProcesses[activeModule];

  return (
    <div className="home-how-dreamz relative overflow-hidden no-reveal">
      <div className="max-w-7xl mx-auto px-4 relative">
        <motion.div
          {...headerMotion}
          className="text-center max-w-2xl mx-auto mb-10 lg:mb-12"
        >
          <h2 className="home-headline mb-3">
            {copy.title} <span className="gradient-text text-pop">{copy.titleHighlight}</span>
          </h2>
          <p className="text-secondary-theme text-base sm:text-lg">{copy.subtitle}</p>
        </motion.div>

        <motion.div
          initial={mobile ? false : { opacity: 0, y: 32, scale: 0.98 }}
          whileInView={mobile ? undefined : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="home-how-dreamz__fusion"
        >
          <div className="home-how-dreamz__fusion-aurora" aria-hidden />
          <div className="home-how-dreamz__fusion-grid" aria-hidden />

          <div className="home-how-dreamz__fusion-top">
            <div className="home-how-dreamz__fusion-badges">
              <span className="home-how-dreamz__panel-badge">{copy.counsellingLabel}</span>
              <span className="home-how-dreamz__fusion-plus" aria-hidden>
                <Zap className="w-3.5 h-3.5" />
              </span>
              <span className="home-how-dreamz__panel-badge home-how-dreamz__panel-badge--alt">{copy.modulesLabel}</span>
            </div>
            <span className="home-how-dreamz__fusion-live">
              <span className="home-how-dreamz__fusion-live-dot" aria-hidden />
              <Sparkles className="w-3.5 h-3.5" aria-hidden />
              Live journey
            </span>
          </div>

          <div className="home-how-dreamz__fusion-progress" aria-hidden>
            <motion.div
              className="home-how-dreamz__progress-fill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          <div className="home-how-dreamz__fusion-body">
            <div className="home-how-dreamz__fusion-col home-how-dreamz__fusion-col--counsel">
              <p className="home-how-dreamz__fusion-col-label">{copy.counsellingLabel}</p>
              <div className="home-how-dreamz__steps">
                {copy.steps.map((step, i) => {
                  const isActive = activeStep === i;
                  const isPast = i < activeStep;
                  return (
                    <motion.button
                      key={step.step}
                      type="button"
                      onClick={() => pickStep(i)}
                      {...stepMotion}
                      transition={mobile ? undefined : { delay: i * 0.08, duration: 0.5 }}
                      whileHover={{ x: 6 }}
                      className={`home-how-dreamz__step ${isActive ? 'home-how-dreamz__step--active' : ''} ${isPast ? 'home-how-dreamz__step--past' : ''}`}
                    >
                      <div className="home-how-dreamz__step-rail">
                        <motion.span
                          className="home-how-dreamz__step-dot"
                          animate={isActive && !mobile ? { scale: [1, 1.25, 1], boxShadow: ['0 0 0 0 rgba(245,158,11,0.45)', '0 0 0 14px rgba(245,158,11,0)', '0 0 0 0 rgba(245,158,11,0)'] } : {}}
                          transition={isActive ? { duration: 2, repeat: Infinity } : {}}
                        />
                        {i < copy.steps.length - 1 && (
                          <span className={`home-how-dreamz__step-line ${isPast ? 'home-how-dreamz__step-line--filled' : ''}`} />
                        )}
                      </div>
                      <div className="home-how-dreamz__step-body">
                        <div className="flex items-center gap-2 flex-wrap">
                          <motion.span
                            className="home-how-dreamz__step-icon"
                            animate={isActive && !mobile ? { y: [0, -4, 0], rotate: [0, -5, 5, 0] } : {}}
                            transition={isActive ? { duration: 2.5, repeat: Infinity } : {}}
                          >
                            {step.icon}
                          </motion.span>
                          <span className="home-how-dreamz__step-num">{copy.stepLabel} {step.step}:</span>
                          <span className="home-how-dreamz__step-title">{step.title}</span>
                        </div>
                        <AnimatePresence mode="wait">
                          {isActive && (
                            <motion.p
                              key={`desc-${step.step}`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="home-how-dreamz__step-desc"
                            >
                              {step.desc}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="home-how-dreamz__fusion-bridge" aria-hidden>
              <span className="home-how-dreamz__fusion-beam" />
              <motion.span
                className="home-how-dreamz__fusion-orb"
                animate={mobile ? {} : { y: ['-30%', '130%'] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="home-how-dreamz__fusion-bridge-label">sync</span>
            </div>

            <div className="home-how-dreamz__fusion-col home-how-dreamz__fusion-col--modules">
              <p className="home-how-dreamz__fusion-col-label">{copy.modulesLabel}</p>
              <div className="home-how-dreamz__module-tabs">
                {copy.moduleProcesses.map((mod, i) => (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => pickModule(i)}
                    className={`home-how-dreamz__module-tab ${activeModule === i ? 'home-how-dreamz__module-tab--active' : ''}`}
                  >
                    <span>{mod.icon}</span>
                    <span className="hidden sm:inline">{mod.title}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMod.id}
                  variants={mobile ? panelVariantsLite : panelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="home-how-dreamz__module-content"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <motion.span
                      className="text-3xl"
                      animate={mobile ? {} : { rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {activeMod.icon}
                    </motion.span>
                    <h3 className="font-display text-xl font-bold">{activeMod.title}</h3>
                  </div>

                  <ol className="home-how-dreamz__module-steps">
                    {activeMod.steps.map((label, i) => (
                      <motion.li
                        key={label}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.4 }}
                        className="home-how-dreamz__module-step"
                      >
                        <motion.span
                          className="home-how-dreamz__module-step-num"
                          whileHover={{ scale: 1.1 }}
                        >
                          {i + 1}
                        </motion.span>
                        <span>{label}</span>
                      </motion.li>
                    ))}
                  </ol>

                  <Link
                    to={activeMod.link}
                    className="home-how-dreamz__module-link inline-flex items-center gap-2 mt-5"
                  >
                    {copy.exploreModule} <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
