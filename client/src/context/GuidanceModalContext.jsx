import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import FreeGuidanceForm from '../components/FreeGuidanceForm';
import { useLang } from './LanguageContext';
import { isGuidancePath } from '../utils/guidancePath';

const GuidanceModalContext = createContext({ openGuidance: () => {}, closeGuidance: () => {} });

export function useGuidanceModal() {
  return useContext(GuidanceModalContext);
}

function GuidanceModal({ open, onClose }) {
  const { d } = useLang();
  const fg = d('freeGuidance') || {};

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="guidance-modal"
          className="guidance-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="guidance-modal__panel guidance-modal__panel--pro"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="guidance-modal__close" onClick={onClose} aria-label="Close">
              <X className="w-5 h-5" />
            </button>
            <div className="guidance-modal__head guidance-modal__head--pro">
              <span className="guidance-modal__badge guidance-modal__badge--pro">
                {fg.badge || 'Free guidance call'}
              </span>
              <h2 className="guidance-modal__title guidance-modal__title--orange">{fg.formTitle || 'Book a free guidance call'}</h2>
              <p className="guidance-modal__sub">
                {fg.formSubtitle || 'Share your details. A counsellor will call you back.'}
              </p>
            </div>
            <FreeGuidanceForm
              className="free-guidance-form--modal"
              showLoginHint={false}
              hideHeader
              variant="modal"
              skipUrlIntent
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

export function GuidanceModalProvider({ children }) {
  const [open, setOpen] = useState(false);
  const openGuidance = useCallback(() => setOpen(true), []);
  const closeGuidance = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onClick = (e) => {
      const el = e.target.closest('[data-guidance-open], a[href*="#guidance"], a[href*="contact#guidance"]');
      if (!el || el.dataset.guidanceSkip) return;
      const href = el.getAttribute('href') || '';
      if (el.tagName === 'A' && href && !isGuidancePath(href)) return;
      e.preventDefault();
      openGuidance();
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [openGuidance]);

  return (
    <GuidanceModalContext.Provider value={{ openGuidance, closeGuidance }}>
      {children}
      <GuidanceModal open={open} onClose={closeGuidance} />
    </GuidanceModalContext.Provider>
  );
}
