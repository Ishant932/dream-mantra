import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, X } from 'lucide-react';
import { NavDropdownPanel, NavDropdownColumn, NavDropdownColumns, NavDropdownLink } from './NavDropdownPanel';
import { useLang } from '../context/LanguageContext';

const panelVariants = {
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
  const navQuickMenu = d('navQuickMenu');
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
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="relative group"
      >
        {!open && (
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
              className="fixed inset-0 z-[55] bg-sand-900/20 dark:bg-brand-950/40 backdrop-blur-[2px] xl:hidden"
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
                          desc={link.desc}
                          icon={link.icon}
                          index={i}
                          onClick={() => setOpen(false)}
                        />
                      ))}
                    </NavDropdownColumn>
                  ))}
                </NavDropdownColumns>
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="nav-mega-footer"
                >
                  {navQuickMenu.footer}
                </motion.p>
              </NavDropdownPanel>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
