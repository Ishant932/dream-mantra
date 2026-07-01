import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollPageToTop } from '../utils/scrollToTop';

/**
 * Scroll to top on route or query-tab changes (standard SPA behaviour).
 * Skips when the URL has a #hash — HashScrollHandler scrolls to that section.
 */
export default function ScrollToTopOnNavigate() {
  const { pathname, search, hash } = useLocation();
  const routeKey = `${pathname}${search}`;
  const prevKey = useRef(routeKey);

  useEffect(() => {
    const changed = routeKey !== prevKey.current;
    prevKey.current = routeKey;
    if (!changed || hash) return;

    scrollPageToTop('instant');
    const t = window.setTimeout(() => scrollPageToTop('instant'), 50);
    return () => window.clearTimeout(t);
  }, [routeKey, hash]);

  return null;
}
