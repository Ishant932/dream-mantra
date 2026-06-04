import { motion, useReducedMotion } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';

/** Page enter — lightweight fade on route change (no blur for mobile perf) */
export default function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();
  const reduceMotion = useReducedMotion();
  const isMobile = typeof document !== 'undefined'
    && document.documentElement.classList.contains('is-mobile-perf');

  if (reduceMotion || isMobile) {
    return <div className="page-enter">{outlet}</div>;
  }

  return (
    <motion.div
      key={location.pathname + location.search}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="page-enter"
    >
      {outlet}
    </motion.div>
  );
}
