import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/** Tab bar — horizontal by default, or vertical sidebar when orientation="vertical" */
export default function SubTabs({
  tabs,
  defaultTab,
  children,
  id = 'tabs',
  orientation = 'horizontal',
  paramName = 'tab',
  scrollOnChange = false,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const params = new URLSearchParams(location.search);
  const active = params.get(paramName) || defaultTab || tabs[0]?.id;
  const isVertical = orientation === 'vertical';

  const setTab = (tabId) => {
    const next = new URLSearchParams(location.search);
    next.set(paramName, tabId);
    navigate(
      { pathname: location.pathname, search: `?${next.toString()}` },
      { replace: true, preventScrollReset: true },
    );
  };

  return (
    <div
      className={`no-reveal subtab-root${isVertical ? ' subtab-root--vertical' : ''}`}
      ref={rootRef}
      id={id}
    >
      <div
        className={`subtab-track${isVertical ? ' subtab-track--vertical' : ''}`}
        role="tablist"
        aria-label="Section tabs"
        aria-orientation={isVertical ? 'vertical' : 'horizontal'}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setTab(tab.id)}
            className={`subtab-btn${isVertical ? ' subtab-btn--vertical' : ''} ${active === tab.id ? 'active' : ''}`}
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
