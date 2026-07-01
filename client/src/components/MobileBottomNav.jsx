import { Link, useLocation } from 'react-router-dom';
import { Home, HeartHandshake, FlaskConical, Briefcase, Phone } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { isPhoneViewport } from '../utils/mobilePerf';

const ITEMS = [
  { to: '/', icon: Home, labelKey: 'mobileNav.home', match: (p) => p === '/' },
  { to: '/counselling', icon: HeartHandshake, labelKey: 'mobileNav.counselling', match: (p) => p.startsWith('/counselling') },
  { to: '/assessments', icon: FlaskConical, labelKey: 'mobileNav.tests', match: (p) => p.startsWith('/assessments') },
  { to: '/careers', icon: Briefcase, labelKey: 'mobileNav.careers', match: (p) => p.startsWith('/careers') },
  { href: 'tel:9680102276', icon: Phone, labelKey: 'mobileNav.call', external: true },
];

export default function MobileBottomNav() {
  const { t } = useLang();
  const location = useLocation();
  const path = location.pathname;

  if (!isPhoneViewport()) return null;
  if (
    path.startsWith('/dashboard')
    || path.startsWith('/admin')
    || path.startsWith('/counsellor')
    || path === '/login'
    || path === '/signup'
  ) {
    return null;
  }

  return (
    <nav className="mobile-bottom-nav mobile-bottom-nav--animated" aria-label="Quick navigation">
      {ITEMS.map((item, i) => {
        const Icon = item.icon;
        const active = !item.external && item.match(path);
        const cls = `mobile-bottom-nav__item${active ? ' mobile-bottom-nav__item--active' : ''}`;
        const label = t(item.labelKey);
        const style = { '--nav-i': i };

        if (item.external) {
          return (
            <a key={item.href} href={item.href} className={cls} style={style}>
              <Icon className="w-5 h-5 shrink-0 mobile-bottom-nav__icon" aria-hidden />
              <span>{label}</span>
            </a>
          );
        }

        return (
          <Link key={item.to} to={item.to} className={cls} style={style}>
            <Icon className="w-5 h-5 shrink-0 mobile-bottom-nav__icon" aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
