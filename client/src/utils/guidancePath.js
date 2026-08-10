/** True when a route should open the free guidance modal instead of navigating. */
export function isGuidancePath(path = '') {
  const s = String(path || '').toLowerCase();
  return s.includes('guidance') || s.includes('contact#guidance') || s === '/contact#guidance';
}
