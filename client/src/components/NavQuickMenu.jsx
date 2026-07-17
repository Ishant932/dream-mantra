import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, X } from 'lucide-react';
import { NavDropdownPanel, NavDropdownColumn, NavDropdownColumns, NavDropdownLink } from './NavDropdownPanel';
import { useLang } from '../context/LanguageContext';
import { isMobilePerf } from '../utils/mobilePerf';
import { useWhatsAppAgentLink } from '../hooks/useWhatsAppAgentLink';

function WhatsAppIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const panelVariantsLite = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
};

const panelVariantsFull = {
  hidden: { opacity: 0, y: -16, scale: 0.92, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 380, damping: 28 },
  },
  exit: { opacity: 0, y: -10, scale: 0.95, filter: 'blur(4px)', transition: { duration: 0.18 } },
};

export default function NavQuickMenu() {
  const { d } = useLang();
  const waHref = useWhatsAppAgentLink();
  const navQuickMenu = d('navQuickMenu');
  const lite = isMobilePerf();
  const panelVariants = lite ? panelVariantsLite : panelVariantsFull;
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  useEffect(() => {
    const isMobile = () => window.matchMedia('(max-width: 1279px)').matches;
    const apply = () => {
      document.body.style.overflow = open && isMobile() ? 'hidden' : '';
    };
    apply();
    window.addEventListener('resize', apply);
    return () => {
      window.removeEventListener('resize', apply);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <motion.button
        type="button"
        aria-label="Quick menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        whileHover={lite ? undefined : { scale: 1.06 }}
        whileTap={lite ? undefined : { scale: 0.94 }}
        className="relative group"
      >
        {!open && !lite && (
          <motion.span
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 opacity-40 blur-md scale-110"
            animate={{ opacity: [0.25, 0.45, 0.25], scale: [1.05, 1.15, 1.05] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <span
          className={`relative w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
            open
              ? 'bg-gradient-to-br from-amber-600 to-orange-700 border-amber-400 text-amber-50 shadow-xl shadow-amber-500/40'
              : 'bg-gradient-to-br from-[var(--bg-elevated)] to-amber-50 dark:from-sand-800 dark:to-amber-950 border-amber-200/80 dark:border-amber-700 text-amber-700 dark:text-amber-300 group-hover:border-amber-400 group-hover:shadow-lg group-hover:shadow-amber-500/20'
          }`}
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ opacity: 0, rotate: 90 }}>
                <X className="w-5 h-5" />
              </motion.span>
            ) : (
              <motion.span key="grid" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}>
                <LayoutGrid className="w-5 h-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 z-[55] bg-sand-900/25 dark:bg-brand-950/50 xl:hidden ${lite ? '' : 'backdrop-blur-[2px]'}`}
              onClick={() => setOpen(false)}
            />
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed left-3 right-3 top-[calc(var(--site-header-h)+var(--safe-top)+0.5rem)] z-[60] xl:absolute xl:left-auto xl:right-0 xl:top-full xl:mt-3 xl:w-auto"
            >
              <NavDropdownPanel variant="explore" className="nav-quick-panel">
                <NavDropdownColumns className="nav-quick-columns">
                  {navQuickMenu.columns.map((col, colIdx) => (
                    <NavDropdownColumn key={col.title} title={col.title} index={colIdx}>
                      {col.links.map((link, i) => (
                        <NavDropdownLink
                          key={link.to}
                          to={link.to}
                          label={link.label}
                          icon={link.icon}
                          index={i}
                          compact
                          onClick={() => setOpen(false)}
                        />
                      ))}
                    </NavDropdownColumn>
                  ))}
                </NavDropdownColumns>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-mega-wa-cta"
                  onClick={() => setOpen(false)}
                >
                  <WhatsAppIcon className="w-4 h-4 shrink-0" />
                  <span>{navQuickMenu.whatsappLabel || 'Chat with Esh on WhatsApp'}</span>
                </a>
                <p className="nav-mega-footer">
                  {navQuickMenu.footer}
                </p>
              </NavDropdownPanel>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
