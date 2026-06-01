import { useState } from 'react';
import { motion } from 'framer-motion';

const sizes = {
  sm: 'w-14 h-14 rounded-xl',
  md: 'w-20 h-20 rounded-2xl',
  lg: 'w-24 h-24 rounded-2xl',
  xl: 'w-32 h-32 rounded-2xl',
  hero: 'w-40 h-40 rounded-3xl',
};

/** Portrait with gold ring — falls back to initials */
export default function PersonPhoto({
  src,
  alt,
  name = '',
  size = 'lg',
  className = '',
  animate = true,
  variant = 'default',
}) {
  const [failed, setFailed] = useState(false);
  const isFounder = variant === 'founder';

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const inner = src && !failed ? (
    <img
      src={src}
      alt={alt || name}
      className={`w-full h-full object-cover ${isFounder ? 'founder-photo-img' : ''}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  ) : (
    <div
      className="w-full h-full flex items-center justify-center font-bold text-lg"
      style={{ background: 'var(--gold-gradient)', color: 'var(--dark-green)' }}
    >
      {initials}
    </div>
  );

  const box = (
    <div
      className={[
        sizes[size],
        'shrink-0 overflow-hidden shadow-lg',
        isFounder ? 'founder-photo-frame' : 'ring-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={isFounder ? undefined : { ringColor: 'var(--gold-border)' }}
    >
      {isFounder && <span className="founder-photo-shimmer" aria-hidden="true" />}
      {isFounder && <span className="founder-photo-glow" aria-hidden="true" />}
      {inner}
    </div>
  );
  
  if (!animate) return box;

  if (isFounder) {
    return (
      <motion.div
        className="founder-photo-wrap"
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.04, y: -4 }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {box}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {box}
    </motion.div>
  );
}