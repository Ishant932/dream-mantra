import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen } from 'lucide-react';
import { EMBRYOLOGY_SECTIONS } from '../data/dmitEmbryologyContent';

export default function DermatoglyphicsDeepDive({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="dmit-deep-dive__backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            className="dmit-deep-dive"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dmit-deep-dive-title"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="dmit-deep-dive__head">
              <div>
                <span className="dmit-deep-dive__badge"><BookOpen className="w-4 h-4" /> Scientific deep dive</span>
                <h2 id="dmit-deep-dive-title" className="dmit-deep-dive__title">From Conception to Birth</h2>
                <p className="dmit-deep-dive__subtitle">Brain development, fingerprints & dermatoglyphics</p>
              </div>
              <button type="button" className="dmit-deep-dive__close" onClick={onClose} aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="dmit-deep-dive__body">
              {EMBRYOLOGY_SECTIONS.map((block) => (
                <section
                  key={block.id}
                  className={`dmit-deep-dive__block dmit-deep-dive__block--${block.tone || 'amber'}`}
                >
                  {block.title && <h3 className="dmit-deep-dive__h">{block.title}</h3>}
                  {block.subtitle && <h4 className="dmit-deep-dive__h4">{block.subtitle}</h4>}
                  {block.paragraphs?.map((p) => (
                    <p key={p.slice(0, 40)} className="dmit-deep-dive__p">{p}</p>
                  ))}
                  {block.bullets?.length > 0 && (
                    <ul className="dmit-deep-dive__ul">
                      {block.bullets.map((b) => <li key={b}>{b}</li>)}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
