import { Navigate, useParams } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const KNOWN_SLUGS = new Set([
  'class-1-5',
  'class-6-8',
  'class-9-10',
  'class-11-12',
  'college-students',
  'working-professionals',
]);

export default function ProgramPage() {
  const { slug } = useParams();
  const { d } = useLang();
  const programPage = d('pages.program');

  if (slug && KNOWN_SLUGS.has(slug)) {
    return <Navigate to={`/counselling?tab=programs&age=${slug}`} replace />;
  }

  return (
    <div className="pt-32 text-center py-20">
      <h1 className="text-2xl font-bold">{programPage.notFound}</h1>
      <Link to="/counselling?tab=programs" className="text-brand-600 mt-4 inline-block">
        {programPage.allPathways || programPage.goHome}
      </Link>
    </div>
  );
}
