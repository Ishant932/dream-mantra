import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollPageToTop } from '../utils/scrollToTop';

/**
 * Scroll to top only when the path changes (real page navigation).
 * Same-page tab / filter / audience query updates keep the current scroll
 * so the tapped control stays under the cursor.
 * Skips when the URL has a #hash — HashScrollHandler scrolls to that section.
 */
export default function ScrollToTopOnNavigate() {
  const { pathname, hash } = useLocation();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    const pathChanged = pathname !== prevPathname.current;
    prevPathname.current = pathname;
    if (!pathChanged || hash) return;

    scrollPageToTop('instant');
    const t = window.setTimeout(() => scrollPageToTop('instant'), 50);
    return () => window.clearTimeout(t);
  }, [pathname, hash]);

  return null;
}
