import { useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  BookOpen,
  Sparkles,
  Layers,
  Map,
  Shield,
  Calendar,
  FileText,
  ChevronRight,
  Settings,
  BarChart3,
  UserCog,
} from 'lucide-react';
import CopyableUserId from './CopyableUserId';
import { scrollToElement } from '../utils/scrollToTop';
import { isMobilePerf } from '../utils/mobilePerf';

const TAB_ICONS = {
  overview: LayoutGrid,
  careers: BookOpen,
  ai: Sparkles,
  assess: Layers,
  roadmap: Map,
  security: Shield,
  book: Calendar,
  reports: FileText,
  bookings: Calendar,
  users: Shield,
  counsellors: UserCog,
  payments: Layers,
  'process-guides': BookOpen,
  settings: Settings,
  analytics: BarChart3,
};

const panelVariants = {
  initial: { opacity: 0, x: 24, filter: 'blur(4px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -16, filter: 'blur(4px)', transition: { duration: 0.25 } },
};

export default function DashboardSidebarLayout({
  tabs,
  defaultTab,
  children,
  id = 'dashboard',
  user,
  profileCompletion = 0,
  showProfileCompletion = true,
  sectionTitle,
  anchorRef,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const headerRef = useRef(null);
  const params = new URLSearchParams(location.search);
  const active = params.get('tab') || defaultTab || tabs[0]?.id;

  const activeTab = tabs.find((t) => t.id === active) || tabs[0];
  const panelTab = tabs.some((t) => t.id === active) ? active : (activeTab?.id || 'overview');
  const lite = isMobilePerf();

  const scrollToTabStart = useCallback(() => {
    const el = anchorRef?.current || headerRef.current || mainRef.current;
    scrollToElement(el, { offset: 8, behavior: 'instant' });
  }, [anchorRef]);

  const setTab = (tabId) => {
    if (tabId === active) return;
    navigate({ pathname: location.pathname, search: `?tab=${tabId}` }, { replace: true });
    requestAnimationFrame(() => requestAnimationFrame(scrollToTabStart));
  };

  useEffect(() => {
    scrollToTabStart();
    const timers = [50, 150, 400].map((ms) => window.setTimeout(scrollToTabStart, ms));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [panelTab, scrollToTabStart]);

  return (
    <div className="dash-sidebar-layout no-reveal">
      <div className="dash-sidebar-grid">
        {/* Left sidebar */}
        <aside className="dash-sidebar" aria-label="Dashboard navigation">
          <div className="dash-sidebar-inner">
            {sectionTitle && (
              <p className="dash-sidebar-heading">{sectionTitle}</p>
            )}

            {user && (
              <div className="dash-sidebar-profile">
                <div className="dash-sidebar-avatar-wrap">
                  {showProfileCompletion ? (
                    <svg className="dash-sidebar-ring" viewBox="0 0 44 44" aria-hidden="true">
                      <circle cx="22" cy="22" r="19" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="3" />
                      <circle
                        cx="22"
                        cy="22"
                        r="19"
                        fill="none"
                        stroke="url(#dashRingGrad)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${profileCompletion * 1.19} 119`}
                        transform="rotate(-90 22 22)"
                      />
                      <defs>
                        <linearGradient id="dashRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#C9A84C" />
                          <stop offset="100%" stopColor="#FF6B4A" />
                        </linearGradient>
                      </defs>
                    </svg>
                  ) : (
                    <span className="dash-sidebar-ring dash-sidebar-ring--static" aria-hidden="true" />
                  )}
                  <span className="dash-sidebar-avatar">{user.name?.[0]?.toUpperCase() || '?'}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="dash-sidebar-name truncate">{user.name}</p>
                  {showProfileCompletion && user.user_uid ? (
                    <div className="dash-sidebar-uid-block mt-1.5">
                      <p className="dash-sidebar-uid-label">Dreams ID</p>
                      <CopyableUserId uid={user.user_uid} compact animate={false} className="dash-sidebar-uid" />
                    </div>
                  ) : showProfileCompletion ? (
                    <p className="dash-sidebar-meta">{profileCompletion}% profile complete</p>
                  ) : (
                    <p className="dash-sidebar-meta">Administrator</p>
                  )}
                  {showProfileCompletion && user.user_uid && (
                    <p className="dash-sidebar-meta mt-1">{profileCompletion}% profile complete</p>
                  )}
                </div>
              </div>
            )}

            <div className="dash-mobile-tab-picker">
              <label htmlFor={`${id}-tab-select`} className="dash-mobile-tab-picker-label">
                Section
              </label>
              <select
                id={`${id}-tab-select`}
                className="dash-mobile-tab-select input-field"
                value={panelTab}
                onChange={(e) => setTab(e.target.value)}
                aria-label="Choose dashboard section"
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label}{tab.locked ? ' (locked)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <nav
              className="dash-sidebar-nav dash-sidebar-nav--desktop"
              role="tablist"
              aria-label="Dashboard sections"
            >
              {tabs.map((tab) => {
                const Icon = TAB_ICONS[tab.id] || LayoutGrid;
                const isActive = active === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setTab(tab.id)}
                    className={`dash-sidebar-item ${isActive ? 'dash-sidebar-item-active' : ''}`}
                  >
                    {isActive && (
                      <span className="dash-sidebar-indicator" aria-hidden="true" />
                    )}
                    <span className="dash-sidebar-icon">
                      <Icon className="w-[18px] h-[18px]" />
                    </span>
                    <span className="dash-sidebar-label-wrap">
                      <span className="dash-sidebar-label">
                        {tab.label}
                        {tab.locked && <span className="text-[10px] ml-1 opacity-60">🔒</span>}
                      </span>
                      {tab.desc && (
                        <span className="dash-sidebar-desc">{tab.desc}</span>
                      )}
                    </span>
                    <ChevronRight className={`dash-sidebar-chevron ${isActive ? 'opacity-100' : ''}`} />
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <div className="dash-sidebar-main scroll-mt-28" ref={mainRef}>
          <div
            ref={headerRef}
            id={`${id}-tab-header`}
            className="dash-sidebar-main-header"
          >
            {activeTab && (
              <>
                <div className="dash-sidebar-main-icon">
                  {(() => {
                    const Icon = TAB_ICONS[activeTab.id] || LayoutGrid;
                    return <Icon className="w-5 h-5" />;
                  })()}
                </div>
                <div>
                  <h3 className="dash-sidebar-main-title">{activeTab.label}</h3>
                  {activeTab.desc && (
                    <p className="dash-sidebar-main-desc">{activeTab.desc}</p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="dash-sidebar-panel" role="tabpanel" id={`${id}-panel`}>
            {lite ? (
              <div key={panelTab}>
                {typeof children === 'function' ? children(panelTab) : children}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={panelTab}
                  variants={panelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {typeof children === 'function' ? children(panelTab) : children}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
