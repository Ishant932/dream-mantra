import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { isPhoneViewport } from '../utils/mobilePerf';

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function MobileHomeQuickNav() {
  const { t } = useLang();
  if (!isPhoneViewport()) return null;

  const chips = [
    { type: 'scroll', id: 'home-modules', label: t('mobileNav.modules') },
    { type: 'scroll', id: 'pillars', label: t('mobileNav.pillars') },
    { type: 'link', to: '/counselling?tab=book', label: t('mobileNav.book') },
    { type: 'link', to: '/careers', label: t('mobileNav.careers') },
    { type: 'scroll', id: 'home-faq', label: t('mobileNav.faq') },
  ];

  return (
    <div className="mobile-home-quick" aria-label="Jump to section">
      <p className="mobile-home-quick__label">{t('mobileNav.jumpLabel')}</p>
      <div className="mobile-home-quick__track">
        {chips.map((chip) => {
          if (chip.type === 'link') {
            return (
              <Link key={chip.to} to={chip.to} className="mobile-home-quick__chip">
                {chip.label}
              </Link>
            );
          }
          return (
            <button
              key={chip.id}
              type="button"
              className="mobile-home-quick__chip"
              onClick={() => scrollToId(chip.id)}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
