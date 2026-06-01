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

  const headerVar = getComputedStyle(document.documentElement).getPropertyValue('--site-header-h');
  const headerOffset = (parseInt(headerVar, 10) || 64) + 12;
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top: Math.max(0, top), behavior });
  return true;
}

export function handleHashNavClick(e, to, pathname, onAfter) {
  const target = parseNavTarget(to);
  if (typeof target !== 'object' || !target.hash) return false;

  const hashId = target.hash.replace('#', '');
  const destPath = target.pathname || '/';
  const onSamePage = pathname === destPath;

  if (onSamePage) {
    e.preventDefault();
    scrollToSectionId(hashId);
    window.history.pushState(null, '', `${destPath}#${hashId}`);
    onAfter?.();
    return true;
  }

  return false;
}
