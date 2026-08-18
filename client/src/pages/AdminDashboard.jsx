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
import AdminAgewiseCombosPanel from '../components/admin/AdminAgewiseCombosPanel';
import AdminCommunitySchedulePanel from '../components/admin/AdminCommunitySchedulePanel';
import AdminResourceLinksPanel from '../components/admin/AdminResourceLinksPanel';
import NotificationBell from '../components/NotificationBell';
import AdminMessagesPanel from '../components/MessagesPanel';
import AdminBlogPanel from '../components/AdminBlogPanel';
import AdminStudioPanel from '../components/admin/AdminStudioPanel';
import AdminPageCatalogPanel from '../components/admin/AdminPageCatalogPanel';
import AdminWhatsAppPanel from '../components/admin/AdminWhatsAppPanel';
import AdminOverviewPanel from '../components/admin/AdminOverviewPanel';
import { useFlashNotice } from '../hooks/useFlashNotice';
import DashboardB2BBanner from '../components/DashboardB2BBanner';
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
  { id: 'messages', label: 'Support', desc: 'Messages and help for students' },
  { id: 'reports', label: 'Report Management', desc: 'Deliver reports to users' },
  { id: 'leads', label: 'Guidance Calls', desc: 'Free guidance call requests' },
  { id: 'blogs', label: 'Blogs', desc: 'Create & publish website articles' },
  { id: 'landing-pages', label: 'Landing Pages', desc: 'Internal campaign landing pages' },
  { id: 'site-pages', label: 'Website Copy', desc: 'Edit live page text across the site' },
  { id: 'whatsapp', label: 'WhatsApp Messages', desc: 'Twilio auto-replies, notifications & reminder timings' },
  { id: 'settings', label: 'Community & Links', desc: 'Community schedule, agewise combos & resources' },
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

  const { notice: flashNotice, flash: setNotice } = useFlashNotice(token, refreshNotifs);
  const [profileUser, setProfileUser] = useState(null);
  const [profileStats, setProfileStats] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('community');
  const [communitySchedule, setCommunitySchedule] = useState([]);
  const [bookingMgmtTab, setBookingMgmtTab] = useState('counselling');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [loadErrors, setLoadErrors] = useState([]);
  const [catalogModules, setCatalogModules] = useState([]);

  const handleCatalogChange = useCallback((list) => {
    setCatalogModules(Array.isArray(list) ? list : []);
  }, []);

  const [analyticsFilters, setAnalyticsFilters] = useState({ period: 'all' });

  const loadAnalytics = useCallback(async (filters = analyticsFilters) => {
    if (!token) return;
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const res = await adminApi.analytics(token, filters);
      setAnalytics(res.analytics || null);
    } catch (err) {
      setAnalytics(null);
      setAnalyticsError(err.message || 'Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  }, [token, analyticsFilters]);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    setLoadErrors([]);

    const tasks = [
      { key: 'stats', fn: () => adminApi.stats(token), set: (v) => setStats(v) },
      { key: 'consultations', fn: () => adminApi.consultations(token), set: (v) => setConsultations(v.consultations || []) },
      { key: 'payments', fn: () => adminApi.payments(token, { limit: 100 }), set: (v) => setPayments(v.payments || []) },
      { key: 'settings', fn: () => adminApi.settings(token), set: (v) => setCommunitySchedule(v.settings?.community_schedule || []) },
      { key: 'analytics', fn: () => adminApi.analytics(token, analyticsFilters), set: (v) => setAnalytics(v.analytics || null) },
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

  const reloadSettings = async () => {
    const v = await adminApi.settings(token);
    setCommunitySchedule(v.settings?.community_schedule || []);
  };

  const viewProfile = (userId, fromTab = 'users') => {
    navigate(`/admin/users/${userId}`, { state: { fromTab } });
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
    navigate(
      { pathname: location.pathname, search: `?tab=${tabId}` },
      { replace: true, preventScrollReset: true },
    );
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
        {flashNotice && (
          <DashAlert type="success">
            <p className="text-sm">{flashNotice}</p>
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

        <DashboardSidebarLayout tabs={ADMIN_TABS} defaultTab="overview" activeTabId={tabParam} id="admin-dashboard" user={user} showProfileCompletion={false} sectionTitle="Dream Mantra Admin" deckVariant="admin" notifToken={token} notifUnread={notifUnread} onNotifRefresh={refreshNotifs} nextStep={nextStep}>
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
                  <AdminOverviewPanel
                    users={users}
                    payments={payments}
                    consultations={consultations}
                    onViewProfile={viewProfile}
                    onOpenTab={goTab}
                  />
                </div>
              )}

              {tab === 'analytics' && (
                <AdminAnalyticsPanel
                  analytics={analytics}
                  loading={analyticsLoading && !analytics}
                  error={analyticsError}
                  onRetry={() => loadAnalytics()}
                  onFilterChange={(f) => { setAnalyticsFilters(f); loadAnalytics(f); }}
                />
              )}

              {tab === 'bookings' && (
                <div className="space-y-4">
                  <div className="dash-subtab-rail dash-subtab-rail--product dash-subtab-rail--center">
                    <button type="button" className={`dash-subtab-rail__chip${bookingMgmtTab === 'counselling' ? ' is-active' : ''}`} onClick={() => setBookingMgmtTab('counselling')}>Counselling Management</button>
                    <button type="button" className={`dash-subtab-rail__chip${bookingMgmtTab === 'program_session' ? ' is-active' : ''}`} onClick={() => setBookingMgmtTab('program_session')}>Sessions Management</button>
                  </div>
                  <StaffBookingsPanel
                    key={bookingMgmtTab}
                    api={adminApi}
                    token={token}
                    slotType={bookingMgmtTab}
                    onViewProfile={viewProfile}
                    onError={setError}
                    onNotice={setNotice}
                  />
                </div>
              )}

              {tab === 'users' && (
                <StaffUsersPanel api={adminApi} token={token} allowCounsellorAssign allowAccountActions onError={setError} onNotice={setNotice} catalogModules={catalogModules} />
              )}

              {tab === 'counsellors' && (
                <AdminCounsellorsPanel token={token} onNotice={setNotice} onError={setError} />
              )}

              {tab === 'payments' && (
                <AdminPaymentsPanel token={token} users={users} onNotice={setNotice} onError={setError} onViewUser={(id) => viewProfile(id, 'payments')} />
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
                <StaffReportsPanel api={adminApi} token={token} onNotice={setNotice} onError={setError} />
              )}

              {tab === 'leads' && (
                <AdminLeadsPanel token={token} onNotice={setNotice} onError={setError} />
              )}

              {tab === 'blogs' && (
                <AdminBlogPanel token={token} onNotice={setNotice} onError={setError} />
              )}

              {tab === 'landing-pages' && <AdminStudioPanel catalogModules={catalogModules} />}
              {tab === 'site-pages' && <AdminPageCatalogPanel onNotice={setNotice} onError={setError} />}
              {tab === 'whatsapp' && <AdminWhatsAppPanel onNotice={setNotice} onError={setError} />}

              {tab === 'settings' && (
                <div className="space-y-4 w-full max-w-none">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={`dash-subtab-rail__chip${settingsTab === 'community' ? ' is-active' : ''}`} onClick={() => setSettingsTab('community')}>Community links</button>
                    <button type="button" className={`dash-subtab-rail__chip${settingsTab === 'combos' ? ' is-active' : ''}`} onClick={() => setSettingsTab('combos')}>Agewise Bifurcation</button>
                    <button type="button" className={`dash-subtab-rail__chip${settingsTab === 'resources' ? ' is-active' : ''}`} onClick={() => setSettingsTab('resources')}>Resource links</button>
                  </div>
                  {settingsTab === 'community' && (
                    <AdminCommunitySchedulePanel
                      token={token}
                      schedule={communitySchedule}
                      onReload={reloadSettings}
                      onNotice={setNotice}
                      onError={setError}
                    />
                  )}
                  {settingsTab === 'combos' && (
                    <AdminAgewiseCombosPanel token={token} onNotice={setNotice} onError={setError} />
                  )}
                  {settingsTab === 'resources' && (
                    <AdminResourceLinksPanel token={token} users={users} payments={payments} onNotice={setNotice} onError={setError} />
                  )}
                </div>
              )}
            </>
          )}
        </DashboardSidebarLayout>
      </div>
    </DashboardShell>
  );
}
