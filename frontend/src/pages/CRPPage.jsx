import { Navigate, useLocation } from 'react-router-dom';

/** Legacy /crp and hash links → explore or launch */
export default function CRPPage() {
  const { hash } = useLocation();
  const target = hash === '#programs' ? '/crp/launch' : '/crp/explore';
  const suffix = hash && hash !== '#programs' ? hash : '';
  return <Navigate to={`${target}${suffix}`} replace />;
}
