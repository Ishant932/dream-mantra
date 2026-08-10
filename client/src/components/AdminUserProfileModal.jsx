import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCircle, Save, Edit3 } from 'lucide-react';
import CopyableUserId from './CopyableUserId';
import UserDownloadMenu from './UserDownloadMenu';
import { programs } from '../data/content';

const PROFILE_FIELDS = [
  { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
  { key: 'gender', label: 'Gender', type: 'text' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'state', label: 'State', type: 'text' },
  { key: 'classLevel', label: 'Class / Level', type: 'select', options: programs.map((p) => p.title) },
  { key: 'stream', label: 'Stream / Interest', type: 'text' },
  { key: 'board', label: 'Board / Curriculum', type: 'text' },
  { key: 'schoolOrCollege', label: 'School / College', type: 'text' },
  { key: 'careerGoal', label: 'Career Goal', type: 'text' },
  { key: 'hobbies', label: 'Hobbies & Interests', type: 'textarea' },
  { key: 'biggestChallenge', label: 'Biggest Challenge', type: 'textarea' },
  { key: 'parentName', label: 'Parent / Guardian Name', type: 'text' },
  { key: 'parentPhone', label: 'Parent Contact', type: 'text' },
  { key: 'whatsappNumber', label: 'WhatsApp Number', type: 'text' },
  { key: 'preferredMode', label: 'Counselling Mode', type: 'text' },
  { key: 'howHeard', label: 'How You Found Us', type: 'text' },
];

export default function AdminUserProfileModal({
  user,
  stats,
  open,
  onClose,
  loading,
  onSave,
  saving,
  api,
  token,
  onError,
  variant = 'modal',
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', profile: {} });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        profile: { ...(user.profile || {}) },
      });
      setEditing(false);
    }
  }, [user]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(user.id, form);
  };

  const checklist = user?.profileChecklist || [];
  const isPage = variant === 'page';

  const panel = (
    <motion.div
      initial={isPage ? false : { opacity: 0, scale: 0.94, y: 20 }}
      animate={isPage ? undefined : { opacity: 1, scale: 1, y: 0 }}
      exit={isPage ? undefined : { opacity: 0, scale: 0.96, y: 12 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      className={`relative w-full ${isPage ? 'max-w-none' : 'max-w-3xl max-h-[90vh]'} bg-[var(--bg-elevated)] dark:bg-sand-900 rounded-3xl border border-sand-200 dark:border-sand-700 shadow-2xl overflow-hidden overflow-y-auto`}
      onClick={isPage ? undefined : (e) => e.stopPropagation()}
    >
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[var(--bg-elevated)] dark:bg-sand-900 border-b border-sand-200 dark:border-sand-700">
            <div className="flex items-center gap-3">
              <UserCircle className="w-7 h-7 text-amber-500" />
              <div>
                <h2 className="font-display text-lg font-bold">User Profile</h2>
                <p className="text-xs opacity-60">{editing ? 'Edit and save all details' : 'Complete student record'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user && !loading && api && token && (
                <UserDownloadMenu api={api} token={token} user={user} onError={onError} compact />
              )}
              {user && !loading && (
                <button
                  type="button"
                  onClick={() => setEditing((v) => !v)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-300 text-amber-700 dark:text-amber-400 inline-flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> {editing ? 'View' : 'Edit'}
                </button>
              )}
              <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-sand-100 dark:hover:bg-sand-800 transition" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : user ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {user.user_uid && (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60">
                    <p className="text-xs font-bold uppercase tracking-wide opacity-60 mb-2">Dreams ID</p>
                    <CopyableUserId uid={user.user_uid} />
                    <div className="flex flex-wrap gap-3 mt-2 text-xs opacity-70">
                      <span>Joined {user.created_at && new Date(user.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                      {user.assigned_counsellor_name && (
                        <span>Counsellor: {user.assigned_counsellor_name}</span>
                      )}
                      {user.account_status === 'suspended' && (
                        <span className="font-bold text-red-600">Suspended{user.suspended_until ? ` until ${new Date(user.suspended_until).toLocaleString('en-IN')}` : ''}</span>
                      )}
                    </div>
                  </div>
                )}

                {stats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-sand-50 dark:bg-sand-800/50 text-center">
                      <p className="text-lg font-bold text-amber-700">{stats.consultations ?? 0}</p>
                      <p className="text-[10px] font-bold uppercase opacity-60">Consultations</p>
                    </div>
                    <div className="p-3 rounded-xl bg-sand-50 dark:bg-sand-800/50 text-center">
                      <p className="text-lg font-bold text-amber-700">{stats.assessments ?? 0}</p>
                      <p className="text-[10px] font-bold uppercase opacity-60">Assessments</p>
                    </div>
                    <div className="p-3 rounded-xl bg-sand-50 dark:bg-sand-800/50 text-center">
                      <p className="text-lg font-bold text-emerald-700">{stats.paidTests ?? 0}</p>
                      <p className="text-[10px] font-bold uppercase opacity-60">Paid modules</p>
                    </div>
                    <div className="p-3 rounded-xl bg-sand-50 dark:bg-sand-800/50 text-center">
                      <p className="text-lg font-bold">{user.profileCompletion ?? 0}%</p>
                      <p className="text-[10px] font-bold uppercase opacity-60">Profile</p>
                    </div>
                  </div>
                )}

                {stats?.assessmentsList?.length > 0 && (
                  <div className="p-4 rounded-xl border border-sand-200 dark:border-sand-700">
                    <p className="text-xs font-bold uppercase opacity-60 mb-2">Module purchases</p>
                    <ul className="space-y-1.5 text-sm">
                      {stats.assessmentsList.map((a) => (
                        <li key={a.id} className="flex flex-wrap justify-between gap-2">
                          <span>{a.type || a.product_title || 'Module'}</span>
                          <span className={`text-xs font-bold capitalize ${a.status === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>{a.status}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {checklist.length > 0 && !editing && (
                  <div className="p-4 rounded-xl border border-sand-200 dark:border-sand-700">
                    <p className="text-xs font-bold uppercase opacity-60 mb-2">Profile checklist</p>
                    <div className="flex flex-wrap gap-1.5">
                      {checklist.map((item) => (
                        <span
                          key={item.key}
                          className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.done ? 'bg-emerald-100 text-emerald-800' : 'bg-sand-100 text-sand-600'}`}
                        >
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase opacity-60 mb-1 block">Name</label>
                    <input
                      className="input-field w-full"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      disabled={!editing}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase opacity-60 mb-1 block">Email</label>
                    <input
                      type="email"
                      className="input-field w-full"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase opacity-60 mb-1 block">Phone</label>
                    <input
                      className="input-field w-full"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase opacity-60 mb-1 block">Two-factor auth</label>
                    <p className="input-field w-full !bg-sand-50 dark:!bg-sand-800 font-semibold">{user.twoFactorEnabled ? 'Enabled' : 'Not enabled'}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-sand-200/60 dark:border-sand-700/40">
                  {PROFILE_FIELDS.map(({ key, label, type, options }) => (
                    <div key={key} className={type === 'textarea' ? 'sm:col-span-2' : ''}>
                      <label className="text-xs font-bold uppercase opacity-60 mb-1 block">{label}</label>
                      {type === 'select' ? (
                        <select
                          className="input-field w-full"
                          value={form.profile[key] || ''}
                          onChange={(e) => setForm({ ...form, profile: { ...form.profile, [key]: e.target.value } })}
                          disabled={!editing}
                        >
                          <option value="">—</option>
                          {options.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      ) : type === 'textarea' ? (
                        <textarea
                          className="input-field w-full min-h-[4rem]"
                          value={form.profile[key] || ''}
                          onChange={(e) => setForm({ ...form, profile: { ...form.profile, [key]: e.target.value } })}
                          disabled={!editing}
                          rows={2}
                        />
                      ) : (
                        <input
                          type={type}
                          className="input-field w-full"
                          value={form.profile[key] || ''}
                          onChange={(e) => setForm({ ...form, profile: { ...form.profile, [key]: e.target.value } })}
                          disabled={!editing}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {editing && (
                  <motion.button
                    type="submit"
                    disabled={saving}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="btn-primary w-full inline-flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save changes'}
                  </motion.button>
                )}
              </form>
            ) : (
              <p className="text-center opacity-60 py-12">Could not load profile.</p>
            )}
          </div>
        </motion.div>
  );

  if (isPage) return panel;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-950/60 backdrop-blur-sm"
        onClick={onClose}
      >
        {panel}
      </motion.div>
    </AnimatePresence>
  );
}
