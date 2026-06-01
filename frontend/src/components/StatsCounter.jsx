import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

function Counter({ value, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
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
    <span ref={ref} className="stat-number">
      {count.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

function StatDisplay({ item }) {
  if (item.text) {
    return <span className="stat-number stat-number--text">{item.text}</span>;
  }
  return <Counter value={item.value} suffix={item.suffix || ''} />;
}

export default function StatsCounter({ items }) {
  return (
    <section className="py-14 stats-banner border-y reveal">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, scale: 1.03 }}
            className="text-center"
          >
            <StatDisplay item={s} />
            <p className="stat-label">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
