import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(scrollTop > 320);
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const circumference = 2 * Math.PI * 22;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 24, scale: 0.75 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.8 }}
          whileHover={{ scale: 1.08, y: -3 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          onClick={scrollUp}
          className="scroll-top-btn"
          aria-label="Scroll to top"
        >
          <span className="scroll-top-glow" aria-hidden="true" />
          <svg className="scroll-top-ring" viewBox="0 0 52 52" aria-hidden="true">
            <circle
              className="scroll-top-ring-track"
              cx="26"
              cy="26"
              r="22"
              fill="none"
              strokeWidth="2.5"
            />
            <motion.circle
              className="scroll-top-ring-progress"
              cx="26"
              cy="26"
              r="22"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (progress / 100) * circumference}
              transform="rotate(-90 26 26)"
              initial={false}
              animate={{ strokeDashoffset: circumference - (progress / 100) * circumference }}
              transition={{ duration: 0.15, ease: 'linear' }}
            />
          </svg>
          <motion.span
            className="scroll-top-icon"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
          </motion.span>
          <span className="scroll-top-label">Top</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
