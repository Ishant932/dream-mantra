import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToSectionIdWithRetry } from '../utils/scrollHash';

/** Scroll to #section after route navigation (e.g. /#certifications from mobile nav). */
export default function HashScrollHandler() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return undefined;
    const id = hash.replace('#', '');
    return scrollToSectionIdWithRetry(id, { attempts: 16, delayMs: 180 });
  }, [pathname, hash]);

  return null;
}
