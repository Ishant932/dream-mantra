import { motion } from 'framer-motion';
import { BookOpenCheck, Brain, Fingerprint, ShieldCheck, TrendingUp } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

const ICONS = [Fingerprint, Brain, BookOpenCheck, TrendingUp, ShieldCheck];
const TONES = ['red', 'purple', 'green', 'blue', 'orange'];

export default function CounsellingProcessTimeline({ className = '' }) {
  const { d } = useLang();
  const steps = d('data.processSteps') || [];

  return (
    <motion.section
      className={`counselling-overview__process ${className}`.trim()}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="counselling-overview__process-head">
        <h2 className="home-headline home-headline--oneline mb-2">
          How <span className="gradient-text text-pop">counselling</span> works
        </h2>
      </div>
      <ol className="counselling-overview__timeline">
        {steps.map((step, i) => {
          const Icon = ICONS[i] || Fingerprint;
          const tone = TONES[i % TONES.length];
          return (
            <motion.li
              key={step.title}
              className={`counselling-overview__timeline-step counselling-overview__timeline-step--${tone}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="counselling-overview__timeline-node" aria-hidden>
                <span className="counselling-overview__timeline-icon">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="counselling-overview__timeline-num">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="counselling-overview__timeline-copy">
                <h3 className="counselling-overview__timeline-title">{step.title}</h3>
                {step.points?.length > 0 ? (
                  <ul className="counselling-overview__timeline-points">
                    {step.points.map((point) => <li key={point}>{point}</li>)}
                  </ul>
                ) : step.desc ? (
                  <p className="counselling-overview__timeline-desc">{step.desc}</p>
                ) : null}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </motion.section>
  );
}
