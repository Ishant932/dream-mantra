import { Navigate, useLocation } from 'react-router-dom';
import { crpPath } from '../utils/pathRoutes';

const AUDIENCES = new Set(['college-students', 'freshers', 'working-professionals']);

/** Legacy /crp/launch?tab=audience → hub pathways */
export default function CRPLaunchRedirect() {
  const { search, hash } = useLocation();
  const params = new URLSearchParams(search);
  const raw = params.get('audience') || params.get('tab');
  const audience = AUDIENCES.has(raw) ? raw : 'college-students';
  return (
    <Navigate
      to={{ pathname: crpPath('pathways', { audience }), hash: hash || undefined }}
      replace
    />
  );
}
