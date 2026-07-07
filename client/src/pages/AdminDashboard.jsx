import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Users, Calendar, FlaskConical, Clock, AlertCircle,
  CreditCard, Settings, Save,
} from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { adminApi, userApi } from '../api';
import AdminUserProfileModal from '../components/AdminUserProfileModal';
import AdminAnalyticsPanel from '../components/AdminAnalyticsPanel';
import AdminPaymentsPanel from '../components/AdminPaymentsPanel';
import AdminLeadsPanel from '../components/AdminLeadsPanel';
import AdminModulesPanel from '../components/AdminModulesPanel';
import AdminVouchersPanel from '../components/AdminVouchersPanel';
import AdminCounsellorsPanel from '../components/AdminCounsellorsPanel';
import CopyableUserId from '../components/CopyableUserId';
import StaffBookingsPanel from '../components/staff/StaffBookingsPanel';
import StaffUsersPanel from '../components/staff/StaffUsersPanel';
import StaffReportsPanel from '../components/staff/StaffReportsPanel';
import DashboardSidebarLayout from '../components/DashboardSidebarLayout';
import {
  DashboardShell,
  DashboardLoading,
  AdminStatCard,
  DashAlert,
  DashCard,
} from '../components/DashboardUI';
import DashboardB2BBanner from '../components/DashboardB2BBanner';
import NotificationBell from '../components/NotificationBell';
import AdminMessagesPanel from '../components/MessagesPanel';
import AdminBlogPanel from '../components/AdminBlogPanel';
import { getAdminDashboardNextStep, ADMIN_NEXT_STEP_ACTIONS } from '../utils/dashboardNextStep';

const ADMIN_TABS = [
  { id: 'overview', label: 'Overview', desc: 'Stats & quick summary' },
  { id: 'analytics', label: 'Analytics', desc: 'Platform performance insights' },
  { id: 'bookings', label: 'Booking Management', desc: 'Slots, calendar & sessions' },
  { id: 'counsellors', label: 'Counsellor Staff', desc: 'Counsellor logins & passwords' },
  { id: 'users', label: 'User Management', desc: 'Registered students & profiles' },
  { id: 'payments', label: 'Payment Management', desc: 'Paid assessments & orders' },
  { id: 'modules', label: 'Module Catalog', desc: 'Add & edit checkout modules' },
  { id: 'vouchers', label: 'Vouchers', desc: 'Discount codes by module' },
  { id: 'messages', label: 'Messages', desc: 'Direct messages to students' },
  { id: 'reports', label: 'Report Management', desc: 'Deliver reports to users' },
  { id: 'leads', label: 'Contact Leads', desc: 'Website enquiries & messages' },
  { id: 'blogs', label: 'Blogs', desc: 'Create & publish website articles' },
  { id: 'settings', label: 'Community & Links', desc: 'AI Launchpad community URL' },
];

export default function AdminDashboard() {
  const { t } = useLang();
  const { token, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const tabParam = new URLSearchParams(location.search).get('tab') || 'overview';

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [profileUser, setProfileUser] = useState(null);
  const [profileStats, setProfileStats] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [communityLink, setCommunityLink] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [loadErrors, setLoadErrors] = useState([]);
  const [catalogModules, setCatalogModules] = useState([]);
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

  const handleCatalogChange = useCallback((list) => {
    setCatalogModules(Array.isArray(list) ? list : []);
  }, []);

  const loadAnalytics = useCallback(async () => {
    if (!token) return;
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const res = await adminApi.analytics(token);
      setAnalytics(res.analytics || null);
    } catch (err) {
      setAnalytics(null);
      setAnalyticsError(err.message || 'Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  }, [token]);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    setLoadErrors([]);

    const tasks = [
      { key: 'stats', fn: () => adminApi.stats(token), set: (v) => setStats(v) },
      { key: 'consultations', fn: () => adminApi.consultations(token), set: (v) => setConsultations(v.consultations || []) },
      { key: 'payments', fn: () => adminApi.payments(token, { limit: 100 }), set: (v) => setPayments(v.payments || []) },
      { key: 'settings', fn: () => adminApi.settings(token), set: (v) => setCommunityLink(v.settings?.community_links?.['crp-test'] || '') },
      { key: 'analytics', fn: () => adminApi.analytics(token), set: (v) => setAnalytics(v.analytics || null) },
      { key: 'modules', fn: () => adminApi.modules(token), set: (v) => setCatalogModules(v.modules || []) },
      { key: 'users', fn: () => adminApi.users(token), set: (v) => setUsers(v.users || []) },
    ];

    const results = await Promise.allSettled(
      tasks.map(async (task) => {
        const data = await task.fn();
        return { key: task.key, data };
      })
    );

    const errors = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const task = tasks[i];
      if (result.status === 'fulfilled') {
        task.set(result.value.data);
      } else {
        const msg = result.reason?.message || 'Failed to load';
        if (task.key === 'analytics') {
          setAnalytics(null);
          setAnalyticsError(msg);
        }
        errors.push(`${task.key}: ${msg}`);
      }
    }

    setLoading(false);
    if (errors.length) {
      setLoadErrors(errors);
      const authBlocked = errors.every((e) => e.includes('two-factor') || e.includes('Authentication'));
      if (!authBlocked) {
        setError(`Some sections failed to load — ${errors.join(' · ')}`);
      }
    }
  };

  useEffect(() => { load(); }, [token]);
  useEffect(() => { refreshNotifs(); }, [token, refreshNotifs]);

  const saveUserProfile = async (userId, form) => {
    setProfileSaving(true);
    try {
      const res = await adminApi.updateUser(token, userId, form);
      setProfileUser(res.user);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...res.user, stats: u.stats } : u)));
    } catch (err) {
      setError(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const viewProfile = async (userId) => {
    setProfileOpen(true);
    setProfileLoading(true);
    setProfileUser(null);
    setProfileStats(null);
    try {
      const data = await adminApi.getUser(token, userId);
      setProfileUser(data.user);
      setProfileStats(data.stats || null);
    } catch (err) {
      setError(err.message);
      setProfileOpen(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const saveCommunityLink = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      await adminApi.updateSettings(token, {
        community_links: { 'crp-test': communityLink.trim() },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSettingsSaving(false);
    }
  };

  const statCards = stats ? [
    { label: t('admin.users'), value: stats.users, icon: Users },
    { label: t('admin.consultations'), value: stats.consultations, icon: Calendar },
    { label: t('admin.assessments'), value: stats.assessments, icon: FlaskConical },
    { label: t('admin.pending'), value: stats.pending, icon: Clock },
    { label: 'Open Slots', value: stats.openSlots ?? 0, icon: Calendar },
    { label: 'Paid Orders', value: stats.paidCount ?? 0, icon: CreditCard },
  ] : [];

  const goTab = useCallback((tabId) => {
    navigate({ pathname: location.pathname, search: `?tab=${tabId}` }, { replace: true });
  }, [navigate, location.pathname]);

  const nextStep = useMemo(() => {
    const step = getAdminDashboardNextStep({ stats, notifUnread });
    const handlers = {
      [ADMIN_NEXT_STEP_ACTIONS.BOOKINGS]: () => goTab('bookings'),
      [ADMIN_NEXT_STEP_ACTIONS.REPORTS]: () => goTab('reports'),
      [ADMIN_NEXT_STEP_ACTIONS.PAYMENTS]: () => goTab('payments'),
      [ADMIN_NEXT_STEP_ACTIONS.MESSAGES]: () => goTab('messages'),
      [ADMIN_NEXT_STEP_ACTIONS.ANALYTICS]: () => goTab('analytics'),
    };
    return {
      ...step,
      onClick: handlers[step.action] || (() => goTab('analytics')),
    };
  }, [stats, notifUnread, goTab]);

  if (loading) return <DashboardLoading variant="admin" />;

  return (
    <DashboardShell variant="admin" className="pt-16 pb-10">
      <AdminUserProfileModal
        open={profileOpen}
        user={profileUser}
        stats={profileStats}
        loading={profileLoading}
        saving={profileSaving}
        onSave={saveUserProfile}
        onClose={() => { setProfileOpen(false); setProfileUser(null); setProfileStats(null); }}
        api={adminApi}
        token={token}
        onError={setError}
      />

      <div className="dash-b2b-page w-full max-w-none mx-0 px-0">
        {notice && (
          <DashAlert type="success">
            <p className="text-sm">{notice}</p>
          </DashAlert>
        )}

        {error && (
          <DashAlert type="error" onRetry={load}>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </DashAlert>
        )}

        <DashboardB2BBanner
          tag="Admin Command Center"
          title="Admin Dashboard"
          subtitle="Users · bookings · payments · vouchers · reports"
          variant="admin"
          nextStep={nextStep}
          action={(
            <NotificationBell
              token={token}
              initialUnread={notifUnread}
              onRefresh={refreshNotifs}
              onDark
            />
          )}
        />

        <DashboardSidebarLayout tabs={ADMIN_TABS} defaultTab="overview" id="admin-dashboard" user={user} showProfileCompletion={false} sectionTitle="Dream Mantra Admin" deckVariant="admin" notifToken={token} notifUnread={notifUnread} onNotifRefresh={refreshNotifs} nextStep={nextStep}>
          {(tab) => (
            <>
              {tab === 'overview' && (
                <div className="dash-b2b-stack">
                  <div className="dash-b2b-stat-grid dash-b2b-stat-grid--6">
                    {statCards.map((s, i) => (
                      <AdminStatCard
                        key={s.label}
                        stat={s}
                        index={i}
                        hint={i === 3 && stats?.pending ? `${stats.pending} awaiting` : undefined}
                      />
                    ))}
                  </div>
                  <div className="dash-b2b-widget-grid">
                    <DashCard className="dash-b2b-widget dash-b2b-widget--wide" hover={false}>
                      <div className="dash-b2b-widget__head">
                        <h3 className="dash-b2b-widget__title">
                          <Users className="w-4 h-4 text-blue-600" />
                          Registered Users
                        </h3>
                        <span className="dash-b2b-widget__meta">{stats?.users ?? users.length} total</span>
                      </div>
                      <div className="dash-b2b-list">
                        {users.slice(0, 8).map((u) => (
                          <div key={u.id} className="dash-b2b-list__row">
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{u.name}</p>
                              {u.user_uid && <CopyableUserId uid={u.user_uid} compact animate={false} />}
                            </div>
                            <button type="button" onClick={() => viewProfile(u.id)} className="dash-b2b-link-btn">View</button>
                          </div>
                        ))}
                        {!users.length && <p className="text-sm text-[var(--text-secondary)]">No registered users yet.</p>}
                      </div>
                    </DashCard>
                    <DashCard className="dash-b2b-widget" hover={false}>
                      <div className="dash-b2b-widget__head">
                        <h3 className="dash-b2b-widget__title">
                          <CreditCard className="w-4 h-4 text-emerald-600" />
                          Recent Payments
                        </h3>
                      </div>
                      <div className="dash-b2b-list">
                        {payments.filter((p) => p.payment_status === 'confirmed').slice(0, 6).map((p) => (
                          <div key={p.id} className="dash-b2b-list__row dash-b2b-list__row--stack">
                            <p className="font-semibold text-sm">{p.user_name}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{p.product_title || p.type}</p>
                            <p className="text-xs font-bold text-emerald-700">₹{p.amount?.toLocaleString('en-IN')}</p>
                          </div>
                        ))}
                        {!payments.length && <p className="text-sm text-[var(--text-secondary)]">No paid orders yet</p>}
                      </div>
                    </DashCard>
                    <DashCard className="dash-b2b-widget dash-b2b-widget--wide" hover={false}>
                      <div className="dash-b2b-widget__head">
                        <h3 className="dash-b2b-widget__title">
                          <Clock className="w-4 h-4 text-violet-600" />
                          Recent Bookings
                        </h3>
                      </div>
                      <div className="dash-b2b-list">
                        {consultations.slice(0, 6).map((c) => (
                          <div key={c.id} className="dash-b2b-list__row dash-b2b-list__row--stack">
                            <p className="font-semibold text-sm">{c.user_name} — {c.program}</p>
                            <p className="text-xs text-[var(--text-secondary)]">
                              {c.scheduled_at && new Date(c.scheduled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}
                            </p>
                          </div>
                        ))}
                        {!consultations.length && <p className="text-sm text-[var(--text-secondary)]">No bookings yet</p>}
                      </div>
                    </DashCard>
                  </div>
                </div>
              )}

              {tab === 'analytics' && (
                <AdminAnalyticsPanel
                  analytics={analytics}
                  loading={analyticsLoading && !analytics}
                  error={analyticsError}
                  onRetry={loadAnalytics}
                />
              )}

              {tab === 'bookings' && (
                <StaffBookingsPanel
                  api={adminApi}
                  token={token}
                  onViewProfile={viewProfile}
                  onError={setError}
                  onNotice={setNotice}
                />
              )}

              {tab === 'users' && (
                <StaffUsersPanel api={adminApi} token={token} allowCounsellorAssign allowAccountActions onError={setError} />
              )}

              {tab === 'counsellors' && (
                <AdminCounsellorsPanel token={token} onNotice={setNotice} onError={setError} />
              )}

              {tab === 'payments' && (
                <AdminPaymentsPanel token={token} users={users} onNotice={setNotice} onError={setError} onViewUser={viewProfile} />
              )}

              {tab === 'modules' && (
                <AdminModulesPanel
                  token={token}
                  onNotice={setNotice}
                  onError={setError}
                  onCatalogChange={handleCatalogChange}
                />
              )}

              {tab === 'vouchers' && (
                <AdminVouchersPanel token={token} modules={catalogModules} users={users} onNotice={setNotice} onError={setError} />
              )}

              {tab === 'messages' && (
                <AdminMessagesPanel token={token} users={users} onError={setError} />
              )}

              {tab === 'reports' && (
                <StaffReportsPanel api={adminApi} token={token} onNotice={setNotice} />
              )}

              {tab === 'leads' && (
                <AdminLeadsPanel token={token} onNotice={setNotice} onError={setError} />
              )}

              {tab === 'blogs' && (
                <AdminBlogPanel token={token} onNotice={setNotice} onError={setError} />
              )}

              {tab === 'settings' && (
                <DashCard className="!p-5 sm:!p-6 max-w-2xl">
                  <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-500" /> AI Career Launchpad Community
                  </h2>
                  <p className="text-sm opacity-70 mb-6">
                    Paste the WhatsApp group, Discord, or community link for AI Career Launchpad students. They will see this after payment in Step 5 of their career path.
                  </p>
                  <form onSubmit={saveCommunityLink} className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold block mb-2">Community link (crp-test)</label>
                      <input
                        type="url"
                        className="input-field w-full"
                        placeholder="https://chat.whatsapp.com/... or https://discord.gg/..."
                        value={communityLink}
                        onChange={(e) => setCommunityLink(e.target.value)}
                      />
                    </div>
                    <button type="submit" disabled={settingsSaving} className="btn-primary inline-flex items-center gap-2">
                      <Save className="w-4 h-4" /> {settingsSaving ? 'Saving…' : 'Save community link'}
                    </button>
                  </form>
                </DashCard>
              )}
            </>
          )}
        </DashboardSidebarLayout>
      </div>
    </DashboardShell>
  );
}
