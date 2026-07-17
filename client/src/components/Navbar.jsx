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

const buildMainNav = (t, counsellingMega, crpMega, counsellingCommon = [], commonTitle = 'Common') => [
  {
    label: t('nav.counselling'),
    to: '/counselling',
    highlight: true,
    mega: counsellingMega,
    common: counsellingCommon,
    commonTitle,
  },
  {
    label: t('nav.crp'),
    to: '/crp?tab=launchpad',
    highlight: true,
    mega: crpMega,
  },
];

function MegaMenu({ item }) {
  const [open, setOpen] = useState(false);
  const isCrp = item.to?.includes('/crp');
  const variant = isCrp ? 'crp' : 'counselling';

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
        <Link
          to={item.to}
          className="nav-mega-cta flex items-center gap-1.5 py-2 px-3.5 rounded-full text-sm font-semibold transition text-white shadow-lg animate-[gradientShift_5s_ease_infinite] bg-[length:200%_auto]"
          style={{ background: 'linear-gradient(135deg, #FF6B4A, #E8512E)', boxShadow: '0 8px 24px rgba(255, 107, 74, 0.35)' }}
        >
          <motion.span
            animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
          </motion.span>
          <span className="max-w-[150px] xl:max-w-none truncate">{item.label}</span>
          <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </Link>
      </motion.div>
      <AnimatePresence>
        {open && item.mega && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 z-50 nav-mega-dropdown">
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
                          compact={variant === 'counselling' || variant === 'crp'}
                        />
                      ))}
                </NavDropdownColumn>
              ))}
              </NavDropdownColumns>
              {item.common?.length > 0 && (
                <div className="nav-mega-common" aria-label="Common">
                  {item.common.map((l, i) => (
                    <NavDropdownLink
                      key={l.to + l.label}
                      to={l.to}
                      label={l.label}
                      desc={l.desc}
                      icon={l.icon}
                      index={i}
                      compact={variant === 'counselling' || variant === 'crp'}
                    />
                  ))}
                </div>
              )}
            </NavDropdownPanel>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar({ scrolled = false }) {
  const { t, lang, toggle, d } = useLang();
  const { user, logout, isAdmin, isCounsellor } = useAuth();
  const dashboardPath = isAdmin ? '/admin' : isCounsellor ? '/counsellor' : '/dashboard';
  const dashboardLabel = isAdmin ? t('nav.admin') : isCounsellor ? 'Counsellor' : t('nav.dashboard');
  const navigate = useNavigate();
  const location = useLocation();
  const [mobile, setMobile] = useState(false);
  const { counsellingMega, counsellingCommon, crpMega } = useSiteNav();
  const navQuickMenu = d('navQuickMenu');
  const commonTitle = d('navMega')?.common?.title || 'Common';
  const mainNav = buildMainNav(t, counsellingMega, crpMega, counsellingCommon, commonTitle);
  const navLite = isMobilePerf();

  const closeMobile = () => setMobile(false);

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

  const drawerVariants = navLite
    ? {
        hidden: { x: '100%' },
        visible: { x: 0, transition: { type: 'tween', duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
        exit: { x: '100%', transition: { duration: 0.22 } },
      }
    : {
        hidden: { x: '100%', opacity: 0.6 },
        visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 340, damping: 32 } },
        exit: { x: '100%', opacity: 0, transition: { duration: 0.2 } },
      };

  return (
    <header
      className={`nav relative border-b transition-all duration-300 ${scrolled ? 'scrolled nav--scrolled-anim' : ''}`}
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="nav-header-inner relative flex items-center gap-2 sm:gap-3 h-14 sm:h-16 min-w-0">
          <Logo size="md" />

          <nav className="hidden xl:flex items-center gap-3 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[5]">
            {mainNav.map((item) => (
              <MegaMenu key={item.label} item={item} />
            ))}
          </nav>

          <div className="nav-header-actions flex items-center gap-1 sm:gap-2 ml-auto min-w-0">
            <div className="nav-header-actions__tools flex items-center gap-1 shrink-0">
              <div className="hidden xl:block nav-quick-menu-wrap">
                <NavQuickMenu />
              </div>
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
            <div className="nav-header-actions__auth hidden xl:flex items-center gap-1 shrink-0">
              {user ? (
                <>
                  <Link
                    to={dashboardPath}
                    className="btn-primary nav-header-auth-btn whitespace-nowrap"
                  >
                    {dashboardLabel}
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
              className="nav-mobile-toggle xl:hidden"
              onClick={() => setMobile(!mobile)}
              aria-label={mobile ? 'Close menu' : 'Open menu'}
              aria-expanded={mobile}
            >
              {mobile ? <X className="w-6 h-6" strokeWidth={2.25} /> : <Menu className="w-6 h-6" strokeWidth={2.25} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobile && (
          <>
            <motion.button
              type="button"
              className="nav-mobile-backdrop xl:hidden"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobile}
            />
            <motion.aside
              className="nav-mobile-drawer-panel xl:hidden"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              aria-label="Mobile navigation"
            >
              <div className="nav-mobile-drawer-header">
                <span className="nav-mobile-drawer-title">{t('nav.menu')}</span>
                <button
                  type="button"
                  className="nav-mobile-drawer-close"
                  onClick={closeMobile}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" strokeWidth={2.25} />
                </button>
              </div>
              <div className="nav-mobile-menu overflow-y-auto overscroll-contain">
                <div className="nav-mobile-auth">
                  {user ? (
                    <div className="flex flex-col gap-2">
                      <Link
                        to={dashboardPath}
                        onClick={closeMobile}
                        className="btn-primary w-full text-center !py-3"
                      >
                        {dashboardLabel}
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
                      <Link to="/login" onClick={closeMobile} className="btn-outline text-center !py-3">
                        {t('nav.login')}
                      </Link>
                      <Link to="/signup" onClick={closeMobile} className="btn-primary text-center !py-3">
                        {t('nav.signup')}
                      </Link>
                    </div>
                  )}
                </div>

                <div className="nav-mobile-pathways">
                  {mainNav.map((item, i) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={closeMobile}
                      className={`nav-mobile-pathway${i === 0 ? ' nav-mobile-pathway--counselling' : ' nav-mobile-pathway--training'}`}
                      style={{ '--i': i }}
                    >
                      <span className="nav-mobile-pathway__label">{item.label}</span>
                      <span className="nav-mobile-pathway__go" aria-hidden>→</span>
                    </Link>
                  ))}
                </div>

                {(navQuickMenu.columns || []).map((col, colIdx) => (
                  <div key={col.title} className={`nav-mobile-section nav-mobile-section--${colIdx === 0 ? 'discover' : 'connect'}`}>
                    <p className="nav-mobile-section-label">{col.title}</p>
                    <div className="nav-mobile-link-list">
                      {col.links.map((link, i) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={closeMobile}
                          className="nav-mobile-link"
                          style={{ '--i': 4 + colIdx * 6 + i }}
                        >
                          {link.icon ? (
                            <span className="nav-mobile-link__icon" aria-hidden>{link.icon}</span>
                          ) : null}
                          <span className="nav-mobile-link__text">{link.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
