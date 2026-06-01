import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Sparkles } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import NavQuickMenu from './NavQuickMenu';
import { NavDropdownPanel, NavDropdownColumn, NavDropdownColumns, NavDropdownLink, NavDropdownLinkGroup } from './NavDropdownPanel';
import { useSiteNav } from '../i18n/useSiteContent';
import { handleHashNavClick } from '../utils/scrollHash';

const buildMainNav = (t, counsellingMega, crpMega) => [
  {
    label: t('nav.counselling'),
    to: '/counselling',
    mega: counsellingMega,
  },
  {
    label: t('nav.crp'),
    to: '/crp/explore',
    highlight: true,
    mega: crpMega,
  },
];

function MegaMenu({ item }) {
  const [open, setOpen] = useState(false);
  const isCrp = item.highlight;
  const variant = isCrp ? 'crp' : 'counselling';

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
        <Link
          to={item.to}
          className={`flex items-center gap-1.5 py-2 px-3 rounded-full text-sm font-semibold transition ${
            isCrp
              ? 'text-white shadow-lg animate-[gradientShift_5s_ease_infinite] bg-[length:200%_auto]'
              : 'nav-link'
          }`}
          style={isCrp ? { background: 'linear-gradient(135deg, #FF6B4A, #E8512E)', boxShadow: '0 8px 24px rgba(255,107,74,0.35)' } : undefined}
        >
          {isCrp && (
            <motion.span
              animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
            </motion.span>
          )}
          <span className="max-w-[140px] xl:max-w-none truncate">{item.label}</span>
          <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </Link>
      </motion.div>
      <AnimatePresence>
        {open && item.mega && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="absolute top-full left-0 pt-4 z-50"
          >
            <NavDropdownPanel variant={variant}>
              <NavDropdownColumns>
              {item.mega.map((col, colIdx) => (
                <NavDropdownColumn key={col.title} title={col.title} index={colIdx}>
                  {col.groups
                    ? col.groups.map((g, gi) => (
                        <NavDropdownLinkGroup key={g.label} {...g} index={gi} />
                      ))
                    : col.links.map((l, i) => (
                        <NavDropdownLink
                          key={l.to + l.label}
                          to={l.to}
                          label={l.label}
                          desc={l.desc}
                          icon={l.icon}
                          index={i}
                        />
                      ))}
                </NavDropdownColumn>
              ))}
              </NavDropdownColumns>
            </NavDropdownPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar({ scrolled = false }) {
  const { t, lang, toggle } = useLang();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobile, setMobile] = useState(false);
  const { counsellingMega, crpMega, quickLinks } = useSiteNav();
  const mainNav = buildMainNav(t, counsellingMega, crpMega);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobile(false);
  };

  useEffect(() => {
    if (mobile) {
      document.body.classList.add('mobile-nav-open');
    } else {
      document.body.classList.remove('mobile-nav-open');
    }
    return () => document.body.classList.remove('mobile-nav-open');
  }, [mobile]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1280) setMobile(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setMobile(false);
  }, [location.pathname]);

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`nav relative border-b transition-all duration-300 ${scrolled ? 'scrolled nav--scrolled-anim' : ''}`}
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Logo size="md" />

          <nav className="hidden xl:flex items-center gap-4">
            {mainNav.map((item) => (
              <MegaMenu key={item.label} item={item} />
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <ThemeToggle compact />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggle} className="lang-toggle hidden xl:inline-flex">
              {lang === 'en' ? 'हिंदी' : 'EN'}
            </motion.button>
            <div className="hidden xl:block">
              <NavQuickMenu />
            </div>
            {user ? (
              <>
                <Link to={isAdmin ? '/admin' : '/dashboard'} className="btn-primary !py-2 !px-4 !text-sm hidden sm:inline-flex">
                  {isAdmin ? t('nav.admin') : t('nav.dashboard')}
                </Link>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogout}
                  className="hidden sm:block text-sm text-sand-500 hover:text-royalOrange font-medium px-1"
                >
                  {t('nav.logout')}
                </motion.button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block nav-link px-2">{t('nav.login')}</Link>
                <Link to="/signup" className="btn-primary !py-2 !px-3 sm:!px-4 !text-xs sm:!text-sm whitespace-nowrap">{t('nav.signup')}</Link>
              </>
            )}
            <button className="xl:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center" onClick={() => setMobile(!mobile)} aria-label="Menu" aria-expanded={mobile}>
              {mobile ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="xl:hidden border-t overflow-hidden bg-[var(--bg-elevated)] dark:bg-brand-900 max-h-[calc(100dvh-var(--site-header-h)-var(--safe-top)-1rem)]"
          >
            <div className="p-4 overflow-y-auto overscroll-contain space-y-3 pb-safe">
              <button type="button" onClick={toggle} className="lang-toggle w-full mb-2">
                {lang === 'en' ? 'हिंदी में देखें' : 'View in English'}
              </button>
              {user && (
                <div className="flex flex-col gap-2 pb-2 border-b border-[var(--border-subtle)]">
                  <Link
                    to={isAdmin ? '/admin' : '/dashboard'}
                    onClick={() => setMobile(false)}
                    className="btn-primary w-full text-center !py-3"
                  >
                    {isAdmin ? t('nav.admin') : t('nav.dashboard')}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-3 text-sm font-semibold text-sand-500 hover:text-royalOrange rounded-xl border border-[var(--border-subtle)]"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              )}
              <p className="text-xs font-bold text-lime uppercase tracking-wider px-1">{quickLinks.title}</p>
              {quickLinks.links.map((l, i) => (
                <motion.div key={l.to} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link
                    to={l.to}
                    onClick={(e) => {
                      if (!handleHashNavClick(e, l.to, location.pathname, () => setMobile(false))) {
                        setMobile(false);
                      }
                    }}
                    className="block py-2 px-3 text-sm rounded-lg hover:bg-lime/15"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <Link to="/crp/explore" onClick={() => setMobile(false)} className="block font-bold text-gold bg-gradient-to-r from-bottleGreen to-bottleGreen-light rounded-xl px-4 py-3 border border-lime/30">{t('nav.crp')}</Link>
              {mainNav.map((item) => (
                <div key={item.label}>
                  <Link to={item.to} onClick={() => setMobile(false)} className="font-bold text-brand-700 block mb-1">{item.label}</Link>
                  {item.mega?.map((col) => (
                    <div key={col.title} className="mb-2">
                      <p className="text-xs font-semibold text-royalOrange pl-3 mb-1">{col.title}</p>
                      {col.groups
                        ? col.groups.map((g) => (
                            <div key={g.label} className="mb-2 pl-3">
                              <p className="text-xs font-bold text-sand-700 pl-2 mb-1">{g.icon} {g.label}</p>
                              {g.links.map((l) => (
                                <Link key={l.to + l.label} to={l.to} onClick={() => setMobile(false)} className="block py-1.5 pl-5 text-sm text-sand-600">
                                  {l.icon ? `${l.icon} ` : ''}{l.label}
                                </Link>
                              ))}
                            </div>
                          ))
                        : col.links.map((l) => (
                            <Link key={l.to + l.label} to={l.to} onClick={() => setMobile(false)} className="block py-1.5 pl-5 text-sm text-sand-600">
                              {l.icon ? `${l.icon} ` : ''}{l.label}
                            </Link>
                          ))}
                    </div>
                  ))}
                </div>
              ))}
              {!user && <Link to="/login" onClick={() => setMobile(false)} className="btn-outline w-full text-center block mt-2">Login</Link>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
