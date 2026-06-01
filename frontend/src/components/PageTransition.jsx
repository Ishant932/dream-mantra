import { motion } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';

/** Page enter — smooth fade + lift on route change */
export default function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <motion.div
      key={location.pathname + location.search}
      initial={{ opacity: 0, y: 16, scale: 0.992, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 280, damping: 30, mass: 0.8 }}
      className="page-enter"
    >
      {outlet}
    </motion.div>
  );
}
