import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LOGO_SRC = '/logo/dream-mantra-logo.png';

const sizeMap = {
  sm: { icon: 36, sparkles: 4, dreams: 'text-[0.9375rem]', mantra: 'text-[0.62rem]', tag: 'text-[0.55rem]' },
  md: { icon: 44, sparkles: 5, dreams: 'text-lg', mantra: 'text-[0.72rem]', tag: 'text-[0.6rem]' },
  lg: { icon: 56, sparkles: 6, dreams: 'text-2xl', mantra: 'text-xs', tag: 'text-[0.65rem]' },
};

const sparklePositions = [
  { top: '6%', left: '78%', delay: 0 },
  { top: '20%', left: '12%', delay: 0.5 },
  { top: '2%', left: '50%', delay: 1.1 },
  { top: '32%', left: '88%', delay: 0.25 },
  { top: '10%', left: '4%', delay: 0.85 },
  { top: '38%', left: '55%', delay: 1.4 },
];

const textStagger = {
  hidden: { opacity: 0, x: -10 },
  show: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.15 + i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Logo({
  size = 'md',
  showText = true,
  variant = 'auto',
  asLink = true,
  className = '',
}) {
  const s = sizeMap[size] || sizeMap.md;

  const content = (
    <motion.div
      className={`logo-root logo-variant-${variant} logo-image-root group ${className}`}
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="logo-brand-row">
        {/* Animated icon mark */}
        <div className="logo-image-stage" style={{ width: s.icon, height: s.icon }}>
          <span className="logo-image-ring logo-image-ring--1" aria-hidden="true" />
          <span className="logo-image-ring logo-image-ring--2" aria-hidden="true" />
          <span className="logo-image-ring logo-image-ring--3" aria-hidden="true" />

          <span className="logo-image-orbit logo-image-orbit--1" aria-hidden="true">
            <span className="logo-image-orbit-dot logo-image-orbit-dot--1" />
          </span>
          <span className="logo-image-orbit logo-image-orbit--2" aria-hidden="true">
            <span className="logo-image-orbit-dot logo-image-orbit-dot--2" />
          </span>

          <motion.span
            className="logo-image-glow"
            aria-hidden="true"
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.85, 1.2, 0.85] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className="logo-icon-crop"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.08, rotate: 2 }}
          >
            <img
              src={LOGO_SRC}
              alt=""
              aria-hidden="true"
              className="logo-image logo-image--cropped"
              style={{ height: Math.round(s.icon * 1.65) }}
              width={s.icon}
              height={s.icon}
              decoding="async"
              fetchPriority="high"
            />
          </motion.div>

          {sparklePositions.slice(0, s.sparkles).map((pos, i) => (
            <motion.span
              key={i}
              className="logo-image-sparkle"
              style={{ top: pos.top, left: pos.left }}
              aria-hidden="true"
              animate={{
                opacity: [0.15, 1, 0.15],
                scale: [0.5, 1.3, 0.5],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 1.8 + i * 0.25,
                repeat: Infinity,
                delay: pos.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          <span className="logo-image-shimmer" aria-hidden="true" />
          <span className="logo-image-arc" aria-hidden="true" />
        </div>

        {/* Brand name beside logo */}
        {showText && (
          <motion.div
            className="logo-text-block"
            initial="hidden"
            animate="show"
          >
            <motion.span
              custom={0}
              variants={textStagger}
              className={`logo-dreams block ${s.dreams}`}
            >
              Dream
            </motion.span>
            <motion.span
              custom={1}
              variants={textStagger}
              className={`logo-mantra block ${s.mantra}`}
            >
              Mantra
            </motion.span>
            <span className="logo-text-underline" aria-hidden="true" />
          </motion.div>
        )}
      </div>

      {!showText && <span className="sr-only">Dream Mantra</span>}
    </motion.div>
  );

  if (asLink) {
    return (
      <Link
        to="/"
        className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] rounded-lg"
        aria-label="Dream Mantra home"
      >
        {content}
      </Link>
    );
  }
  return content;
}
