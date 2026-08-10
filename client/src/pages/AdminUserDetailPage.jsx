import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../api';
import AdminUserProfileModal from '../components/AdminUserProfileModal';
import { DashboardShell, DashboardLoading } from '../components/DashboardUI';

export default function AdminUserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !userId) return;
    setLoading(true);
    adminApi.getUser(token, userId)
      .then((data) => {
        setUser(data.user);
        setStats(data.stats || null);
      })
      .catch((e) => setError(e.message || 'Failed to load user'))
      .finally(() => setLoading(false));
  }, [token, userId]);

  const saveUser = async (id, form) => {
    setSaving(true);
    try {
      const res = await adminApi.updateUser(token, id, form);
      setUser(res.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLoading variant="admin" />;

  return (
    <DashboardShell variant="admin" className="pt-16 pb-10">
      <div className="max-w-4xl mx-auto px-4 space-y-4">
        <Link to="/admin?tab=users" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700">
          <ArrowLeft className="w-4 h-4" /> Back to users
        </Link>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <AdminUserProfileModal
          open
          variant="page"
          user={user}
          stats={stats}
          loading={false}
          saving={saving}
          onSave={saveUser}
          onClose={() => navigate('/admin?tab=users')}
          api={adminApi}
          token={token}
          onError={setError}
        />
      </div>
    </DashboardShell>
  );
}
