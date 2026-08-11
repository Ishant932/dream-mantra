import { useLocation, useOutlet } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

/** Route outlet — remount on language change so all copy refreshes */
export default function PageTransition() {
  const outlet = useOutlet();
  const { lang } = useLang();

  return <div className="page-enter" key={lang}>{outlet}</div>;
}
