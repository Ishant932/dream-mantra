function headerOffset(extra = 8) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--site-header-h');
  const parsed = parseFloat(raw);
  return (Number.isFinite(parsed) ? parsed : 92) + extra;
}

/** Scroll the window to the very top (new page navigation). */
export function scrollPageToTop(behavior = 'instant') {
  window.scrollTo({ top: 0, left: 0, behavior });
}

/** Scroll so an element's top aligns below the site header. */
export function scrollToElement(el, { offset = 8, behavior = 'instant' } = {}) {
  if (!el) {
    scrollPageToTop(behavior);
    return;
  }
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset(offset);
  window.scrollTo({ top: Math.max(0, top), left: 0, behavior });
}

export function scrollToRefTop(ref, options = {}) {
  scrollToElement(ref?.current, options);
}
