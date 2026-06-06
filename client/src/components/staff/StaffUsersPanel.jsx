import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, Mail, Phone, UserCircle } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import { programs } from '../../data/content';
import AdminUserProfileModal from '../AdminUserProfileModal';
import CopyableUserId from '../CopyableUserId';
import { DashCard } from '../DashboardUI';

const CLASS_FILTER_OPTIONS = ['All classes', ...programs.map((p) => p.title)];
const STREAM_FILTER_OPTIONS = ['All streams', 'Science', 'Commerce', 'Arts', 'Humanities', 'Undecided'];
const JOINED_FILTER_OPTIONS = [
  { value: 'all', label: 'Any time' },
  { value: 'today', label: 'Joined today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
];

export default function StaffUsersPanel({ api, token, onError }) {
  const { t } = useLang();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [uidSearch, setUidSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All classes');
  const [testFilter, setTestFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [streamFilter, setStreamFilter] = useState('All streams');
  const [joinedFilter, setJoinedFilter] = useState('all');
  const [contactSearch, setContactSearch] = useState('');

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.users(token);
      setUsers(data.users || []);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }, [api, token, onError]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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

  const viewProfile = async (userId) => {
    setProfileOpen(true);
    setProfileLoading(true);
    setProfileUser(null);
    try {
      const data = await api.getUser(token, userId);
      setProfileUser(data.user);
    } catch (err) {
      onError?.(err.message);
      setProfileOpen(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const saveUserProfile = async (userId, form) => {
    setProfileSaving(true);
    try {
      const res = await api.updateUser(token, userId, form);
      setProfileUser(res.user);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...res.user, stats: u.stats } : u)));
    } catch (err) {
      onError?.(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  if (loading) {
    return (
      <DashCard className="!p-5 sm:!p-6">
        <p className="text-sm opacity-70 text-center py-8">Loading users…</p>
      </DashCard>
    );
  }

  return (
    <>
      <AdminUserProfileModal
        open={profileOpen}
        user={profileUser}
        loading={profileLoading}
        saving={profileSaving}
        onSave={saveUserProfile}
        onClose={() => { setProfileOpen(false); setProfileUser(null); }}
      />

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
              <Search className="w-3 h-3" /> Dreams ID / Name
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
                  <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Dreams ID</th>
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
    </>
  );
}
