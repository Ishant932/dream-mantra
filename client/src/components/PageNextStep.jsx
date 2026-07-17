import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

/**
 * Shared conversion strip: Book a free guidance call.
 */
export default function PageNextStep({
  className = '',
  primaryTo = '/contact#guidance',
}) {
  const { d } = useLang();
  const fg = d('freeGuidance') || {};

  return (
    <div className={`page-next-step max-w-3xl ${className}`.trim()}>
      <div className="flex flex-wrap gap-5 sm:gap-6 items-center">
        <Link to={primaryTo} className="btn-gold inline-flex items-center page-next-step__primary">
          {fg.cta || 'Book a free guidance call'}
        </Link>
      </div>
    </div>
  );
}
