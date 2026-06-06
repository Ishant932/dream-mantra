import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { counsellorApi } from '../api';
import DashboardSidebarLayout from '../components/DashboardSidebarLayout';
import StaffBookingsPanel from '../components/staff/StaffBookingsPanel';
import StaffUsersPanel from '../components/staff/StaffUsersPanel';
import StaffReportsPanel from '../components/staff/StaffReportsPanel';
import AdminUserProfileModal from '../components/AdminUserProfileModal';
import {
  DashboardShell,
  DashboardLoading,
  DashAlert,
} from '../components/DashboardUI';

const COUNSELLOR_TABS = [
  { id: 'users', label: 'User Management', desc: 'Registered students & profiles' },
  { id: 'bookings', label: 'Booking Management', desc: 'Slots, calendar & sessions' },
  { id: 'reports', label: 'Report Management', desc: 'Deliver reports to users' },
];

export default function CounsellorDashboard() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [profileUser, setProfileUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    counsellorApi.stats(token)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const viewProfile = async (userId) => {
    setProfileOpen(true);
    setProfileLoading(true);
    setProfileUser(null);
    try {
      const data = await counsellorApi.getUser(token, userId);
      setProfileUser(data.user);
    } catch (err) {
      setError(err.message);
      setProfileOpen(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const saveUserProfile = async (userId, form) => {
    setProfileSaving(true);
    try {
      const res = await counsellorApi.updateUser(token, userId, form);
      setProfileUser(res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  if (loading) return <DashboardLoading variant="admin" />;

  return (
    <DashboardShell variant="admin" className="pt-24 pb-16">
      <AdminUserProfileModal
        open={profileOpen}
        user={profileUser}
        loading={profileLoading}
        saving={profileSaving}
        onSave={saveUserProfile}
        onClose={() => { setProfileOpen(false); setProfileUser(null); }}
      />

      <div className="max-w-7xl mx-auto px-4">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dash-admin-header">
          <Shield className="w-9 h-9 text-gold-400" />
          Counsellor Dashboard
          <span className="text-base font-normal opacity-70 ml-2">— {user?.name}</span>
        </motion.h1>

        {error && (
          <DashAlert type="error" className="mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </DashAlert>
        )}
        {notice && (
          <DashAlert type="success" className="mb-4">
            {notice}
          </DashAlert>
        )}

        <DashboardSidebarLayout
          tabs={COUNSELLOR_TABS}
          defaultTab="users"
          id="counsellor-dashboard"
          user={user}
          showProfileCompletion={false}
          sectionTitle="Counsellor Panel"
        >
          {(tab) => (
            <>
              {tab === 'users' && (
                <StaffUsersPanel api={counsellorApi} token={token} onError={setError} />
              )}

              {tab === 'bookings' && (
                <StaffBookingsPanel
                  api={counsellorApi}
                  token={token}
                  onViewProfile={viewProfile}
                  onError={setError}
                  onNotice={setNotice}
                />
              )}

              {tab === 'reports' && (
                <StaffReportsPanel
                  api={counsellorApi}
                  token={token}
                  onError={setError}
                  onNotice={setNotice}
                />
              )}
            </>
          )}
        </DashboardSidebarLayout>
      </div>
    </DashboardShell>
  );
}
