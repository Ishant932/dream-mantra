import { Link } from 'react-router-dom';
import GuidanceLink from './GuidanceLink';
import { isGuidancePath } from '../utils/guidancePath';

/** Router link that opens the guidance modal for guidance URLs. */
export default function RouteOrGuidanceLink({ to, className = '', children, ...props }) {
  if (isGuidancePath(to)) {
    return (
      <GuidanceLink to={to} className={className} {...props}>
        {children}
      </GuidanceLink>
    );
  }
  return (
    <Link to={to} className={className} {...props}>
      {children}
    </Link>
  );
}
