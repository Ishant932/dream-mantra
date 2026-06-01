import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

function AnimatedNum({ value, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * value));
      if (p < 1) requestAnimationFrame(tick);
      else setCount(value);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <span ref={ref} className="home-trust-num home-trust-num--compact">
      {count.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

function TrustItem({ item, index }) {
  const isNumber = item.type === 'number';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.45, type: 'spring', stiffness: 280 }}
      whileHover={{ y: -4 }}
      className={`home-trust-chip ${isNumber ? 'home-trust-chip--number' : 'home-trust-chip--badge'}`}
    >
      {item.icon && <span className="home-trust-chip__icon" aria-hidden>{item.icon}</span>}
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

  return (
    <section className="home-trust-strip" aria-label="Trust indicators">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-2 mb-6"
        >
          <Shield className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="home-trust-strip__tagline font-accent">{copy.tagline}</p>
        </motion.div>

        <div className="home-trust-strip__grid">
          {copy.items.map((item, i) => (
            <TrustItem key={`${item.label}-${i}`} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
