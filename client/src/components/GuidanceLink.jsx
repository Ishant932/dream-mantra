import { Link } from 'react-router-dom';
import { useGuidanceModal } from '../context/GuidanceModalContext';

/**
 * Router link that opens the free guidance modal instead of navigating away.
 */
export default function GuidanceLink({ to = '/contact#guidance', className = '', children, onClick, ...props }) {
  const { openGuidance } = useGuidanceModal();

  return (
    <Link
      to={to}
      className={className}
      data-guidance-open
      onClick={(e) => {
        e.preventDefault();
        openGuidance();
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
