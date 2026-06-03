import { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const particles = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  left: `${(i * 4.3) % 97}%`,
  top: `${(i * 5.7) % 94}%`,
  size: i % 4 === 0 ? 6 : i % 3 === 0 ? 4 : 3,
  delay: i * 0.25,
  dur: 3 + (i % 5) * 0.6,
}));

const lightParticles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 5.5 + 3) % 96}%`,
  top: `${(i * 6.2 + 5) % 94}%`,
  size: i % 3 === 0 ? 5 : 3,
  kind: i % 3 === 0 ? 'star' : i % 3 === 1 ? 'diamond' : 'tri',
  delay: i * 0.35,
  hue: i % 4,
}));

const auroraParticles = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  left: `${(i * 3.5) % 96}%`,
  top: `${(i * 4.2 + 8) % 92}%`,
  size: i % 4 === 0 ? 4 : 2,
  delay: i * 0.18,
  dur: 3 + (i % 4) * 0.7,
  hue: i % 3,
}));

const blobs = [
  { w: 520, x: '82%', y: '-8%', color: 'var(--orb-2)', dur: 18 },
  { w: 440, x: '-8%', y: '22%', color: 'var(--orb-1)', dur: 22 },
  { w: 380, x: '68%', y: '62%', color: 'var(--orb-1)', dur: 16 },
  { w: 300, x: '28%', y: '48%', color: 'var(--orb-2)', dur: 20 },
];

const lightAmbientPatches = [
  { w: 480, h: 320, x: '86%', y: '-4%', rot: 18, color: 'rgba(255, 185, 100, 0.3)', delay: 0 },
  { w: 420, h: 340, x: '-10%', y: '22%', rot: -20, color: 'rgba(123, 174, 127, 0.26)', delay: 4 },
  { w: 380, h: 280, x: '52%', y: '58%', rot: 12, color: 'rgba(201, 168, 76, 0.28)', delay: 8 },
];

const lightShape3d = [
  { type: 'cube', size: 44, x: '8%', y: '14%', hue: 'gold', anim: 'a', delay: 0 },
  { type: 'star', size: 36, x: '84%', y: '18%', hue: 'orange', anim: 'b', delay: 1.2 },
  { type: 'hex', size: 42, x: '48%', y: '68%', hue: 'green', anim: 'c', delay: 2.4 },
  { type: 'pyramid', size: 48, x: '18%', y: '48%', hue: 'green', anim: 'b', delay: 0.8 },
  { type: 'diamond', size: 38, x: '72%', y: '42%', hue: 'gold', anim: 'a', delay: 3 },
  { type: 'star', size: 30, x: '58%', y: '28%', hue: 'orange', anim: 'c', delay: 1.8 },
];

const lightSparkles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${(i * 8.5 + 5) % 92}%`,
  top: `${(i * 6.5 + 8) % 88}%`,
  size: i % 2 === 0 ? 6 : 5,
  delay: i * 0.45,
}));

const auroraBlobs = [
  { w: 600, x: '78%', y: '-10%', color: 'rgba(255,107,53,0.2)', dur: 16 },
  { w: 500, x: '-8%', y: '20%', color: 'rgba(255,208,96,0.16)', dur: 20 },
  { w: 420, x: '58%', y: '60%', color: 'rgba(255,51,102,0.12)', dur: 14 },
  { w: 360, x: '22%', y: '45%', color: 'rgba(191,255,0,0.1)', dur: 18 },
];

const auroraBands = [
  { top: '12%', height: '24%', delay: 0, dur: 14 },
  { top: '55%', height: '20%', delay: 3, dur: 17 },
];

const HUE = {
  gold: { a: 'rgba(201,168,76,0.62)', b: 'rgba(232,201,106,0.45)', c: 'rgba(184,146,46,0.55)', glow: 'rgba(201,168,76,0.35)' },
  green: { a: 'rgba(123,174,127,0.58)', b: 'rgba(160,210,165,0.42)', c: 'rgba(90,140,95,0.5)', glow: 'rgba(123,174,127,0.3)' },
  orange: { a: 'rgba(255,140,90,0.62)', b: 'rgba(255,180,130,0.45)', c: 'rgba(232,81,46,0.52)', glow: 'rgba(255,107,74,0.32)' },
};

const PARTICLE_HUE_CLASS = ['', 'hue-gold', 'hue-green', 'hue-orange'];

const Cube3D = memo(function Cube3D({ size, colors }) {
  const z = size / 2;
  const faces = [
    { t: `rotateY(0deg) translateZ(${z}px)`, bg: colors.a },
    { t: `rotateY(90deg) translateZ(${z}px)`, bg: colors.b },
    { t: `rotateY(180deg) translateZ(${z}px)`, bg: colors.c },
    { t: `rotateY(-90deg) translateZ(${z}px)`, bg: colors.b },
    { t: `rotateX(90deg) translateZ(${z}px)`, bg: colors.a },
    { t: `rotateX(-90deg) translateZ(${z}px)`, bg: colors.c },
  ];
  return (
    <div className="light-cube" style={{ width: size, height: size }}>
      {faces.map((f, i) => (
        <div key={i} className="light-cube-face" style={{ transform: f.t, background: f.bg }} />
      ))}
    </div>
  );
});

const Pyramid3D = memo(function Pyramid3D({ size, colors }) {
  const w = Math.round(size * 0.5);
  const h = Math.round(size * 0.86);
  const z = Math.round(size * 0.26);
  const face = (color, rotY) => ({
    width: 0,
    height: 0,
    borderLeft: `${w}px solid transparent`,
    borderRight: `${w}px solid transparent`,
    borderBottom: `${h}px solid ${color}`,
    transform: `translate(-50%, -50%) rotateY(${rotY}deg) translateZ(${z}px)`,
  });
  return (
    <div className="light-pyramid" style={{ width: size, height: size }}>
      <div className="light-pyramid-face" style={face(colors.a, 0)} />
      <div className="light-pyramid-face" style={face(colors.c, 180)} />
      <div className="light-pyramid-face" style={face(colors.b, -90)} />
      <div className="light-pyramid-face" style={face(colors.b, 90)} />
    </div>
  );
});

const Star3D = memo(function Star3D({ size, colors }) {
  return (
    <div
      className="light-star-3d"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${colors.a}, ${colors.b})`,
      }}
    />
  );
});

const Diamond3D = memo(function Diamond3D({ size, colors }) {
  const w = Math.round(size * 0.36);
  const h = Math.round(size * 0.42);
  return (
    <div className="light-diamond-3d" style={{ width: size, height: size }}>
      <div
        className="light-diamond-top"
        style={{
          borderLeft: `${w}px solid transparent`,
          borderRight: `${w}px solid transparent`,
          borderBottom: `${h}px solid ${colors.a}`,
        }}
      />
      <div
        className="light-diamond-bottom"
        style={{
          borderLeft: `${w}px solid transparent`,
          borderRight: `${w}px solid transparent`,
          borderTop: `${h}px solid ${colors.c}`,
        }}
      />
    </div>
  );
});

const HexPrism3D = memo(function HexPrism3D({ size, colors }) {
  return (
    <div
      className="light-hex-prism"
      style={{
        width: size,
        height: size * 1.1,
        background: `linear-gradient(160deg, ${colors.a} 0%, ${colors.b} 45%, ${colors.c} 100%)`,
      }}
    />
  );
});

const LightBgShape3D = memo(function LightBgShape3D({ type, size, left, top, hue, anim, delay }) {
  const colors = HUE[hue] || HUE.gold;
  return (
    <div
      className={`light-shape-3d-wrap light-shape-anim-${anim}`}
      style={{
        left,
        top,
        width: size,
        height: size,
        animationDelay: `${delay}s`,
        filter: `drop-shadow(0 8px 16px ${colors.glow})`,
      }}
    >
      <div className="light-shape-3d-inner" style={{ width: size, height: size }}>
        {type === 'cube' && <Cube3D size={size} colors={colors} />}
        {type === 'pyramid' && <Pyramid3D size={size} colors={colors} />}
        {type === 'star' && <Star3D size={size} colors={colors} />}
        {type === 'diamond' && <Diamond3D size={size} colors={colors} />}
        {type === 'hex' && <HexPrism3D size={size} colors={colors} />}
      </div>
    </div>
  );
});

/** Light theme — CSS-only animations (no Framer Motion) for better performance */
function LightBackground() {
  return (
    <>
      <div className="live-bg-base absolute inset-0" />
      <div className="absolute inset-0 light-bg-bokeh" />
      <div className="absolute inset-0 light-bg-waves" />
      <div className="absolute inset-0 light-bg-aurora-wash light-bg-anim-wash" />
      <div className="absolute inset-0 live-bg-mesh light-bg-anim-mesh" />
      <div className="live-bg-accent absolute inset-0" />

      <div className="light-bg-band light-bg-band-1 absolute left-0 right-0" />
      <div className="light-bg-band light-bg-band-2 absolute left-0 right-0" />

      <div className="light-bg-orbit light-bg-orbit-outer light-bg-anim-orbit absolute top-1/2 left-1/2" />

      {lightShape3d.map((s, i) => (
        <LightBgShape3D key={`shape3d-${i}`} {...s} />
      ))}

      {lightAmbientPatches.map((b, i) => (
        <div
          key={`patch-${i}`}
          className="light-ambient-patch light-ambient-anim absolute"
          style={{
            width: b.w,
            height: b.h,
            left: b.x,
            top: b.y,
            background: b.color,
            rotate: `${b.rot}deg`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}

      <div className="absolute inset-0 live-bg-sweep light-bg-anim-sweep" />
      <div className="absolute top-0 right-1/4 light-bg-rays light-bg-anim-rays origin-top" />

      {lightSparkles.map((s) => (
        <span
          key={`sparkle-${s.id}`}
          className="light-sparkle light-sparkle-anim absolute"
          style={{
            width: s.size,
            height: s.size,
            left: s.left,
            top: s.top,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {lightParticles.map((p) => (
        <span
          key={p.id}
          className={`absolute live-particle light-particle-anim light-particle-shape light-particle-${p.kind} ${PARTICLE_HUE_CLASS[p.hue ?? 0]}`}
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      <div className="live-bg-grid absolute inset-0" />
      <div className="live-bg-dots absolute inset-0 light-bg-anim-dots" />

      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={`diamond-${i}`}
          className="live-bg-diamond light-diamond light-diamond-anim absolute"
          style={{
            left: `${10 + i * 18}%`,
            top: `${14 + (i % 3) * 22}%`,
            animationDelay: `${i * 1.4}s`,
          }}
        />
      ))}
    </>
  );
}

export default function AnimatedBackground() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isAurora = theme === 'aurora';
  const isLight = theme === 'light';
  const [lite, setLite] = useState(() =>
    typeof window !== 'undefined'
    && (window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setLite(mq.matches || motion.matches);
    update();
    mq.addEventListener('change', update);
    motion.addEventListener('change', update);
    return () => {
      mq.removeEventListener('change', update);
      motion.removeEventListener('change', update);
    };
  }, []);

  if (lite) {
    return (
      <div className="live-bg-root live-bg-root--lite fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden>
        <div className="live-bg-base absolute inset-0" />
      </div>
    );
  }

  if (isLight) {
    return (
      <div className="live-bg-root light-bg-root fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden>
        <LightBackground />
      </div>
    );
  }

  const activeBlobs = isAurora ? auroraBlobs : blobs;
  const activeParticles = isAurora ? auroraParticles : particles;

  return (
    <div className={`live-bg-root fixed inset-0 pointer-events-none overflow-hidden -z-10 ${isAurora ? 'aurora-bg-root' : ''}`} aria-hidden>
      <div className="live-bg-base absolute inset-0" />

      <motion.div
        className="absolute inset-0 live-bg-mesh"
        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
        transition={{ duration: isAurora ? 20 : 24, repeat: Infinity, ease: 'linear' }}
      />
      <div className="live-bg-accent absolute inset-0" />

      {isAurora && (
        <>
          {auroraBands.map((band, i) => (
            <motion.div
              key={`band-${i}`}
              className="aurora-band absolute left-0 right-0"
              style={{ top: band.top, height: band.height }}
              animate={{
                opacity: [0.2, 0.4, 0.25, 0.2],
                x: ['-3%', '3%', '-2%', '-3%'],
              }}
              transition={{ duration: band.dur, repeat: Infinity, ease: 'easeInOut', delay: band.delay }}
            />
          ))}
          <motion.div
            className="absolute inset-0 aurora-nebula"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {activeBlobs.map((b, i) => (
        <motion.div
          key={i}
          className="site-orb absolute rounded-full blur-3xl"
          style={{
            width: b.w,
            height: b.w,
            left: b.x,
            top: b.y,
            background: b.color,
            opacity: 0.55,
          }}
          animate={{
            x: [0, 38 - i * 5, -28 + i * 4, 0],
            y: [0, -34 + i * 4, 28 - i * 3, 0],
            scale: [1, 1.12, 0.9, 1],
          }}
          transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
        />
      ))}

      <motion.div
        className="absolute -top-32 right-[10%] w-[680px] h-[680px] sun-orb rounded-full"
        animate={{
          scale: [1, 1.18, 1],
          opacity: isAurora ? [0.3, 0.5, 0.3] : [0.35, 0.6, 0.35],
        }}
        transition={{ duration: isAurora ? 7 : 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute inset-0 live-bg-sweep"
        animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      <motion.div
        className="absolute top-0 right-1/4 w-[850px] h-[850px] origin-top live-bg-rays"
        style={{ opacity: isAurora ? 0.35 : 0.4 }}
        animate={{ rotate: 360 }}
        transition={{ duration: isAurora ? 45 : 50, repeat: Infinity, ease: 'linear' }}
      />

      {isAurora && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] aurora-ring rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {activeParticles.map((p) => (
        <motion.span
          key={p.id}
          className={`absolute rounded-full live-particle ${isAurora ? `aurora-particle hue-${p.hue ?? 0}` : ''}`}
          style={{ width: p.size, height: p.size, left: p.left, top: p.top }}
          animate={{
            opacity: isAurora ? [0.15, 0.55, 0.15] : [0.15, 0.7, 0.15],
            y: [0, -28 - (p.id % 3) * 10, 0],
            scale: isAurora ? [0.8, 1.2, 0.8] : [0.7, 1.3, 0.7],
          }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}

      <div className="live-bg-grid absolute inset-0" />
      <div className="live-bg-dots absolute inset-0" />

      <motion.div
        className="live-bg-scanline absolute inset-x-0 h-px"
        style={{ top: '20%', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent)' }}
        animate={{ top: ['10%', '90%', '10%'], opacity: [0, 0.6, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {Array.from({ length: 3 }, (_, i) => (
        <motion.div
          key={`diamond-${i}`}
          className="live-bg-diamond absolute"
          style={{ left: `${12 + i * 28}%`, top: `${18 + (i % 4) * 18}%` }}
          animate={{ rotate: 360, y: [0, -24, 0], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 12 + i * 2, repeat: Infinity, ease: 'linear', delay: i * 1.5 }}
        />
      ))}
    </div>
  );
}
