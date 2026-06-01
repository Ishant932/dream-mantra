import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-6xl font-display font-bold gradient-text mb-4">404</p>
      <h1 className="text-2xl font-bold text-sand-900 dark:text-amber-50 mb-2">Page not found</h1>
      <p className="text-sand-600 dark:text-sand-300 mb-8 max-w-md">
        This page doesn&apos;t exist or may have moved. Use the links below to get back on track.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <Home className="w-4 h-4" /> Home
        </Link>
        <Link to="/assessments" className="btn-outline inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Assessments
        </Link>
        <Link to="/login" className="btn-outline">Login</Link>
      </div>
    </div>
  );
}
