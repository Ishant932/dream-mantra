import { scrollToElement } from './scrollToTop';

/** Parse "/#section" or "/path#section" for React Router */
export function parseNavTarget(to) {
  if (typeof to !== 'string') return to;
  const hashIdx = to.indexOf('#');
  if (hashIdx === -1) return to;
  const pathname = to.slice(0, hashIdx) || '/';
  const hash = to.slice(hashIdx + 1);
  return { pathname, hash: hash ? `#${hash}` : '' };
}

export function scrollToSectionId(id, behavior = 'smooth') {
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  scrollToElement(el, { offset: 12, behavior });
  return true;
}

/** Retry scroll for lazy-mounted home sections (e.g. #certifications). */
export function scrollToSectionIdWithRetry(id, { attempts = 12, delayMs = 150, behavior = 'smooth' } = {}) {
  if (!id) return () => {};
  let n = 0;
  let timer;
  const tick = () => {
    if (scrollToSectionId(id, behavior)) return;
    n += 1;
    if (n < attempts) timer = window.setTimeout(tick, delayMs);
  };
  tick();
  return () => { if (timer) window.clearTimeout(timer); };
}

export function handleHashNavClick(e, to, pathname, onAfter) {
  const target = parseNavTarget(to);
  if (typeof target !== 'object' || !target.hash) return false;

  const hashId = target.hash.replace('#', '');
  const destPath = target.pathname || '/';
  const onSamePage = pathname === destPath;

  if (onSamePage) {
    e.preventDefault();
    scrollToSectionIdWithRetry(hashId);
    window.history.pushState(null, '', `${destPath}#${hashId}`);
    onAfter?.();
    return true;
  }

  return false;
}
