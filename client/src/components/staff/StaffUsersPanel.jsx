import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, X, Mail, Phone, UserCog } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import { programs } from '../../data/content';
import AdminUserProfileModal from '../AdminUserProfileModal';
import CopyableUserId from '../CopyableUserId';
import { DashCard } from '../DashboardUI';
import AdminSectionExport from '../AdminSectionExport';
import UserActionsMenu from '../UserActionsMenu';
import AdminPasswordCard from '../admin/AdminPasswordCard';
import AdminBulkUsersPanel from '../admin/AdminBulkUsersPanel';

const CLASS_FILTER_OPTIONS = ['All classes', ...programs.map((p) => p.title)];
const STREAM_FILTER_OPTIONS = ['All streams', 'Science', 'Commerce', 'Arts', 'Humanities', 'Undecided'];
const JOINED_FILTER_OPTIONS = [
  { value: 'all', label: 'Any time' },
  { value: 'today', label: 'Joined today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
];

export default function StaffUsersPanel({ api, token, onError, allowCounsellorAssign = false, allowAccountActions = false }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [assigningId, setAssigningId] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [profileStats, setProfileStats] = useState(null);
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
  const [counsellorFilter, setCounsellorFilter] = useState('all');
  const [suspendUser, setSuspendUser] = useState(null);
  const [suspendUntil, setSuspendUntil] = useState('');
  const [actionUserId, setActionUserId] = useState(null);
  const [passwordCard, setPasswordCard] = useState(null);
  const [passwordSending, setPasswordSending] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setLoadError('');
    try {
      const usersRes = await api.users(token);
      setUsers(usersRes.users || []);
      if (allowCounsellorAssign && api.counsellors) {
        try {
          const cRes = await api.counsellors(token);
          setCounsellors(cRes.counsellors || []);
        } catch (counsellorErr) {
          console.warn('Counsellor list unavailable:', counsellorErr.message);
          setCounsellors([]);
        }
      }
    } catch (err) {
      const message = err.message || 'Failed to load users';
      setLoadError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }, [api, token, onError, allowCounsellorAssign]);

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
      if (counsellorFilter !== 'all') {
        const assigned = u.assigned_counsellor_id ? String(u.assigned_counsellor_id) : '';
        if (counsellorFilter === 'unassigned') {
          if (assigned) return false;
        } else if (assigned !== counsellorFilter) {
          return false;
        }
      }
      return true;
    });
  }, [users, uidSearch, contactSearch, classFilter, streamFilter, joinedFilter, testFilter, userFilter, counsellorFilter]);

  const clearUserFilters = () => {
    setUidSearch('');
    setContactSearch('');
    setClassFilter('All classes');
    setStreamFilter('All streams');
    setJoinedFilter('all');
    setTestFilter('all');
    setUserFilter('all');
    setCounsellorFilter('all');
  };

  const hasActiveUserFilters = uidSearch || contactSearch || classFilter !== 'All classes'
    || streamFilter !== 'All streams' || joinedFilter !== 'all' || testFilter !== 'all' || userFilter !== 'all'
    || counsellorFilter !== 'all';

  const assignCounsellor = async (userId, counsellorId) => {
    setAssigningId(userId);
    try {
      const res = await api.updateUser(token, userId, {
        assignedCounsellorId: counsellorId ? Number(counsellorId) : null,
      });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...res.user, stats: u.stats } : u)));
    } catch (err) {
      onError?.(err.message);
    } finally {
      setAssigningId(null);
    }
  };

  const viewProfile = async (userId) => {
    if (allowAccountActions) {
      navigate(`/admin/users/${userId}`);
      return;
    }
    setProfileOpen(true);
    setProfileLoading(true);
    setProfileUser(null);
    setProfileStats(null);
    try {
      const data = await api.getUser(token, userId);
      setProfileUser(data.user);
      setProfileStats(data.stats || null);
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

  const suspendAccount = async () => {
    if (!suspendUser) return;
    setActionUserId(suspendUser.id);
    try {
      const res = await api.updateUser(token, suspendUser.id, {
        accountStatus: 'suspended',
        suspendedUntil: suspendUntil || null,
      });
      setUsers((prev) => prev.map((u) => (u.id === suspendUser.id ? { ...u, ...res.user, stats: u.stats } : u)));
      setSuspendUser(null);
      setSuspendUntil('');
    } catch (err) {
      onError?.(err.message);
    } finally {
      setActionUserId(null);
    }
  };

  const unsuspendAccount = async (userId) => {
    setActionUserId(userId);
    try {
      const res = await api.updateUser(token, userId, { accountStatus: 'active', suspendedUntil: null });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...res.user, stats: u.stats } : u)));
    } catch (err) {
      onError?.(err.message);
    } finally {
      setActionUserId(null);
    }
  };

  const deleteAccount = async (user) => {
    if (!window.confirm(`Delete user ${user.name} (${user.user_uid})? This cannot be undone.`)) return;
    setActionUserId(user.id);
    try {
      await api.deleteUser(token, user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      onError?.(err.message);
    } finally {
      setActionUserId(null);
    }
  };

  const resetPassword = (user) => {
    setPasswordUser(user);
    setNewPassword('');
    setNewPasswordConfirm('');
  };

  const submitPasswordReset = async () => {
    if (!passwordUser) return;
    if (newPassword.length < 6) {
      onError?.('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      onError?.('Passwords do not match');
      return;
    }
    setActionUserId(passwordUser.id);
    try {
      const res = await api.resetUserPassword(token, passwordUser.id, { password: newPassword });
      setPasswordUser(null);
      setPasswordCard({ user: res.user || passwordUser, password: newPassword, messageSent: res.messageSent });
    } catch (err) {
      onError?.(err.message);
    } finally {
      setActionUserId(null);
    }
  };

  const sendPasswordMessage = async () => {
    if (!passwordCard?.user) return;
    setPasswordSending(true);
    try {
      await api.resetUserPassword(token, passwordCard.user.id, { sendMessage: true, password: passwordCard.password });
      setPasswordCard((p) => ({ ...p, messageSent: true }));
    } catch (err) {
      onError?.(err.message);
    } finally {
      setPasswordSending(false);
    }
  };

  const userExportColumns = [
    { label: 'Dreams ID', get: (u) => u.user_uid },
    { label: 'Name', get: (u) => u.name },
    { label: 'Email', get: (u) => u.email },
    { label: 'Phone', get: (u) => u.phone },
    { label: 'Class', get: (u) => u.profile?.classLevel },
    { label: 'Stream', get: (u) => u.profile?.stream },
    { label: 'Status', get: (u) => u.account_status || 'active' },
    { label: 'Joined', get: (u) => u.created_at },
  ];

  if (loading) {
    return (
      <DashCard className="!p-5 sm:!p-6">
        <p className="text-sm opacity-70 text-center py-8">Loading users…</p>
      </DashCard>
    );
  }

  return (
    <>
      {allowAccountActions && (
        <AdminBulkUsersPanel onError={onError} onComplete={() => loadUsers()} />
      )}
      <AdminUserProfileModal
        open={profileOpen}
        user={profileUser}
        stats={profileStats}
        loading={profileLoading}
        saving={profileSaving}
        onSave={saveUserProfile}
        onClose={() => { setProfileOpen(false); setProfileUser(null); setProfileStats(null); }}
        api={api}
        token={token}
        onError={onError}
      />

      <DashCard className="!p-4 sm:!p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold">{t('admin.manageUsers')}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <AdminSectionExport title="Users" filename="users" rows={filteredUsers} columns={userExportColumns} />
            {loadError && (
              <button type="button" onClick={loadUsers} className="btn-outline !py-2 !px-3 text-sm">Retry</button>
            )}
            <p className="text-sm opacity-70">
              {filteredUsers.length} of {users.length} students
              {hasActiveUserFilters && ' (filtered)'}
            </p>
          </div>
        </div>
        {loadError && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">{loadError}</p>
        )}

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
          {allowCounsellorAssign && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wide opacity-60 flex items-center gap-1 mb-1.5">
                <UserCog className="w-3 h-3" /> Counsellor
              </label>
              <select className="input-field w-full !py-2 !text-sm" value={counsellorFilter} onChange={(e) => setCounsellorFilter(e.target.value)}>
                <option value="all">All counsellors</option>
                <option value="unassigned">Unassigned</option>
                {counsellors.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
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
          <>
          <div className="md:hidden space-y-3">
            {filteredUsers.map((u) => (
              <div key={u.id} className="rounded-xl border border-sand-200 dark:border-sand-700 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <button type="button" onClick={() => viewProfile(u.id)} className="font-bold text-left text-amber-800 hover:underline">
                      {u.name}
                    </button>
                    <CopyableUserId uid={u.user_uid} compact />
                    {u.account_status === 'suspended' && (
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Suspended</span>
                    )}
                  </div>
                  <div className="flex items-start gap-1 shrink-0">
                    <UserActionsMenu
                      user={u}
                      api={api}
                      token={token}
                      onView={viewProfile}
                      onSuspend={(user) => { setSuspendUser(user); setSuspendUntil(''); }}
                      onUnsuspend={unsuspendAccount}
                      onDelete={deleteAccount}
                      onResetPassword={resetPassword}
                      onError={onError}
                      allowAccountActions={allowAccountActions}
                      actionBusy={actionUserId === u.id}
                      suspended={u.account_status === 'suspended'}
                    />
                  </div>
                </div>
                <p className="text-xs opacity-80">{u.email} · {u.phone || '—'}</p>
              </div>
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto -mx-1">
            <table className="w-full text-sm admin-data-table min-w-[860px]">
              <thead>
                <tr className="border-b border-sand-200 dark:border-sand-700 text-left">
                  <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Dreams ID</th>
                  <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Name</th>
                  <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Contact</th>
                  {allowCounsellorAssign && (
                    <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Counsellor</th>
                  )}
                  <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Class / Stream</th>
                  <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Profile</th>
                  <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Tests</th>
                  <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Joined</th>
                  <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60 text-right">Actions</th>
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
                    <td className="py-3 px-3 font-semibold">
                      <button type="button" onClick={() => viewProfile(u.id)} className="font-semibold text-amber-800 hover:underline text-left">
                        {u.name}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-xs opacity-80">
                      {u.email && <p className="flex items-center gap-1"><Mail className="w-3 h-3 shrink-0" />{u.email}</p>}
                      {u.phone && <p className="flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3 shrink-0" />{u.phone}</p>}
                    </td>
                    {allowCounsellorAssign && (
                      <td className="py-3 px-3 min-w-[160px]">
                        <select
                          className="input-field w-full !py-1.5 !text-xs"
                          value={u.assigned_counsellor_id ? String(u.assigned_counsellor_id) : ''}
                          disabled={assigningId === u.id}
                          onChange={(e) => assignCounsellor(u.id, e.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {counsellors.map((c) => (
                            <option key={c.id} value={String(c.id)}>{c.name}</option>
                          ))}
                        </select>
                      </td>
                    )}
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
                      <div className="flex flex-wrap justify-end gap-1 items-center">
                        {u.account_status === 'suspended' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 mr-1">Suspended</span>
                        )}
                        <UserActionsMenu
                          user={u}
                          api={api}
                          token={token}
                          onView={viewProfile}
                          onSuspend={(user) => { setSuspendUser(user); setSuspendUntil(''); }}
                          onUnsuspend={unsuspendAccount}
                          onDelete={deleteAccount}
                          onResetPassword={resetPassword}
                          onError={onError}
                          allowAccountActions={allowAccountActions}
                          actionBusy={actionUserId === u.id}
                          suspended={u.account_status === 'suspended'}
                        />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </DashCard>

      {passwordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setPasswordUser(null)}>
          <div className="bg-[var(--bg-elevated)] rounded-xl p-5 max-w-md w-full shadow-xl space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">Set password for {passwordUser.name}</h3>
            <input type="password" className="input-field w-full" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <input type="password" className="input-field w-full" placeholder="Confirm password" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} />
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-outline text-sm" onClick={() => setPasswordUser(null)}>Cancel</button>
              <button type="button" className="btn-primary text-sm" disabled={actionUserId === passwordUser.id} onClick={submitPasswordReset}>Save password</button>
            </div>
          </div>
        </div>
      )}

      {passwordCard && (
        <AdminPasswordCard
          user={passwordCard.user}
          password={passwordCard.password}
          messageSent={passwordCard.messageSent}
          onSend={sendPasswordMessage}
          sending={passwordSending}
          onClose={() => setPasswordCard(null)}
        />
      )}

      {suspendUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSuspendUser(null)}>
          <div className="bg-[var(--bg-elevated)] rounded-xl p-5 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2">Suspend {suspendUser.name}</h3>
            <p className="text-sm opacity-70 mb-3">User cannot sign in until suspension ends (or you unsuspend manually).</p>
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">Suspend until (optional)</label>
            <input type="datetime-local" className="input-field w-full text-sm mb-4" value={suspendUntil} onChange={(e) => setSuspendUntil(e.target.value)} />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setSuspendUser(null)} className="btn-outline text-sm">Cancel</button>
              <button type="button" disabled={actionUserId === suspendUser.id} onClick={suspendAccount} className="text-sm font-bold px-4 py-2 rounded-lg bg-amber-600 text-white">Suspend</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
