import { useState } from 'react';
import { motion } from 'framer-motion';

/** Trendy section photo with hover zoom and optional gradient overlay */
export default function TrendPhoto({
  src,
  alt = '',
  className = '',
  aspect = 'aspect-[4/3]',
  rounded = 'rounded-2xl',
  overlay = false,
  hover = true,
  fallbackLabel = '',
}) {
  const [failed, setFailed] = useState(false);

  return (
    <motion.div
      whileHover={hover ? { scale: 1.02 } : undefined}
      className={`relative overflow-hidden img-zoom-wrap ${aspect} ${rounded} ${className}`}
    >
      {!failed && src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-center px-6 text-sm font-semibold"
          style={{ background: 'var(--gold-gradient)', color: 'var(--dark-green)' }}
        >
          {fallbackLabel || alt || 'Dream Mantra'}
        </div>
      )}
      {overlay && !failed && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(1,50,32,0.55) 0%, transparent 55%)',
          }}
        />
      )}
    </motion.div>
  );
}

/** Small card thumbnail for grids */
export function PhotoCard({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative h-36 overflow-hidden rounded-t-2xl img-zoom-wrap ${className}`}>
      {!failed && src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-xs font-semibold px-3 text-center"
          style={{ background: 'var(--gold-gradient)', color: 'var(--dark-green)' }}
        >
          {alt || 'Dream Mantra'}
        </div>
      )}
      {!failed && (
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(1,50,32,0.4))' }}
        />
      )}
    </div>
  );
}
