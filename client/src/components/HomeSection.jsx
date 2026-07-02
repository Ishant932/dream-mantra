import { motion } from 'framer-motion';
import { isMobilePerf } from '../utils/mobilePerf';

/** Alternating home section backgrounds — theme tokens only */
const VARIANTS = {
  base: 'home-section home-section--base',
  elevated: 'home-section home-section--elevated',
  warm: 'home-section home-section--warm',
  cream: 'home-section home-section--cream',
  dark: 'home-section home-section--dark',
  mesh: 'home-section home-section--mesh',
  orange: 'home-section home-section--orange',
};

const enterLite = {
  initial: { opacity: 1, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-24px' },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

const enterFull = {
  initial: { opacity: 0, y: 32, scale: 0.99 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
};

export default function HomeSection({ variant = 'base', className = '', children, id }) {
  const cls = `${VARIANTS[variant] || VARIANTS.base} ${className}`.trim();
  const lite = isMobilePerf();
  const motionProps = lite ? enterLite : enterFull;

  return (
    <motion.section
      id={id}
      {...motionProps}
      className={`${cls}${lite ? ' home-section--mobile-enter' : ''}`}
    >
      {!lite && (
        <div className="home-section__ambient" aria-hidden="true">
          <span className="home-section__orb home-section__orb--1" />
          <span className="home-section__orb home-section__orb--2" />
          <span className="home-section__spark home-section__spark--1" />
          <span className="home-section__spark home-section__spark--2" />
        </div>
      )}
      <div className="home-section__inner">{children}</div>
    </motion.section>
  );
}
