import { motion } from 'framer-motion';

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

export default function HomeSection({ variant = 'base', className = '', children, id }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 36, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`${VARIANTS[variant] || VARIANTS.base} ${className}`.trim()}
    >
      <div className="home-section__ambient" aria-hidden="true">
        <span className="home-section__orb home-section__orb--1" />
        <span className="home-section__orb home-section__orb--2" />
        <span className="home-section__spark home-section__spark--1" />
        <span className="home-section__spark home-section__spark--2" />
      </div>
      <div className="home-section__inner">{children}</div>
    </motion.section>
  );
}
