import { useState, useEffect, useCallback } from 'react';
import { UserCog, Plus, Pencil, Trash2, KeyRound, Mail, Phone } from 'lucide-react';
import { adminApi } from '../api';
import CopyableUserId from './CopyableUserId';
import { DashCard } from './DashboardUI';
import AdminPanelHeader from './AdminPanelHeader';

const emptyForm = { name: '', email: '', phone: '', password: '' };

export default function AdminCounsellorsPanel({ token, onNotice, onError }) {
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setLoadError('');
    try {
      const data = await adminApi.counsellors(token);
      setCounsellors(data.counsellors || []);
    } catch (err) {
      const message = err.message || 'Failed to load counsellor accounts';
      setLoadError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }, [token, onError]);

  useEffect(() => {
    load();
  }, [load]);

  const createCounsellor = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await adminApi.createCounsellor(token, form);
      setCounsellors(data.counsellors || []);
      setForm(emptyForm);
      onNotice?.('Counsellor account created — share email/phone and password for login.');
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditForm({ name: c.name, email: c.email || '', phone: c.phone || '', password: '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', email: '', phone: '', password: '' });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const body = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
      };
      if (editForm.password.trim()) body.password = editForm.password.trim();

      const data = await adminApi.updateCounsellor(token, editingId, body);
      setCounsellors(data.counsellors || []);
      onNotice?.('Counsellor account updated.');
      cancelEdit();
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeCounsellor = async (c) => {
    if (!window.confirm(`Remove counsellor "${c.name}"? They will no longer be able to log in.`)) return;
    setDeletingId(c.id);
    try {
      const data = await adminApi.deleteCounsellor(token, c.id);
      setCounsellors(data.counsellors || []);
      if (editingId === c.id) cancelEdit();
      onNotice?.('Counsellor account removed.');
    } catch (err) {
      onError?.(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <DashCard className="!p-5 sm:!p-6">
        <p className="text-sm opacity-70 text-center py-8">Loading counsellor accounts…</p>
      </DashCard>
    );
  }

  return (
    <div className="space-y-4">
      <AdminPanelHeader
        title="Counsellor Staff"
        subtitle={`${counsellors.length} counsellor accounts`}
        exportProps={{
          title: 'Counsellors',
          filename: 'counsellors',
          rows: counsellors,
          columns: [
            { label: 'Dreams ID', get: (c) => c.user_uid },
            { label: 'Name', get: (c) => c.name },
            { label: 'Email', get: (c) => c.email },
            { label: 'Phone', get: (c) => c.phone },
          ],
        }}
      />
      {loadError && (
        <DashCard className="!p-4 border border-red-300/60 bg-red-50 dark:bg-red-950/30">
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">{loadError}</p>
          <p className="text-xs opacity-70 mt-1">Restart the backend server if you recently updated the code, then retry.</p>
          <button type="button" onClick={load} className="btn-outline !py-2 !px-3 text-sm mt-3">Retry</button>
        </DashCard>
      )}
      <DashCard className="!p-5 sm:!p-6">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <UserCog className="w-5 h-5 text-amber-500" /> Add Counsellor Account
        </h2>
        <p className="text-sm opacity-70 mb-5">
          Each counsellor gets their own login (email, phone, or Dreams ID + password) and access to the counsellor dashboard.
        </p>
        <form onSubmit={createCounsellor} className="grid sm:grid-cols-2 gap-4 max-w-3xl">
          <input type="text" className="input-field" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input type="email" className="input-field" placeholder="Login email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input type="tel" className="input-field" placeholder="Phone (optional login ID)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input type="text" className="input-field" placeholder="Password (min 6 characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          <button type="submit" disabled={saving} className="btn-primary sm:col-span-2 inline-flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> {saving ? 'Creating…' : 'Create counsellor login'}
          </button>
        </form>
      </DashCard>

      <DashCard className="!p-5 sm:!p-6">
        <h3 className="font-bold mb-2">Counsellor Logins ({counsellors.length})</h3>
        <p className="text-xs opacity-70 mb-4">
          Share each counsellor their email/phone and password. They sign in at the login page and land on the counsellor dashboard.
        </p>

        {counsellors.length === 0 ? (
          <p className="text-sm opacity-60">No counsellor accounts yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm admin-data-table min-w-[640px]">
              <thead>
                <tr className="border-b border-sand-200 dark:border-sand-700 text-left">
                  <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Dreams ID</th>
                  <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Name</th>
                  <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Login</th>
                  <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {counsellors.map((c) => (
                  <tr key={c.id} className="border-b border-sand-100 dark:border-sand-800/60 align-top">
                    {editingId === c.id ? (
                      <>
                        <td className="py-3 px-3"><CopyableUserId uid={c.user_uid} compact /></td>
                        <td className="py-3 px-3">
                          <input type="text" className="input-field !py-2 text-sm w-full" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                        </td>
                        <td className="py-3 px-3">
                          <div className="space-y-2 max-w-xs">
                            <input type="email" className="input-field !py-2 text-sm w-full" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                            <input type="tel" className="input-field !py-2 text-sm w-full" placeholder="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                            <input type="text" className="input-field !py-2 text-sm w-full" placeholder="New password (leave blank to keep)" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex flex-wrap gap-1.5 justify-end">
                            <button type="button" disabled={saving} onClick={saveEdit} className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white">Save</button>
                            <button type="button" onClick={cancelEdit} className="text-xs font-bold px-2 py-1.5 rounded-lg bg-sand-200 text-sand-700">Cancel</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-3"><CopyableUserId uid={c.user_uid} compact /></td>
                        <td className="py-3 px-3 font-semibold">{c.name}</td>
                        <td className="py-3 px-3 text-xs opacity-80">
                          {c.email && <p className="flex items-center gap-1"><Mail className="w-3 h-3 shrink-0" />{c.email}</p>}
                          {c.phone && <p className="flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3 shrink-0" />{c.phone}</p>}
                          <p className="flex items-center gap-1 mt-1 opacity-60"><KeyRound className="w-3 h-3" /> Password set by admin</p>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex flex-wrap gap-2 justify-end">
                            <button type="button" onClick={() => startEdit(c)} className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-amber-300 text-amber-800 inline-flex items-center gap-1">
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button type="button" disabled={deletingId === c.id} onClick={() => removeCounsellor(c)} className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-red-300 text-red-700 inline-flex items-center gap-1 disabled:opacity-50">
                              <Trash2 className="w-3.5 h-3.5" /> {deletingId === c.id ? 'Removing…' : 'Remove'}
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
  );
}
