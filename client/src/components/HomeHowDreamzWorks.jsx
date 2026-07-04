import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { isMobilePerf } from '../utils/mobilePerf';

export default function HomeHowDreamzWorks() {
  const { d } = useLang();
  const copy = d('home.howDreamzWorks');
  const mobile = isMobilePerf();

  const processes = useMemo(() => [
    {
      id: 'counselling',
      label: copy.counsellingLabel,
      icon: '🎯',
      type: 'counselling',
    },
    ...copy.moduleProcesses.map((mod) => ({
      id: mod.id,
      label: mod.title,
      icon: mod.icon,
      type: 'module',
      module: mod,
    })),
  ], [copy]);

  const [activeIdx, setActiveIdx] = useState(0);
  const active = processes[activeIdx];

  const headerMotion = mobile
    ? { initial: { opacity: 1, y: 0 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
    : { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.55 } };

  return (
    <div className="home-how-dreamz relative overflow-hidden no-reveal">
      <div className="max-w-7xl mx-auto px-4 relative">
        <motion.div {...headerMotion} className="text-center max-w-2xl mx-auto mb-8 lg:mb-10">
          <h2 className="home-headline mb-3">
            {copy.title} <span className="gradient-text text-pop">{copy.titleHighlight}</span>
          </h2>
          <p className="text-secondary-theme text-base sm:text-lg">{copy.subtitle}</p>
        </motion.div>

        <motion.div
          initial={mobile ? false : { opacity: 0, y: 24 }}
          whileInView={mobile ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="home-processes"
        >
          <div className="home-processes__header">
            <span className="home-processes__title">{copy.processesLabel || 'Processes'}</span>
          </div>

          <div className="home-processes__tabs" role="tablist" aria-label={copy.processesLabel || 'Processes'}>
            {processes.map((proc, i) => (
              <button
                key={proc.id}
                type="button"
                role="tab"
                aria-selected={activeIdx === i}
                onClick={() => setActiveIdx(i)}
                className={`home-processes__tab${activeIdx === i ? ' home-processes__tab--active' : ''}`}
              >
                <span className="home-processes__tab-icon" aria-hidden>{proc.icon}</span>
                <span className="home-processes__tab-label">{proc.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              role="tabpanel"
              initial={mobile ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={mobile ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="home-processes__panel"
            >
              {active.type === 'counselling' ? (
                <ol className="home-processes__steps">
                  {copy.steps.map((step) => (
                    <li key={step.step} className="home-processes__step">
                      <span className="home-processes__step-num">{copy.stepLabel} {step.step}</span>
                      <div className="home-processes__step-body">
                        <span className="home-processes__step-icon" aria-hidden>{step.icon}</span>
                        <div>
                          <p className="home-processes__step-title">{step.title}</p>
                          <p className="home-processes__step-desc">{step.desc}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <>
                  <div className="home-processes__module-head">
                    <span className="text-3xl" aria-hidden>{active.module.icon}</span>
                    <h3 className="font-display text-xl font-bold">{active.module.title}</h3>
                  </div>
                  <ol className="home-processes__module-steps">
                    {active.module.steps.map((label, i) => (
                      <li key={label} className="home-processes__module-step">
                        <span className="home-processes__module-step-num">{i + 1}</span>
                        <span>{label}</span>
                      </li>
                    ))}
                  </ol>
                  <Link to={active.module.link} className="home-processes__link inline-flex items-center gap-2 mt-5">
                    {copy.exploreModule} <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
