import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const orbs = [
  { w: 480, x: '88%', y: '6%', delay: 0, dur: 22 },
  { w: 380, x: '-6%', y: '28%', delay: 1.2, dur: 18 },
  { w: 320, x: '62%', y: '68%', delay: 0.6, dur: 20 },
  { w: 260, x: '18%', y: '52%', delay: 2, dur: 16 },
];

const shapes = [
  { type: 'cube', left: '8%', top: '18%', size: 72, dur: 24, delay: 0 },
  { type: 'ring', left: '82%', top: '22%', size: 100, dur: 18, delay: 1 },
  { type: 'pyramid', left: '72%', top: '62%', size: 64, dur: 20, delay: 0.5 },
  { type: 'cube', left: '14%', top: '72%', size: 56, dur: 26, delay: 1.8 },
  { type: 'ring', left: '42%', top: '12%', size: 80, dur: 22, delay: 2.2 },
  { type: 'pyramid', left: '52%', top: '78%', size: 48, dur: 19, delay: 0.8 },
];

const particles = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  left: `${(i * 3.1) % 98}%`,
  top: `${(i * 4.7 + 5) % 92}%`,
  size: i % 5 === 0 ? 5 : 3,
  delay: i * 0.15,
  dur: 3.5 + (i % 4) * 0.8,
}));

function FloatingShape({ type, size, dur, delay }) {
  if (type === 'ring') {
    return (
      <div className="dash-shape-ring" style={{ width: size, height: size }}>
        <div className="dash-shape-ring-inner" />
      </div>
    );
  }
  if (type === 'pyramid') {
    return (
      <div className="dash-shape-pyramid" style={{ borderLeftWidth: size * 0.5, borderRightWidth: size * 0.5, borderBottomWidth: size * 0.86 }} />
    );
  }
  return (
    <div className="dash-cube-wrap" style={{ width: size, height: size, '--cube-half': `${size / 2}px` }}>
      <div className="dash-cube">
        {['front', 'back', 'right', 'left', 'top', 'bottom'].map((face) => (
          <div key={face} className={`dash-cube-face dash-cube-${face}`} />
        ))}
      </div>
    </div>
  );
}

export default function DashboardBackground({ variant = 'user' }) {
  const { theme } = useTheme();
  const isAdmin = variant === 'admin';
  const isLight = theme === 'light';

  return (
    <div
      className={[
        'dash-bg-root',
        isAdmin ? 'dash-bg-admin' : 'dash-bg-user',
        theme === 'aurora' ? 'dash-bg-aurora' : '',
        isAdmin && isLight ? 'dash-bg-admin-light' : '',
      ].filter(Boolean).join(' ')}
      aria-hidden
    >
      <div className="dash-bg-base" />
      <motion.div
        className="dash-bg-mesh"
        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="dash-bg-sweep"
        animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      />

      <div className="dash-bg-grid-floor" />
      <div className="dash-bg-grid" />
      <div className="dash-bg-dots" />

      {orbs.map((o, i) => (
        <motion.div
          key={`orb-${i}`}
          className="dash-bg-orb absolute rounded-full blur-3xl"
          style={{ width: o.w, height: o.w, left: o.x, top: o.y }}
          animate={{
            x: [0, 24 - i * 5, -16 + i * 3, 0],
            y: [0, -20 + i * 4, 18 - i * 2, 0],
            scale: [1, 1.1, 0.94, 1],
            opacity: isAdmin ? [0.35, 0.55, 0.4, 0.35] : [0.28, 0.48, 0.32, 0.28],
          }}
          transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: o.delay }}
        />
      ))}

      <motion.div
        className="dash-bg-rays absolute"
        animate={{ rotate: 360 }}
        transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
      />

      {shapes.map((s, i) => (
        <motion.div
          key={`shape-${i}`}
          className="dash-floating-shape absolute"
          style={{ left: s.left, top: s.top }}
          animate={{
            y: [0, -18, 8, 0],
            rotateZ: [0, 6, -4, 0],
          }}
          transition={{ duration: s.dur * 0.4, repeat: Infinity, ease: 'easeInOut', delay: s.delay }}
        >
          <FloatingShape type={s.type} size={s.size} dur={s.dur} delay={s.delay} />
        </motion.div>
      ))}

      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="dash-particle absolute rounded-full"
          style={{ width: p.size, height: p.size, left: p.left, top: p.top }}
          animate={{
            opacity: [0.12, 0.65, 0.12],
            y: [0, -22 - (p.id % 3) * 8, 0],
            scale: [0.7, 1.25, 0.7],
          }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}

      <motion.div
        className="dash-bg-pulse-ring absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
