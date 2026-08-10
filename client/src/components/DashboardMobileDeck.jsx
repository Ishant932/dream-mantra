import { useState } from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import CopyableUserId from './CopyableUserId';
import { isPhoneViewport } from '../utils/mobilePerf';

const TAB_ICONS = {
  overview: '◆',
  careers: '◎',
  ai: '✦',
  assess: '⬡',
  roadmap: '◇',
  security: '⛨',
  book: '◷',
  reports: '▤',
  bookings: '◷',
  users: '◎',
  counsellors: '◉',
  payments: '◈',
  'process-guides': '▣',
  settings: '⚙',
  analytics: '▲',
  support: '✉',
  counselling: '🧭',
  training: '🚀',
  modules: '⬢',
  vouchers: '★',
  leads: '◐',
  blogs: '▤',
};

function tabEmoji(id) {
  return TAB_ICONS[id] || '•';
}

export default function DashboardMobileDeck({
  tabs,
  activeTab,
  panelTab,
  onSelectTab,
  user,
  profileCompletion = 0,
  showProfileCompletion = true,
  sectionTitle,
  variant = 'user',
  headerAction,
  nextStep,
  hideSectionRail = false,
}) {
  const [flipped, setFlipped] = useState(false);
  const [burst, setBurst] = useState(false);
  const phone = isPhoneViewport();

  if (!phone) return null;

  const pickTab = (tabId) => {
    if (tabId === panelTab) return;
    setBurst(true);
    window.setTimeout(() => setBurst(false), 520);
    onSelectTab(tabId);
  };

  const metaLine = showProfileCompletion && user?.user_uid
    ? null
    : showProfileCompletion
      ? `${profileCompletion}% complete`
      : 'Command center';

  return (
    <div className={`dash-mobile-deck dash-mobile-deck--${variant}${burst ? ' dash-mobile-deck--burst' : ''}`}>
      <div className="dash-mobile-deck__aurora" aria-hidden />
      <div className="dash-mobile-deck__grid" aria-hidden />

      <div className="dash-mobile-deck__top">
        {headerAction && (
          <div className="dash-mobile-deck__notif">{headerAction}</div>
        )}
        {sectionTitle && <span className="dash-mobile-deck__section">{sectionTitle}</span>}
      </div>

      {user && (
        <div className={`dash-mobile-deck__flip${flipped ? ' dash-mobile-deck__flip--back' : ''}`}>
          <div className="dash-mobile-deck__flip-inner">
            <div className="dash-mobile-deck__flip-face dash-mobile-deck__flip-face--front">
              <button
                type="button"
                className="dash-mobile-deck__flip-hit"
                onClick={() => setFlipped((f) => !f)}
                aria-label={flipped ? 'Show profile front' : 'Flip ID card'}
              >
                <span className="dash-mobile-deck__avatar">{user.name?.[0]?.toUpperCase() || '?'}</span>
                <div className="dash-mobile-deck__who">
                  <p className="dash-mobile-deck__name">{user.name}</p>
                  {metaLine && <p className="dash-mobile-deck__meta">{metaLine}</p>}
                  {showProfileCompletion && user.user_uid && !flipped && (
                    <p className="dash-mobile-deck__hint">Tap to flip ID →</p>
                  )}
                </div>
              </button>
              {nextStep && (variant === 'admin' || (showProfileCompletion && variant === 'user')) && (
                <button
                  type="button"
                  className="dash-mobile-deck__next-step"
                  onClick={nextStep.onClick}
                  title={nextStep.title}
                  aria-label={`${nextStep.shortCta || 'Next step'}: ${nextStep.title}`}
                >
                  <span className="dash-mobile-deck__next-step-icon" aria-hidden>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.75} />
                  </span>
                  <span className="dash-mobile-deck__next-step-label">{nextStep.shortCta || 'Next step'}</span>
                </button>
              )}
              {showProfileCompletion && (
                <div className="dash-mobile-deck__ring" style={{ '--pct': profileCompletion }}>
                  <svg viewBox="0 0 36 36" aria-hidden>
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke="url(#deckRing)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${profileCompletion * 0.97} 97`}
                      transform="rotate(-90 18 18)"
                    />
                    <defs>
                      <linearGradient id="deckRing" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#C9A84C" />
                        <stop offset="100%" stopColor="#FF6B4A" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="dash-mobile-deck__pct">{profileCompletion}%</span>
                </div>
              )}
            </div>
            <div className="dash-mobile-deck__flip-face dash-mobile-deck__flip-face--back">
              <button
                type="button"
                className="dash-mobile-deck__flip-hit dash-mobile-deck__flip-hit--back"
                onClick={() => setFlipped((f) => !f)}
                aria-label="Show profile front"
              >
                <Zap className="w-5 h-5 text-amber-500 shrink-0" aria-hidden />
                <div className="min-w-0 flex-1">
                  {showProfileCompletion && user.user_uid ? (
                    <>
                      <p className="dash-mobile-deck__id-label">Dreams ID</p>
                      <CopyableUserId uid={user.user_uid} compact animate={false} className="dash-mobile-deck__uid" />
                    </>
                  ) : (
                    <>
                      <p className="dash-mobile-deck__id-label">Access level</p>
                      <p className="dash-mobile-deck__admin-badge">Administrator</p>
                      <p className="dash-mobile-deck__meta">Full platform control</p>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {!hideSectionRail && (
      <div className="dash-mobile-deck__rail-wrap">
        <p className="dash-mobile-deck__rail-label">Sections</p>
        <div className="dash-mobile-deck__rail" role="tablist" aria-label="Dashboard sections">
          {tabs.map((tab) => {
            const isActive = panelTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                data-tab-id={tab.id}
                aria-selected={isActive}
                disabled={tab.locked}
                className={`dash-mobile-deck__chip${isActive ? ' dash-mobile-deck__chip--active' : ''}${tab.locked ? ' dash-mobile-deck__chip--locked' : ''}`}
                onClick={() => !tab.locked && pickTab(tab.id)}
              >
                <span className="dash-mobile-deck__chip-icon" aria-hidden>{tabEmoji(tab.id)}</span>
                <span className="dash-mobile-deck__chip-label">{tab.label}</span>
                {tab.locked && <span className="dash-mobile-deck__lock" aria-hidden>🔒</span>}
              </button>
            );
          })}
        </div>
      </div>
      )}

      {activeTab && !hideSectionRail && (
        <div className="dash-mobile-deck__active">
          <span className="dash-mobile-deck__active-icon" aria-hidden>{tabEmoji(activeTab.id)}</span>
          <div className="min-w-0">
            <p className="dash-mobile-deck__active-title">{activeTab.label}</p>
            {activeTab.desc && <p className="dash-mobile-deck__active-desc">{activeTab.desc}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
