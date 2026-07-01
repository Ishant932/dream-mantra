/** True when mobile/tablet perf mode is active (coarse pointer, narrow viewport, or reduced motion). */
export function isMobilePerf() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('is-mobile-perf');
}

/** True on phones — bottom nav, compact home, quick jump bar. */
export function isPhoneViewport() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 767px)').matches
    || window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

export function isNarrowViewport() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 1024px)').matches;
}

/** Defer non-critical work until the browser is idle (mobile-friendly). */
export function runWhenIdle(fn, timeoutMs = 8000) {
  if (typeof window === 'undefined') {
    fn();
    return;
  }
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => fn(), { timeout: timeoutMs });
  } else {
    window.setTimeout(fn, Math.min(timeoutMs, 3000));
  }
}
