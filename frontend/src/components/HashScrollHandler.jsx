import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToSectionId } from '../utils/scrollHash';

/** Scroll to #section after route navigation (e.g. /#certifications from another page). */
export default function HashScrollHandler() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return undefined;
    const id = hash.replace('#', '');
    const timer = window.setTimeout(() => scrollToSectionId(id), 120);
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}
