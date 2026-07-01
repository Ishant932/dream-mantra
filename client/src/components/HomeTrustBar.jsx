import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { isMobilePerf } from '../utils/mobilePerf';

function AnimatedNum({ value, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const mobile = isMobilePerf();

  useEffect(() => {
    if (mobile) {
      setCount(value);
      return undefined;
    }
    if (!inView) return undefined;
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
    return undefined;
  }, [inView, value, mobile]);

  return (
    <span ref={ref} className="home-trust-num home-trust-num--compact">
      {count.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

function TrustItem({ item, index }) {
  const isNumber = item.type === 'number';
  const mobile = isMobilePerf();
  const Box = mobile ? 'div' : motion.div;
  const motionProps = mobile ? {} : {
    initial: { opacity: 0, y: 20, scale: 0.94 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: true },
    transition: { delay: index * 0.04, duration: 0.45, type: 'spring', stiffness: 280 },
    whileHover: { y: -4 },
  };

  return (
    <Box
      {...motionProps}
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
    </Box>
  );
}

export default function HomeTrustBar() {
  const { d } = useLang();
  const copy = d('home.trustBar');
  const mobile = isMobilePerf();
  const Header = mobile ? 'div' : motion.div;
  const headerMotion = mobile ? {} : {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
  };

  return (
    <section className="home-trust-strip" aria-label="Trust indicators">
      <div className="max-w-7xl mx-auto px-4">
        <Header
          {...headerMotion}
          className="flex flex-wrap items-center justify-center gap-2 mb-4 sm:mb-6"
        >
          <Shield className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="home-trust-strip__tagline text-sm sm:text-base">{copy.tagline}</p>
        </Header>

        <div className="home-trust-strip__grid">
          {copy.items.map((item, i) => (
            <TrustItem key={`${item.label}-${i}`} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
