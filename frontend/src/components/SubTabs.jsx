import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { scrollPageToTop, scrollToRefTop } from '../utils/scrollToTop';

/** Simple tab bar — scrolls to top when the active tab changes */
export default function SubTabs({ tabs, defaultTab, children, id = 'tabs' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const params = new URLSearchParams(location.search);
  const active = params.get('tab') || defaultTab || tabs[0]?.id;

  const setTab = (tabId) => {
    navigate({ pathname: location.pathname, search: `?tab=${tabId}` }, { replace: true });
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      scrollPageToTop('instant');
      scrollToRefTop(rootRef, { offset: 8, behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return (
    <div className="no-reveal subtab-root" ref={rootRef}>
      <div className="subtab-track" role="tablist" aria-label="Section tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setTab(tab.id)}
            className={`subtab-btn ${active === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="subtab-panel" role="tabpanel">
        {typeof children === 'function' ? children(active) : children}
      </div>
    </div>
  );
}
