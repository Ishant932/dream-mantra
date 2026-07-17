import { motion } from 'framer-motion';
import { isMobilePerf } from '../utils/mobilePerf';

/** Homepage shells — prefer base/elevated; orange only for CTA bands */
const VARIANTS = {
  base: 'home-section home-section--base',
  elevated: 'home-section home-section--elevated',
  yellow: 'home-section home-section--yellow',
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
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};

export default function HomeSection({ variant = 'base', className = '', children, id }) {
  const cls = `${VARIANTS[variant] || VARIANTS.base} ${className}`.trim();
  const lite = isMobilePerf();
  const motionProps = lite ? enterLite : enterFull;
  const showAmbient = variant === 'orange' && !lite;

  return (
    <motion.section
      id={id}
      {...motionProps}
      className={`${cls}${lite ? ' home-section--mobile-enter' : ''}`}
    >
      {showAmbient && (
        <div className="home-section__ambient" aria-hidden="true">
          <span className="home-section__orb home-section__orb--1" />
          <span className="home-section__orb home-section__orb--2" />
        </div>
      )}
      <div className="home-section__inner">{children}</div>
    </motion.section>
  );
}
