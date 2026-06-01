import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollPageToTop } from '../utils/scrollToTop';

/** Scroll to top when the route pathname changes (standard SPA behaviour). */
export default function ScrollToTopOnNavigate() {
  const { pathname } = useLocation();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      scrollPageToTop('instant');
      prevPath.current = pathname;
    }
  }, [pathname]);

  return null;
}
