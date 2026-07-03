import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { isMobilePerf } from '../utils/mobilePerf';

function AnimatedNum({ value, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });

  useEffect(() => {
    if (!inView) return undefined;
    const duration = isMobilePerf() ? 900 : 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * value));
      if (p < 1) requestAnimationFrame(tick);
      else setCount(value);
    };
    requestAnimationFrame(tick);
    return undefined;
  }, [inView, value]);

  return (
    <span ref={ref} className="home-trust-num home-trust-num--compact">
      {count.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

function TrustItem({ item, index }) {
  const isNumber = item.type === 'number';
  const lite = isMobilePerf();

  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-24px' }}
      transition={{
        delay: index * 0.07,
        duration: lite ? 0.4 : 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={lite ? undefined : { y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`home-trust-chip home-trust-chip--animated ${isNumber ? 'home-trust-chip--number' : 'home-trust-chip--badge'}`}
      style={{ '--trust-i': index }}
    >
      {item.icon && (
        <motion.span
          className="home-trust-chip__icon"
          aria-hidden
          initial={{ scale: 0.5, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.07 + 0.08, type: 'spring', stiffness: 360, damping: 18 }}
        >
          {item.icon}
        </motion.span>
      )}
      {isNumber ? (
        <>
          <AnimatedNum value={item.value} suffix={item.suffix || ''} />
          <p className="home-trust-chip__label">{item.label}</p>
        </>
      ) : (
        <p className="home-trust-chip__badge-text">{item.label}</p>
      )}
    </motion.div>
  );
}

export default function HomeTrustBar() {
  const { d } = useLang();
  const copy = d('home.trustBar');
  const lite = isMobilePerf();

  return (
    <section className="no-reveal home-trust-strip home-trust-strip--animated" aria-label="Trust indicators">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: lite ? 0.35 : 0.45 }}
          className="home-trust-strip__header flex flex-wrap items-center justify-center gap-2 mb-4 sm:mb-6"
        >
          <motion.span
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 4 }}
            className="inline-flex"
          >
            <Shield className="w-5 h-5 text-amber-600 shrink-0" />
          </motion.span>
          <p className="home-trust-strip__tagline text-sm sm:text-base">{copy.tagline}</p>
        </motion.div>

        <div className="home-trust-strip__grid">
          {copy.items.map((item, i) => (
            <TrustItem key={item.label} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
