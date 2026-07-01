import { motion, useReducedMotion } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';
import { isMobilePerf } from '../utils/mobilePerf';

/** Page enter — fade on route change; lightweight spring on mobile */
export default function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();
  const reduceMotion = useReducedMotion();
  const mobile = isMobilePerf();

  if (reduceMotion) {
    return <div className="page-enter">{outlet}</div>;
  }

  if (mobile) {
    return (
      <motion.div
        key={location.pathname + location.search}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="page-enter page-enter--mobile"
      >
        {outlet}
      </motion.div>
    );
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
