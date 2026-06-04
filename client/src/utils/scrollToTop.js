/** Site header height in px (supports --site-header-h as rem/px). */
export function headerOffset(extra = 8) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--site-header-h').trim();
  if (!raw) return 92 + extra;

  if (raw.endsWith('px')) {
    const px = parseFloat(raw);
    return (Number.isFinite(px) ? px : 92) + extra;
  }

  const num = parseFloat(raw);
  if (!Number.isFinite(num)) return 92 + extra;

  const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  if (raw.endsWith('rem') || raw.endsWith('em') || num < 24) {
    return num * rootFont + extra;
  }

  return num + extra;
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

/** Scroll element into view below sticky header (uses scroll-margin-top on el). */
export function scrollIntoViewBelowHeader(el, { behavior = 'instant' } = {}) {
  if (!el) return;
  el.scrollIntoView({ block: 'start', inline: 'nearest', behavior });
  scrollToElement(el, { offset: 8, behavior });
}

export function scrollToRefTopAfterPaint(ref, options = {}) {
  const run = () => scrollIntoViewBelowHeader(ref?.current, options);
  requestAnimationFrame(() => requestAnimationFrame(run));
  const timers = [50, 150, 400].map((ms) => window.setTimeout(run, ms));
  return () => timers.forEach((id) => window.clearTimeout(id));
}
