import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle2, Quote } from 'lucide-react';
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
            <motion.span
              className="home-stat-pop"
              animate={mobile ? undefined : { scale: [1, 1.04, 1] }}
              transition={mobile ? undefined : { duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
            >
              {item.stat}
            </motion.span>
            <p className="home-problem-card__label">{item.label}</p>
            <p className="home-problem-card__desc">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        {...fadeUp}
        transition={mobile ? undefined : { delay: 0.1 }}
        className="home-solution-panel"
      >
        <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <span className="home-eyebrow home-eyebrow--solution inline-flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" /> {copy.solutionTitle}
            </span>
            <p className="home-hook home-hook--solution mb-5">{copy.solutionDesc}</p>
            <ul className="grid sm:grid-cols-2 gap-3">
              {copy.solutionPoints.map((point, i) => (
                <motion.li
                  key={point}
                  initial={mobile ? false : { opacity: 0, x: -12 }}
                  whileInView={mobile ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={mobile ? undefined : { delay: 0.2 + i * 0.06 }}
                  className="home-solution-point"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {point}
                </motion.li>
              ))}
            </ul>
          </div>
          <motion.div whileHover={mobile ? undefined : { scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link
              to={copy.knowMoreLink}
              className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-base shadow-lg shadow-amber-500/25"
            >
              {copy.knowMore} <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
