import { Link, useLocation } from 'react-router-dom';
import { Home, HeartHandshake, Briefcase, LayoutGrid, Phone } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { isPhoneViewport } from '../utils/mobilePerf';
import { isMobileBottomNavVisible, isDashboardBottomNav } from '../utils/mobileBottomNav';

const ITEMS = [
  {
    id: 'home',
    icon: Home,
    labelKey: 'mobileNav.home',
    getTo: () => '/',
    isActive: (path) => path === '/',
  },
  {
    id: 'counsel',
    icon: HeartHandshake,
    labelKey: 'mobileNav.counselling',
    getTo: (onDashboard) => (onDashboard ? '/dashboard?tab=book' : '/counselling'),
    isActive: (path, tab) => {
      if (isDashboardBottomNav(path)) return tab === 'book';
      return path.startsWith('/counselling');
    },
  },
  {
    id: 'crp',
    icon: Briefcase,
    labelKey: 'mobileNav.tests',
    getTo: () => '/crp?tab=launchpad',
    isActive: (path) => path.startsWith('/crp'),
  },
  {
    id: 'dashboard',
    icon: LayoutGrid,
    labelKey: 'mobileNav.dashboard',
    getTo: () => '/dashboard?tab=overview',
    isActive: (path) => isDashboardBottomNav(path),
  },
  {
    id: 'contact',
    icon: Phone,
    labelKey: 'mobileNav.contact',
    getTo: () => '/contact',
    isActive: (path) => path.startsWith('/contact'),
  },
];

export default function MobileBottomNav() {
  const { t } = useLang();
  const location = useLocation();
  const path = location.pathname;
  const tab = new URLSearchParams(location.search).get('tab');
  const onDashboard = isDashboardBottomNav(path);

  if (!isPhoneViewport() || !isMobileBottomNavVisible(path)) return null;

  return (
    <nav className="mobile-bottom-nav mobile-bottom-nav--animated" aria-label="Quick navigation">
      {ITEMS.map((item, i) => {
        const Icon = item.icon;
        const active = item.isActive(path, tab);
        const cls = `mobile-bottom-nav__item${active ? ' mobile-bottom-nav__item--active' : ''}`;
        const label = t(item.labelKey);
        const style = { '--nav-i': i };

        if (item.external) {
          return (
            <a key={item.id} href={item.href} className={cls} style={style}>
              <Icon className="w-5 h-5 shrink-0 mobile-bottom-nav__icon" aria-hidden />
              <span>{label}</span>
            </a>
          );
        }

        const to = item.getTo(onDashboard);
        return (
          <Link key={item.id} to={to} className={cls} style={style}>
            <Icon className="w-5 h-5 shrink-0 mobile-bottom-nav__icon" aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
