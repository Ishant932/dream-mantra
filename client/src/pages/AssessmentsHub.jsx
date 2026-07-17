import { Navigate, useSearchParams } from 'react-router-dom';
import { assessmentPath } from '../utils/routes';

/** Assessments entry — open inside Counselling hub tabs */
export default function AssessmentsHub() {
  const [params] = useSearchParams();
  const tab = params.get('tab') || 'dmit';
  return <Navigate to={assessmentPath(tab)} replace />;
}
