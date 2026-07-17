import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Users } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { isMobilePerf } from '../utils/mobilePerf';

const PROBLEM_ICONS = [Users, Briefcase, GraduationCap];

export default function HomeWhyCounselling() {
  const { d } = useLang();
  const copy = d('home.whyCounselling');
  const mobile = isMobilePerf();

  const fadeUp = mobile
    ? { initial: { opacity: 1, y: 0 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
    : {
        initial: { opacity: 0, y: 32 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-60px' },
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
      };

  const cardMotion = mobile
    ? { initial: { opacity: 1, y: 0, rotate: 0 }, whileInView: { opacity: 1, y: 0, rotate: 0 }, viewport: { once: true } }
    : {
        initial: { opacity: 0, y: 28, rotate: 0 },
        whileInView: { opacity: 1, y: 0, rotate: 0 },
        viewport: { once: true },
        transition: { duration: 0.55, type: 'spring', stiffness: 260 },
      };

  return (
    <div className="max-w-7xl mx-auto px-4 no-reveal">
      <motion.div {...fadeUp} className="text-center max-w-5xl mx-auto mb-6 sm:mb-10 md:mb-12">
        <h2 className="home-headline mb-3 sm:mb-4">
          {copy.title}{' '}
          <span className="gradient-text text-pop">{copy.titleHighlight}</span>
        </h2>
        <motion.p
          initial={mobile ? false : { opacity: 0, scale: 0.96 }}
          whileInView={mobile ? undefined : { opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={mobile ? undefined : { delay: 0.15, duration: 0.5 }}
          className="home-hook home-hook--problem"
        >
          {copy.hook}
        </motion.p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-2.5 sm:gap-5 lg:gap-6 mb-8 sm:mb-12">
        {copy.problems.map((item, i) => {
          const Icon = PROBLEM_ICONS[i % PROBLEM_ICONS.length];
          return (
            <motion.div
              key={item.stat}
              {...cardMotion}
              transition={mobile ? undefined : { delay: i * 0.1, duration: 0.55, type: 'spring', stiffness: 260 }}
              initial={mobile ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 0, y: 28, rotate: i === 1 ? 0 : i === 0 ? -1 : 1 }}
              whileHover={mobile ? undefined : { y: -8, scale: 1.02 }}
              className={`home-problem-card home-problem-card--${i + 1}`}
            >
              <span className="home-problem-card__icon" aria-hidden>
                <Icon className="w-6 h-6" />
              </span>
              <span className="home-stat-pop">
                {item.stat}
              </span>
              <p className="home-problem-card__label">{item.label}</p>
              <p className="home-problem-card__desc">{item.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
