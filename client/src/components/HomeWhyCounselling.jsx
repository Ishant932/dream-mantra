import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { isMobilePerf } from '../utils/mobilePerf';

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
      <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="home-headline mb-4">
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
        {copy.quote && (
          <motion.p
            {...fadeUp}
            transition={mobile ? undefined : { delay: 0.2 }}
            className="home-counselling-quote mt-6"
          >
            <Quote className="w-5 h-5 inline-block mr-1 text-amber-500 opacity-80" aria-hidden />
            {copy.quote}
          </motion.p>
        )}
        {copy.statsLine && (
          <motion.p
            initial={mobile ? false : { opacity: 0 }}
            whileInView={mobile ? undefined : { opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-theme-muted mt-4"
          >
            {copy.statsLine}
          </motion.p>
        )}
      </motion.div>

      <div className="grid md:grid-cols-3 gap-5 lg:gap-6 mb-12">
        {copy.problems.map((item, i) => (
          <motion.div
            key={item.stat}
            {...cardMotion}
            transition={mobile ? undefined : { delay: i * 0.1, duration: 0.55, type: 'spring', stiffness: 260 }}
            initial={mobile ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 0, y: 28, rotate: i === 1 ? 0 : i === 0 ? -1 : 1 }}
            whileHover={mobile ? undefined : { y: -8, scale: 1.02 }}
            className="home-problem-card"
          >
            <span className="home-stat-pop">
              {item.stat}
            </span>
            <p className="home-problem-card__label">{item.label}</p>
            <p className="home-problem-card__desc">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
