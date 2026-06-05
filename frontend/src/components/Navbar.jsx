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
import { isMobilePerf } from '../utils/mobilePerf';

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
  const { counsellingMega, crpMega } = useSiteNav();
  const mainNav = buildMainNav(t, counsellingMega, crpMega);
  const navLite = isMobilePerf();

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
    <header
      className={`nav relative border-b transition-all duration-300 ${scrolled ? 'scrolled nav--scrolled-anim' : ''}`}
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="nav-header-inner flex items-center gap-2 sm:gap-3 h-14 sm:h-16 min-w-0">
          <Logo size="md" />

          <nav className="hidden xl:flex items-center gap-4 flex-1 justify-center min-w-0">
            {mainNav.map((item) => (
              <MegaMenu key={item.label} item={item} />
            ))}
          </nav>

          <div className="nav-header-actions flex items-center gap-1 sm:gap-2 ml-auto min-w-0">
            <div className="nav-header-actions__tools flex items-center gap-1 shrink-0">
              <NavQuickMenu />
              <ThemeToggle compact />
              {!navLite && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggle}
                  className="lang-toggle"
                >
                  {lang === 'en' ? 'हिंदी' : 'EN'}
                </motion.button>
              )}
              {navLite && (
                <button type="button" onClick={toggle} className="lang-toggle">
                  {lang === 'en' ? 'हिं' : 'EN'}
                </button>
              )}
            </div>
            <div className="nav-header-actions__auth flex items-center gap-1 shrink-0">
              {user ? (
                <>
                  <Link
                    to={isAdmin ? '/admin' : '/dashboard'}
                    className="btn-primary nav-header-auth-btn whitespace-nowrap"
                  >
                    {isAdmin ? t('nav.admin') : t('nav.dashboard')}
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLogout}
                    className="hidden md:block text-sm text-sand-500 hover:text-royalOrange font-medium px-1"
                  >
                    {t('nav.logout')}
                  </motion.button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link nav-header-auth-link whitespace-nowrap">
                    {t('nav.login')}
                  </Link>
                  <Link to="/signup" className="btn-primary nav-header-auth-btn whitespace-nowrap">
                    {t('nav.signup')}
                  </Link>
                </>
              )}
            </div>
            <button
              type="button"
              className="xl:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
              onClick={() => setMobile(!mobile)}
              aria-label="Menu"
              aria-expanded={mobile}
            >
              {mobile ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {mobile && (
          <div className="xl:hidden border-t overflow-hidden bg-[var(--bg-elevated)] dark:bg-brand-900 max-h-[calc(100dvh-var(--site-header-h)-var(--safe-top)-1rem)] nav-mobile-drawer">
            <div className="nav-mobile-menu p-4 overflow-y-auto overscroll-contain space-y-4 pb-safe">
              <div className="nav-mobile-auth">
                {user ? (
                  <div className="flex flex-col gap-2">
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
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/login" onClick={() => setMobile(false)} className="btn-outline text-center !py-3">
                      {t('nav.login')}
                    </Link>
                    <Link to="/signup" onClick={() => setMobile(false)} className="btn-primary text-center !py-3">
                      {t('nav.signup')}
                    </Link>
                  </div>
                )}
              </div>

              {mainNav.map((item) => (
                <div key={item.label} className="nav-mobile-section">
                  <Link
                    to={item.to}
                    onClick={() => setMobile(false)}
                    className={`font-bold block mb-2 px-1 ${item.highlight ? 'text-gold' : 'text-brand-700'}`}
                  >
                    {item.label}
                  </Link>
                  {item.mega?.map((col) => (
                    <div key={col.title} className="mb-2">
                      <p className="text-xs font-semibold text-royalOrange pl-1 mb-1">{col.title}</p>
                      {col.groups
                        ? col.groups.map((g) => (
                            <div key={g.label} className="mb-2 pl-1">
                              <p className="text-xs font-bold text-sand-700 pl-2 mb-1">{g.icon} {g.label}</p>
                              {g.links.map((l) => (
                                <Link
                                  key={l.to + l.label}
                                  to={l.to}
                                  onClick={() => setMobile(false)}
                                  className="block py-1.5 pl-4 text-sm text-sand-600 rounded-lg hover:bg-lime/10"
                                >
                                  {l.icon ? `${l.icon} ` : ''}{l.label}
                                </Link>
                              ))}
                            </div>
                          ))
                        : col.links.map((l) => (
                            <Link
                              key={l.to + l.label}
                              to={l.to}
                              onClick={() => setMobile(false)}
                              className="block py-1.5 pl-4 text-sm text-sand-600 rounded-lg hover:bg-lime/10"
                            >
                              {l.icon ? `${l.icon} ` : ''}{l.label}
                            </Link>
                          ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
      )}
    </header>
  );
}
