import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Calendar, FlaskConical, Clock, Shield, AlertCircle,
  CreditCard, Settings,
} from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../api';
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

const ADMIN_TABS = [
  { id: 'overview', label: 'Overview', desc: 'Stats & quick summary' },
  { id: 'analytics', label: 'Analytics', desc: 'Platform performance insights' },
  { id: 'bookings', label: 'Booking Management', desc: 'Slots, calendar & sessions' },
  { id: 'counsellors', label: 'Counsellor Staff', desc: 'Counsellor logins & passwords' },
  { id: 'users', label: 'User Management', desc: 'Registered students & profiles' },
  { id: 'payments', label: 'Payment Management', desc: 'Paid assessments & orders' },
  { id: 'modules', label: 'Module Catalog', desc: 'Add & edit checkout modules' },
  { id: 'vouchers', label: 'Vouchers', desc: 'Discount codes by module' },
  { id: 'reports', label: 'Report Management', desc: 'Deliver reports to users' },
  { id: 'leads', label: 'Contact Leads', desc: 'Website enquiries & messages' },
  { id: 'settings', label: 'Community & Links', desc: 'AI Launchpad community URL' },
];

export default function AdminDashboard() {
  const { t } = useLang();
  const { token, user } = useAuth();
  const location = useLocation();
  const tabParam = new URLSearchParams(location.search).get('tab') || 'overview';

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [profileUser, setProfileUser] = useState(null);
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
    const errors = [];

    const tasks = [
      { key: 'stats', fn: () => adminApi.stats(token), set: (v) => setStats(v) },
      { key: 'consultations', fn: () => adminApi.consultations(token), set: (v) => setConsultations(v.consultations || []) },
      { key: 'payments', fn: () => adminApi.payments(token, { limit: 100 }), set: (v) => setPayments(v.payments || []) },
      { key: 'settings', fn: () => adminApi.settings(token), set: (v) => setCommunityLink(v.settings?.community_links?.['crp-test'] || '') },
      { key: 'analytics', fn: () => adminApi.analytics(token), set: (v) => setAnalytics(v.analytics || null) },
      { key: 'modules', fn: () => adminApi.modules(token), set: (v) => setCatalogModules(v.modules || []) },
    ];

    adminApi.users(token)
      .then((v) => setUsers(v.users || []))
      .catch((err) => console.warn('Overview users preload failed:', err.message));

    await Promise.all(
      tasks.map(async (t) => {
        try {
          const data = await t.fn();
          t.set(data);
        } catch (err) {
          errors.push(`${t.key}: ${err.message}`);
          if (t.key === 'analytics') {
            setAnalytics(null);
            setAnalyticsError(err.message);
          }
        }
      })
    );

    if (errors.length) {
      setLoadErrors(errors);
      setError(`Some sections failed to load — ${errors.join(' · ')}`);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [token]);

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
    try {
      const data = await adminApi.getUser(token, userId);
      setProfileUser(data.user);
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
          {t('admin.title')}
        </motion.h1>

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

        <DashboardSidebarLayout tabs={ADMIN_TABS} defaultTab="overview" id="admin-dashboard" user={user} showProfileCompletion={false} sectionTitle="Admin Panel">
          {(tab) => (
            <>
              {tab === 'overview' && (
                <div className="space-y-8">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {statCards.map((s, i) => <AdminStatCard key={s.label} stat={s} index={i} />)}
                  </div>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <DashCard className="!p-5" glow>
                      <h3 className="font-bold mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-500" /> Registered Users ({stats?.users ?? users.length})
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {users.slice(0, 8).map((u, i) => (
                          <motion.div
                            key={u.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="p-3 rounded-xl bg-sand-50 dark:bg-sand-800/50 text-sm flex flex-wrap items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{u.name}</p>
                              {u.user_uid && <CopyableUserId uid={u.user_uid} compact animate={false} />}
                            </div>
                            <button type="button" onClick={() => viewProfile(u.id)} className="text-xs font-semibold text-amber-600 hover:underline shrink-0">View</button>
                          </motion.div>
                        ))}
                        {!users.length && <p className="text-sm opacity-60">No registered users yet.</p>}
                      </div>
                    </DashCard>
                    <DashCard className="!p-5" glow delay={0.05}>
                      <h3 className="font-bold mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> Recent Bookings</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {consultations.slice(0, 5).map((c) => (
                          <div key={c.id} className="p-3 rounded-xl bg-sand-50 dark:bg-sand-800/50 text-sm">
                            <p className="font-semibold">{c.user_name} — {c.program}</p>
                            <p className="text-xs opacity-70 mt-0.5">{c.scheduled_at && new Date(c.scheduled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}</p>
                          </div>
                        ))}
                        {!consultations.length && <p className="text-sm opacity-60">No bookings yet</p>}
                      </div>
                    </DashCard>
                    <DashCard className="!p-5">
                      <h3 className="font-bold mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4 text-amber-500" /> Recent Payments</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {payments.filter((p) => p.payment_status === 'confirmed').slice(0, 5).map((p) => (
                          <div key={p.id} className="p-3 rounded-xl bg-sand-50 dark:bg-sand-800/50 text-sm">
                            <p className="font-semibold">{p.user_name} — {p.product_title || p.type}</p>
                            <p className="text-xs opacity-70">₹{p.amount} · {p.paid_at && new Date(p.paid_at).toLocaleDateString()}</p>
                          </div>
                        ))}
                        {!payments.length && <p className="text-sm opacity-60">No paid orders yet</p>}
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
                <StaffUsersPanel api={adminApi} token={token} allowCounsellorAssign />
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
                <AdminVouchersPanel token={token} modules={catalogModules} onNotice={setNotice} onError={setError} />
              )}

              {tab === 'reports' && (
                <StaffReportsPanel api={adminApi} token={token} onNotice={setNotice} />
              )}

              {tab === 'leads' && (
                <AdminLeadsPanel token={token} onNotice={setNotice} onError={setError} />
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
