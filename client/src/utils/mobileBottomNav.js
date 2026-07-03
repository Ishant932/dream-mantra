/** Paths where the fixed mobile bottom bar is hidden. */
export function isMobileBottomNavVisible(pathname) {
  if (pathname.startsWith('/admin') || pathname.startsWith('/counsellor')) return false;
  if (pathname === '/login' || pathname === '/signup') return false;
  return true;
}

export function isDashboardBottomNav(pathname) {
  return pathname.startsWith('/dashboard');
}
