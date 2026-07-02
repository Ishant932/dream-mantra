import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((i) => (i + 1) % copy.steps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [copy.steps.length]);

  const progress = ((activeStep + 1) / copy.steps.length) * 100;
  const headerMotion = mobile
    ? { initial: { opacity: 1, y: 0 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
    : { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.6 } };
  const panelMotion = mobile
    ? { initial: { opacity: 1, x: 0 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true } }
    : { initial: { opacity: 0, x: -32 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true, margin: '-40px' }, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } };
  const panelMotionRight = mobile
    ? { initial: { opacity: 1, x: 0 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true } }
    : { initial: { opacity: 0, x: 32 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true, margin: '-40px' }, transition: { duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] } };
  const stepMotion = mobile
    ? { initial: { opacity: 1, x: 0 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true } }
    : { initial: { opacity: 0, x: -20 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true }, transition: { delay: 0, duration: 0.5 } };

  return (
    <div className="home-how-dreamz relative overflow-hidden no-reveal">
      <div className="max-w-7xl mx-auto px-4 relative">
        <motion.div
          {...headerMotion}
          className="text-center max-w-2xl mx-auto mb-12 lg:mb-14"
        >
          <h2 className="home-headline mb-3">
            {copy.title} <span className="gradient-text text-pop">{copy.titleHighlight}</span>
          </h2>
          <p className="text-secondary-theme text-base sm:text-lg">{copy.subtitle}</p>
        </motion.div>

        <div className="home-how-dreamz__grid grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left — Counselling Process */}
          <motion.div
            {...panelMotion}
            className="home-how-dreamz__panel home-how-dreamz__panel--counselling"
          >
            <div className="home-how-dreamz__panel-head">
              <span className="home-how-dreamz__panel-badge">{copy.counsellingLabel}</span>
              <div className="home-how-dreamz__progress-track" aria-hidden>
                <motion.div
                  className="home-how-dreamz__progress-fill"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div className="home-how-dreamz__steps">
              {copy.steps.map((step, i) => {
                const isActive = activeStep === i;
                const isPast = i < activeStep;
                return (
                  <motion.button
                    key={step.step}
                    type="button"
                    onClick={() => setActiveStep(i)}
                    {...stepMotion}
                    transition={mobile ? undefined : { delay: i * 0.1, duration: 0.5 }}
                    whileHover={{ x: 6 }}
                    className={`home-how-dreamz__step ${isActive ? 'home-how-dreamz__step--active' : ''} ${isPast ? 'home-how-dreamz__step--past' : ''}`}
                  >
                    <div className="home-how-dreamz__step-rail">
                      <motion.span
                        className="home-how-dreamz__step-dot"
                        animate={isActive ? { scale: [1, 1.2, 1], boxShadow: ['0 0 0 0 rgba(245,158,11,0.4)', '0 0 0 12px rgba(245,158,11,0)', '0 0 0 0 rgba(245,158,11,0)'] } : {}}
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
                          animate={isActive ? { y: [0, -4, 0], rotate: [0, -5, 5, 0] } : {}}
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
          </motion.div>

          {/* Right — Module Processes */}
          <motion.div
            {...panelMotionRight}
            className="home-how-dreamz__panel home-how-dreamz__panel--modules"
          >
            <div className="home-how-dreamz__panel-head">
              <span className="home-how-dreamz__panel-badge home-how-dreamz__panel-badge--alt">{copy.modulesLabel}</span>
            </div>

            <div className="home-how-dreamz__module-tabs">
              {copy.moduleProcesses.map((mod, i) => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setActiveModule(i)}
                  className={`home-how-dreamz__module-tab ${activeModule === i ? 'home-how-dreamz__module-tab--active' : ''}`}
                >
                  <span>{mod.icon}</span>
                  <span className="hidden sm:inline">{mod.title}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={copy.moduleProcesses[activeModule].id}
                variants={mobile ? panelVariantsLite : panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="home-how-dreamz__module-content"
              >
                <div className="flex items-center gap-3 mb-5">
                  <motion.span
                    className="text-3xl"
                    animate={{ rotate: [0, 8, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {copy.moduleProcesses[activeModule].icon}
                  </motion.span>
                  <h3 className="font-display text-xl font-bold">{copy.moduleProcesses[activeModule].title}</h3>
                </div>

                <ol className="home-how-dreamz__module-steps">
                  {copy.moduleProcesses[activeModule].steps.map((label, i) => (
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
                  to={copy.moduleProcesses[activeModule].link}
                  className="home-how-dreamz__module-link inline-flex items-center gap-2 mt-6"
                >
                  {copy.exploreModule} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
