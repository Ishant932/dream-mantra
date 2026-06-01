import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Calendar, FlaskConical, Clock, Shield, AlertCircle, UserCircle,
  CreditCard, FileText, MapPin, Link2, Phone, Mail, Save, ExternalLink, Settings,
  Search, Filter, X, Pencil, Send, Check,
} from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../api';
import { programs } from '../data/content';
import AdminUserProfileModal from '../components/AdminUserProfileModal';
import AdminAnalyticsPanel from '../components/AdminAnalyticsPanel';
import AdminPaymentsPanel from '../components/AdminPaymentsPanel';
import AdminLeadsPanel from '../components/AdminLeadsPanel';
import CopyableUserId from '../components/CopyableUserId';
import SlotCalendar from '../components/SlotCalendar';
import AdminOpenSlotCard from '../components/AdminOpenSlotCard';
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
  { id: 'users', label: 'User Management', desc: 'Registered students & profiles' },
  { id: 'payments', label: 'Payment Management', desc: 'Paid assessments & orders' },
  { id: 'reports', label: 'Report Management', desc: 'Deliver reports to users' },
  { id: 'leads', label: 'Contact Leads', desc: 'Website enquiries & messages' },
  { id: 'settings', label: 'Community & Links', desc: 'AI Launchpad community URL' },
];

const CLASS_FILTER_OPTIONS = ['All classes', ...programs.map((p) => p.title)];

const STREAM_FILTER_OPTIONS = ['All streams', 'Science', 'Commerce', 'Arts', 'Humanities', 'Undecided'];

const JOINED_FILTER_OPTIONS = [
  { value: 'all', label: 'Any time' },
  { value: 'today', label: 'Joined today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
];

function ProfileSnapshot({ profile = {} }) {
  const fields = [
    ['Date of Birth', profile.dateOfBirth],
    ['Gender', profile.gender],
    ['Class', profile.classLevel],
    ['Stream', profile.stream],
    ['Board', profile.board],
    ['City', profile.city],
    ['State', profile.state],
    ['School / College', profile.schoolOrCollege],
    ['Career Goal', profile.careerGoal],
    ['Hobbies', profile.hobbies],
    ['Challenge', profile.biggestChallenge],
    ['Parent', profile.parentName],
    ['Parent Phone', profile.parentPhone],
    ['Counselling Mode', profile.preferredMode],
    ['How Found Us', profile.howHeard],
  ].filter(([, v]) => v);
  if (!fields.length) return <p className="text-xs opacity-60 mt-2">No profile details captured at booking</p>;
  return (
    <div className="mt-3 pt-3 border-t border-sand-200/50 dark:border-sand-700/40">
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-50 mb-2">Student profile (at booking)</p>
      <div className="grid sm:grid-cols-2 gap-1.5">
        {fields.map(([label, val]) => (
          <p key={label} className="text-xs"><span className="font-semibold opacity-70">{label}:</span> {val}</p>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { t } = useLang();
  const { token, user } = useAuth();
  const location = useLocation();
  const tabParam = new URLSearchParams(location.search).get('tab') || 'overview';

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [slots, setSlots] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reports, setReports] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [profileUser, setProfileUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [meetingLinks, setMeetingLinks] = useState({});
  const [reportForm, setReportForm] = useState({ userUid: '', assessmentId: '', reportLink: '', reportTitle: 'Assessment Report' });
  const [editingReportId, setEditingReportId] = useState(null);
  const [editReportForm, setEditReportForm] = useState({ reportTitle: '', reportLink: '', adminNotes: '' });
  const [reportSavingId, setReportSavingId] = useState(null);
  const [communityLink, setCommunityLink] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [uidSearch, setUidSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All classes');
  const [testFilter, setTestFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [streamFilter, setStreamFilter] = useState('All streams');
  const [joinedFilter, setJoinedFilter] = useState('all');
  const [contactSearch, setContactSearch] = useState('');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [loadErrors, setLoadErrors] = useState([]);

  const loadSlots = useCallback(async () => {
    if (!token) return;
    setSlotsLoading(true);
    try {
      const data = await adminApi.slots(token);
      setSlots(data.slots || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setSlotsLoading(false);
    }
  }, [token]);

  const openSlots = useMemo(
    () => slots.filter((s) => s.status === 'open' && (s.booked_count || 0) < (s.capacity || 1)),
    [slots]
  );

  const selectedReportUser = useMemo(
    () => users.find((u) => u.user_uid === reportForm.userUid),
    [users, reportForm.userUid]
  );

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
      { key: 'users', fn: () => adminApi.users(token), set: (v) => setUsers(v.users || []) },
      { key: 'consultations', fn: () => adminApi.consultations(token), set: (v) => setConsultations(v.consultations || []) },
      { key: 'payments', fn: () => adminApi.payments(token, { limit: 100 }), set: (v) => setPayments(v.payments || []) },
      { key: 'reports', fn: () => adminApi.reports(token), set: (v) => setReports(v.reports || []) },
      { key: 'settings', fn: () => adminApi.settings(token), set: (v) => setCommunityLink(v.settings?.community_links?.['crp-test'] || '') },
      { key: 'analytics', fn: () => adminApi.analytics(token), set: (v) => setAnalytics(v.analytics || null) },
    ];

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
    loadSlots();
    setLoading(false);
  };

  useEffect(() => { load(); }, [token]);

  const updateStatus = async (id, status) => {
    try {
      await adminApi.updateConsultation(token, id, { status });
      const d = await adminApi.consultations(token);
      setConsultations(d.consultations || []);
    } catch (err) { setError(err.message); }
  };

  const saveMeetingLink = async (id) => {
    try {
      await adminApi.updateConsultation(token, id, { meeting_link: meetingLinks[id] || '' });
      const d = await adminApi.consultations(token);
      setConsultations(d.consultations || []);
    } catch (err) { setError(err.message); }
  };

  const handleCreateSlot = async (form) => {
    try {
      setError('');
      await adminApi.createSlot(token, form);
      await loadSlots();
      setNotice('Slot created successfully.');
    } catch (err) {
      setNotice('');
      setError(err.message);
      throw err;
    }
  };

  const handleUpdateSlot = async (id, form) => {
    try {
      setError('');
      await adminApi.updateSlot(token, id, form);
      await loadSlots();
      setNotice('Slot updated successfully.');
    } catch (err) {
      setNotice('');
      setError(err.message);
      throw err;
    }
  };

  const handleDeleteSlot = async (id) => {
    try {
      setError('');
      await adminApi.deleteSlot(token, id);
      await loadSlots();
      setNotice('Slot deleted.');
    } catch (err) {
      setNotice('');
      setError(err.message);
      throw err;
    }
  };

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

  const submitReport = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createReport(token, {
        userUid: reportForm.userUid,
        assessmentId: reportForm.assessmentId ? Number(reportForm.assessmentId) : null,
        reportLink: reportForm.reportLink,
        reportTitle: reportForm.reportTitle,
      });
      const r = await adminApi.reports(token);
      setReports(r.reports || []);
      setReportForm({ userUid: '', assessmentId: '', reportLink: '', reportTitle: 'Assessment Report' });
      setNotice('Report published to user dashboard.');
    } catch (err) { setError(err.message); }
  };

  const startEditReport = (report) => {
    setEditingReportId(report.id);
    setEditReportForm({
      reportTitle: report.report_title || '',
      reportLink: report.report_link || '',
      adminNotes: report.admin_notes || '',
    });
  };

  const cancelEditReport = () => {
    setEditingReportId(null);
    setEditReportForm({ reportTitle: '', reportLink: '', adminNotes: '' });
  };

  const saveEditReport = async (resend = false) => {
    if (!editingReportId) return;
    setReportSavingId(editingReportId);
    try {
      await adminApi.updateReport(token, editingReportId, {
        reportTitle: editReportForm.reportTitle,
        reportLink: editReportForm.reportLink,
        adminNotes: editReportForm.adminNotes,
        resendNotification: resend,
      });
      const r = await adminApi.reports(token);
      setReports(r.reports || []);
      setNotice(resend ? 'Report updated and notification resent to user.' : 'Report updated successfully.');
      cancelEditReport();
    } catch (err) {
      setError(err.message);
    } finally {
      setReportSavingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = uidSearch.trim().toLowerCase();
    const contactQ = contactSearch.trim().toLowerCase();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return users.filter((u) => {
      if (q && !(u.user_uid || '').toLowerCase().includes(q) && !(u.name || '').toLowerCase().includes(q)) {
        return false;
      }
      if (contactQ) {
        const email = (u.email || '').toLowerCase();
        const phone = (u.phone || '').toLowerCase();
        const city = (u.profile?.city || '').toLowerCase();
        if (!email.includes(contactQ) && !phone.includes(contactQ) && !city.includes(contactQ)) return false;
      }
      if (classFilter !== 'All classes') {
        const cls = u.profile?.classLevel || '';
        if (cls !== classFilter) return false;
      }
      if (streamFilter !== 'All streams') {
        const stream = u.profile?.stream || '';
        if (stream !== streamFilter) return false;
      }
      if (joinedFilter !== 'all' && u.created_at) {
        const joined = new Date(u.created_at);
        if (joinedFilter === 'today' && joined < startOfToday) return false;
        if (joinedFilter === 'week' && joined < startOfWeek) return false;
        if (joinedFilter === 'month' && joined < startOfMonth) return false;
      }
      if (testFilter === 'completed' && !u.stats?.hasCompletedTest) return false;
      if (testFilter === 'paid' && !u.stats?.paidTests) return false;
      if (testFilter === 'none' && (u.stats?.assessmentsBooked || 0) > 0) return false;
      if (userFilter === 'pending' && !u.stats?.isPending) return false;
      if (userFilter === 'complete' && u.stats?.isPending) return false;
      return true;
    });
  }, [users, uidSearch, contactSearch, classFilter, streamFilter, joinedFilter, testFilter, userFilter]);

  const clearUserFilters = () => {
    setUidSearch('');
    setContactSearch('');
    setClassFilter('All classes');
    setStreamFilter('All streams');
    setJoinedFilter('all');
    setTestFilter('all');
    setUserFilter('all');
  };

  const hasActiveUserFilters = uidSearch || contactSearch || classFilter !== 'All classes'
    || streamFilter !== 'All streams' || joinedFilter !== 'all' || testFilter !== 'all' || userFilter !== 'all';

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
                        <Users className="w-4 h-4 text-amber-500" /> Registered Users ({users.length})
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
                <div className="space-y-8">
                  <DashCard className="!p-5 sm:!p-6">
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-2"><Calendar className="w-5 h-5 text-amber-500" /> Consultation Slots — Live Calendar</h2>
                    <p className="text-sm opacity-70 mb-2">Create slots below, or click any slot on the calendar to edit time, capacity, counsellor, and meeting link. Delete empty slots with the trash icon.</p>
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-6">{openSlots.length} open slots across all dates · {slots.length} total</p>
                    <SlotCalendar mode="admin" size="large" slots={slots} loading={slotsLoading} onCreateSlot={handleCreateSlot} onUpdateSlot={handleUpdateSlot} onDeleteSlot={handleDeleteSlot} />
                  </DashCard>

                  {openSlots.length > 0 && (
                    <DashCard className="!p-5 sm:!p-6">
                      <h3 className="font-bold mb-2 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> All open slots ({openSlots.length})</h3>
                      <p className="text-xs opacity-70 mb-4">Click the pencil icon on any card to edit date, time, capacity, counsellor, and meeting link.</p>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[28rem] overflow-y-auto pr-1">
                        {openSlots.map((s) => (
                          <AdminOpenSlotCard
                            key={s.id}
                            slot={s}
                            onUpdate={handleUpdateSlot}
                            onDelete={handleDeleteSlot}
                          />
                        ))}
                      </div>
                    </DashCard>
                  )}

                  <DashCard className="!p-5 sm:!p-6">
                    <h2 className="text-lg font-bold mb-4">{t('admin.manageConsultations')}</h2>
                    <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-1">
                      {consultations.length === 0 ? (
                        <p className="text-sm opacity-70">No consultations yet.</p>
                      ) : consultations.map((c) => (
                        <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="dash-admin-consult-card admin-booking-card">
                          <div className="flex flex-wrap justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-base">{c.user_name} — {c.program}</p>
                              <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mt-0.5">{c.slot_title || 'Counselling Session'}</p>
                              <div className="flex flex-wrap gap-3 mt-2 text-xs opacity-80">
                                {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                                {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                              </div>
                              {c.scheduled_at && (
                                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(c.scheduled_at).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}
                                  {c.end_at && ` – ${new Date(c.end_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}`}
                                </p>
                              )}
                              {c.location && (
                                <p className="text-xs mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{c.location} · {c.mode}</p>
                              )}
                              {c.notes && <p className="text-xs mt-2 p-2 rounded-lg bg-sand-100 dark:bg-sand-800/60 italic">"{c.notes}"</p>}
                              <ProfileSnapshot profile={c.user_profile || c.user_snapshot?.profile} />
                            </div>
                            <button type="button" onClick={() => viewProfile(c.user_id)} className="dash-admin-view-btn shrink-0 h-9 w-9 rounded-xl inline-flex items-center justify-center" title="Full profile">
                              <UserCircle className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="mt-4 pt-3 border-t border-sand-200/60 dark:border-sand-700/40">
                            <label className="text-xs font-bold uppercase tracking-wide opacity-60 flex items-center gap-1 mb-1.5"><Link2 className="w-3 h-3" /> Meeting link (share with user)</label>
                            <div className="flex gap-2 flex-wrap">
                              <input
                                type="url"
                                className="input-field flex-1 min-w-[12rem] !py-2 !text-sm"
                                placeholder="https://meet.google.com/..."
                                value={meetingLinks[c.id] ?? c.meeting_link ?? ''}
                                onChange={(e) => setMeetingLinks({ ...meetingLinks, [c.id]: e.target.value })}
                              />
                              <button type="button" onClick={() => saveMeetingLink(c.id)} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1"><Save className="w-3.5 h-3.5" /> Save</button>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-3 flex-wrap">
                            {['pending', 'confirmed', 'completed'].map((st) => (
                              <button key={st} type="button" onClick={() => updateStatus(c.id, st)} className={`text-xs px-3 py-1.5 rounded-lg capitalize transition ${c.status === st ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-amber-50 shadow-md' : 'dash-admin-status-idle'}`}>{st}</button>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </DashCard>
                </div>
              )}

              {tab === 'users' && (
                <DashCard className="!p-5 sm:!p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <h2 className="text-lg font-bold">{t('admin.manageUsers')}</h2>
                    <p className="text-sm opacity-70">
                      {filteredUsers.length} of {users.length} students
                      {hasActiveUserFilters && ' (filtered)'}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-5 p-4 rounded-2xl bg-sand-50 dark:bg-sand-800/40 border border-sand-200/60 dark:border-sand-700/40">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wide opacity-60 flex items-center gap-1 mb-1.5">
                        <Search className="w-3 h-3" /> Unique ID / Name
                      </label>
                      <input
                        type="search"
                        className="input-field w-full !py-2 !text-sm"
                        placeholder="605210001 or student name"
                        value={uidSearch}
                        onChange={(e) => setUidSearch(e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wide opacity-60 flex items-center gap-1 mb-1.5">
                        <Search className="w-3 h-3" /> Email / Phone / City
                      </label>
                      <input
                        type="search"
                        className="input-field w-full !py-2 !text-sm"
                        placeholder="Search contact or city"
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide opacity-60 flex items-center gap-1 mb-1.5">
                        <Filter className="w-3 h-3" /> Class
                      </label>
                      <select className="input-field w-full !py-2 !text-sm" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                        {CLASS_FILTER_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide opacity-60 mb-1.5 block">Stream</label>
                      <select className="input-field w-full !py-2 !text-sm" value={streamFilter} onChange={(e) => setStreamFilter(e.target.value)}>
                        {STREAM_FILTER_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide opacity-60 mb-1.5 block">Joined</label>
                      <select className="input-field w-full !py-2 !text-sm" value={joinedFilter} onChange={(e) => setJoinedFilter(e.target.value)}>
                        {JOINED_FILTER_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide opacity-60 mb-1.5 block">Test Status</label>
                      <select className="input-field w-full !py-2 !text-sm" value={testFilter} onChange={(e) => setTestFilter(e.target.value)}>
                        <option value="all">All tests</option>
                        <option value="completed">Completed test</option>
                        <option value="paid">Paid (any stage)</option>
                        <option value="none">No module booked</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide opacity-60 mb-1.5 block">Profile Status</label>
                      <select className="input-field w-full !py-2 !text-sm" value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                        <option value="all">All users</option>
                        <option value="pending">Pending profile</option>
                        <option value="complete">Profile complete</option>
                      </select>
                    </div>
                    {hasActiveUserFilters && (
                      <div className="flex items-end sm:col-span-2 lg:col-span-1">
                        <button type="button" onClick={clearUserFilters} className="btn-outline !py-2 !px-3 text-sm w-full inline-flex items-center justify-center gap-1">
                          <X className="w-3.5 h-3.5" /> Clear filters
                        </button>
                      </div>
                    )}
                  </div>

                  {users.length === 0 ? (
                    <p className="text-sm opacity-70 text-center py-8">No users yet.</p>
                  ) : filteredUsers.length === 0 ? (
                    <p className="text-sm opacity-70 text-center py-8">No users match your filters.</p>
                  ) : (
                    <div className="overflow-x-auto -mx-1">
                      <table className="w-full text-sm admin-data-table min-w-[760px]">
                        <thead>
                          <tr className="border-b border-sand-200 dark:border-sand-700 text-left">
                            <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Unique ID</th>
                            <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Name</th>
                            <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Contact</th>
                            <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Class / Stream</th>
                            <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Profile</th>
                            <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Tests</th>
                            <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Joined</th>
                            <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60 text-right">View</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((u, i) => (
                            <motion.tr
                              key={u.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: Math.min(i * 0.03, 0.3) }}
                              className="border-b border-sand-100 dark:border-sand-800/60 hover:bg-amber-50/40 dark:hover:bg-sand-800/30 transition"
                            >
                              <td className="py-3 px-3"><CopyableUserId uid={u.user_uid} compact /></td>
                              <td className="py-3 px-3 font-semibold">{u.name}</td>
                              <td className="py-3 px-3 text-xs opacity-80">
                                {u.email && <p className="flex items-center gap-1"><Mail className="w-3 h-3 shrink-0" />{u.email}</p>}
                                {u.phone && <p className="flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3 shrink-0" />{u.phone}</p>}
                              </td>
                              <td className="py-3 px-3 text-xs">
                                {[u.profile?.classLevel, u.profile?.stream].filter(Boolean).join(' · ') || '—'}
                              </td>
                              <td className="py-3 px-3">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${u.stats?.isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                  {u.profileCompletion ?? 0}%
                                </span>
                              </td>
                              <td className="py-3 px-3 text-xs">
                                {u.stats?.hasCompletedTest ? (
                                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">Completed ({u.stats.completedTests})</span>
                                ) : u.stats?.pendingPayment ? (
                                  <span className="font-semibold text-amber-700 dark:text-amber-400">Payment pending</span>
                                ) : u.stats?.paidTests ? (
                                  <span className="opacity-80">Paid · in progress</span>
                                ) : u.stats?.assessmentsBooked ? (
                                  <span className="opacity-70">Booked</span>
                                ) : (
                                  <span className="opacity-50">—</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-xs opacity-70 whitespace-nowrap">
                                {u.created_at && new Date(u.created_at).toLocaleDateString('en-IN')}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button type="button" onClick={() => viewProfile(u.id)} className="dash-admin-view-btn shrink-0 h-9 w-9 rounded-xl inline-flex items-center justify-center" title="View full profile">
                                  <UserCircle className="w-5 h-5" />
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </DashCard>
              )}

              {tab === 'payments' && (
                <AdminPaymentsPanel token={token} onNotice={setNotice} onError={setError} />
              )}

              {tab === 'reports' && (
                <div className="space-y-6">
                  <DashCard className="!p-5 sm:!p-6">
                    <h2 className="text-lg font-bold mb-2 flex items-center gap-2"><FileText className="w-5 h-5 text-amber-500" /> Add / Update Report Link</h2>
                    <p className="text-sm opacity-70 mb-5">Paste a Google Drive, PDF or report URL — it will appear in the user's Reports tab.</p>
                    <form onSubmit={submitReport} className="grid sm:grid-cols-2 gap-4 max-w-3xl">
                      <select className="input-field" value={reportForm.userUid} onChange={(e) => setReportForm({ ...reportForm, userUid: e.target.value, assessmentId: '' })} required>
                        <option value="">Select user by Unique ID</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.user_uid}>{u.user_uid} — {u.name}</option>
                        ))}
                      </select>
                      <select className="input-field" value={reportForm.assessmentId} onChange={(e) => setReportForm({ ...reportForm, assessmentId: e.target.value })} disabled={!reportForm.userUid}>
                        <option value="">Link to paid course (optional)</option>
                        {payments.filter((p) => selectedReportUser && p.user_id === selectedReportUser.id).map((p) => (
                          <option key={p.id} value={p.id}>{p.type} — ₹{p.amount}</option>
                        ))}
                      </select>
                      <input type="text" className="input-field sm:col-span-2" placeholder="Report title" value={reportForm.reportTitle} onChange={(e) => setReportForm({ ...reportForm, reportTitle: e.target.value })} />
                      <input type="url" className="input-field sm:col-span-2" placeholder="Report URL (Google Drive / PDF link)" value={reportForm.reportLink} onChange={(e) => setReportForm({ ...reportForm, reportLink: e.target.value })} required />
                      <button type="submit" className="btn-primary sm:col-span-2">Publish report to user dashboard</button>
                    </form>
                  </DashCard>

                  <DashCard className="!p-5 sm:!p-6">
                    <h3 className="font-bold mb-4">Published Reports ({reports.length})</h3>
                    {reports.length === 0 ? (
                      <p className="text-sm opacity-60">No reports published yet.</p>
                    ) : (
                      <div className="overflow-x-auto -mx-1">
                        <table className="w-full text-sm admin-data-table min-w-[560px]">
                          <thead>
                            <tr className="border-b border-sand-200 dark:border-sand-700 text-left">
                              <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Unique ID</th>
                              <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Student</th>
                              <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Report</th>
                              <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Updated</th>
                              <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reports.map((r) => (
                              <tr key={r.id} className="border-b border-sand-100 dark:border-sand-800/60 hover:bg-amber-50/40 dark:hover:bg-sand-800/30 transition align-top">
                                {editingReportId === r.id ? (
                                  <>
                                    <td className="py-3 px-3"><CopyableUserId uid={r.user_uid} compact /></td>
                                    <td className="py-3 px-3 font-semibold">{r.user_name}</td>
                                    <td className="py-3 px-3" colSpan={2}>
                                      <div className="space-y-2 max-w-md">
                                        <input
                                          type="text"
                                          className="input-field !py-2 text-sm w-full"
                                          placeholder="Report title"
                                          value={editReportForm.reportTitle}
                                          onChange={(e) => setEditReportForm({ ...editReportForm, reportTitle: e.target.value })}
                                        />
                                        <input
                                          type="url"
                                          className="input-field !py-2 text-sm w-full"
                                          placeholder="Report URL"
                                          value={editReportForm.reportLink}
                                          onChange={(e) => setEditReportForm({ ...editReportForm, reportLink: e.target.value })}
                                        />
                                        <textarea
                                          className="input-field !py-2 text-sm w-full resize-none"
                                          rows={2}
                                          placeholder="Internal admin notes (optional)"
                                          value={editReportForm.adminNotes}
                                          onChange={(e) => setEditReportForm({ ...editReportForm, adminNotes: e.target.value })}
                                        />
                                      </div>
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                      <div className="flex flex-wrap gap-1.5 justify-end">
                                        <button
                                          type="button"
                                          disabled={reportSavingId === r.id}
                                          onClick={() => saveEditReport(false)}
                                          className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center gap-1"
                                        >
                                          <Check className="w-3.5 h-3.5" /> Save
                                        </button>
                                        <button
                                          type="button"
                                          disabled={reportSavingId === r.id || !editReportForm.reportLink}
                                          onClick={() => saveEditReport(true)}
                                          className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 inline-flex items-center gap-1"
                                        >
                                          <Send className="w-3.5 h-3.5" /> Save &amp; resend
                                        </button>
                                        <button
                                          type="button"
                                          onClick={cancelEditReport}
                                          className="text-xs font-bold px-2 py-1.5 rounded-lg bg-sand-200 text-sand-700"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </td>
                                  </>
                                ) : (
                                  <>
                                <td className="py-3 px-3"><CopyableUserId uid={r.user_uid} compact /></td>
                                <td className="py-3 px-3 font-semibold">{r.user_name}</td>
                                <td className="py-3 px-3">
                                  <p className="font-medium">{r.report_title}</p>
                                  <p className="text-xs opacity-70">{r.product_title}</p>
                                </td>
                                <td className="py-3 px-3 text-xs opacity-70 whitespace-nowrap">
                                  {new Date(r.updated_at || r.created_at).toLocaleDateString('en-IN')}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <div className="flex flex-wrap gap-2 justify-end items-center">
                                    {r.report_link ? (
                                      <a href={r.report_link} target="_blank" rel="noopener noreferrer" className="text-sm text-amber-600 font-semibold inline-flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" /> Open</a>
                                    ) : (
                                      <span className="text-xs opacity-50">—</span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => startEditReport(r)}
                                      className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-amber-300 text-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 inline-flex items-center gap-1"
                                    >
                                      <Pencil className="w-3.5 h-3.5" /> Edit
                                    </button>
                                  </div>
                                </td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </DashCard>
                </div>
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
