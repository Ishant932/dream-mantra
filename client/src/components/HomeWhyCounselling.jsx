import { motion } from 'framer-motion';
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
    </div>
  );
}
