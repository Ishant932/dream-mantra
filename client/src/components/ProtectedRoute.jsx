import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function staffHome(role) {
  if (role === 'admin') return '/admin';
  if (role === 'counsellor') return '/counsellor';
  return '/dashboard';
}

export function ProtectedRoute({ children, adminOnly = false, counsellorOnly = false, userOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to={staffHome(user.role)} replace />;
  }

  if (counsellorOnly && user.role !== 'counsellor') {
    return <Navigate to={staffHome(user.role)} replace />;
  }

  if (userOnly && user.role !== 'user') {
    return <Navigate to={staffHome(user.role)} replace />;
  }

  return children;
}
