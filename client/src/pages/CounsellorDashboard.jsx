import { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { counsellorApi, userApi } from '../api';
import DashboardSidebarLayout from '../components/DashboardSidebarLayout';
import StaffBookingsPanel from '../components/staff/StaffBookingsPanel';
import StaffUsersPanel from '../components/staff/StaffUsersPanel';
import StaffReportsPanel from '../components/staff/StaffReportsPanel';
import AdminUserProfileModal from '../components/AdminUserProfileModal';
import DashboardB2BBanner from '../components/DashboardB2BBanner';
import NotificationBell from '../components/NotificationBell';
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
  const [notifUnread, setNotifUnread] = useState(0);

  const refreshNotifs = useCallback(async () => {
    if (!token) return;
    try {
      const data = await userApi.notifications(token);
      setNotifUnread(data.unread ?? 0);
    } catch {
      /* silent */
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    counsellorApi.stats(token)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    refreshNotifs();
  }, [token, refreshNotifs]);

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
    <DashboardShell variant="admin" className="pt-16 pb-10">
      <AdminUserProfileModal
        open={profileOpen}
        user={profileUser}
        loading={profileLoading}
        saving={profileSaving}
        onSave={saveUserProfile}
        onClose={() => { setProfileOpen(false); setProfileUser(null); }}
      />

      <div className="dash-b2b-page w-full max-w-none mx-0 px-0">
        <DashboardB2BBanner
          tag="Counsellor Panel"
          title="Counsellor Dashboard"
          subtitle={`Bookings · users · reports — ${user?.name || 'Counsellor'}`}
          variant="admin"
          action={(
            <NotificationBell
              token={token}
              initialUnread={notifUnread}
              onRefresh={refreshNotifs}
              onDark
            />
          )}
        />

        {error && (
          <DashAlert type="error">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </DashAlert>
        )}
        {notice && (
          <DashAlert type="success">
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
          deckVariant="admin"
          notifToken={token}
          notifUnread={notifUnread}
          onNotifRefresh={refreshNotifs}
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
