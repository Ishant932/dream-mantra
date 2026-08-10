import { useState } from 'react';
import { Calendar, Plus, Trash2, Save } from 'lucide-react';
import { adminApi } from '../../api';
import { DashCard } from '../DashboardUI';

function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(val) {
  if (!val) return null;
  return new Date(val).toISOString();
}

function formatRange(start, end) {
  const fmt = (iso) => iso ? new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }) : '—';
  return `${fmt(start)} → ${fmt(end)}`;
}

const emptyForm = {
  title: '', description: '', url: '', start_at: '', end_at: '',
  user_registered_from: '', user_registered_to: '', active: true,
};

function toDateInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fromDateInput(val) {
  if (!val) return null;
  return new Date(`${val}T00:00:00`).toISOString();
}

function formatRegRange(from, to) {
  const fmt = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { dateStyle: 'medium', timeZone: 'Asia/Kolkata' }) : '—';
  if (!from && !to) return null;
  return `Registered ${fmt(from)} → ${fmt(to)}`;
}

export default function AdminCommunitySchedulePanel({ token, schedule = [], onReload, onNotice, onError }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const reset = () => { setForm(emptyForm); setEditingId(null); };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setForm({
      title: entry.title || '',
      description: entry.description || '',
      url: entry.url || '',
      start_at: toLocalInput(entry.start_at),
      end_at: toLocalInput(entry.end_at),
      user_registered_from: toDateInput(entry.user_registered_from),
      user_registered_to: toDateInput(entry.user_registered_to),
      active: entry.active !== false,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) {
      onError?.('Title and link URL are required');
      return;
    }
    setSaving(true);
    try {
      await adminApi.saveCommunitySchedule(token, {
        id: editingId || undefined,
        product_slug: 'crp-test',
        title: form.title.trim(),
        description: form.description.trim(),
        url: form.url.trim(),
        start_at: fromLocalInput(form.start_at),
        end_at: fromLocalInput(form.end_at),
        user_registered_from: fromDateInput(form.user_registered_from),
        user_registered_to: fromDateInput(form.user_registered_to),
        active: form.active,
      });
      onNotice?.(editingId ? 'Community link updated' : 'Community link added');
      reset();
      await onReload?.();
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this community link entry?')) return;
    try {
      await adminApi.deleteCommunitySchedule(token, id);
      onNotice?.('Entry deleted');
      if (editingId === id) reset();
      await onReload?.();
    } catch (err) {
      onError?.(err.message);
    }
  };

  const sorted = [...schedule].sort((a, b) => (new Date(b.start_at || 0) - new Date(a.start_at || 0)));

  return (
    <div className="space-y-4">
      <DashCard className="!p-5" glow={false} hover={false}>
        <h2 className="text-lg font-bold flex items-center gap-2 mb-1">
          <Calendar className="w-5 h-5 text-amber-500" /> AI Career Launchpad Community
        </h2>
        <p className="text-sm opacity-70 mb-4">
          Add date-wise community links. The active link for the current date/time is shown to students after payment.
        </p>
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold block mb-1">Title</label>
              <input className="input-field w-full" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Jan 2026 Batch Community" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold block mb-1">Community link</label>
              <input type="url" className="input-field w-full" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://chat.whatsapp.com/..." />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold block mb-1">Details (optional)</label>
              <textarea className="input-field w-full min-h-[72px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Instructions for students…" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">Active from</label>
              <input type="datetime-local" className="input-field w-full" value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">Active until</label>
              <input type="datetime-local" className="input-field w-full" value={form.end_at} onChange={(e) => setForm({ ...form, end_at: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">User registered from</label>
              <input type="date" className="input-field w-full" value={form.user_registered_from} onChange={(e) => setForm({ ...form, user_registered_from: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">User registered until</label>
              <input type="date" className="input-field w-full" value={form.user_registered_to} onChange={(e) => setForm({ ...form, user_registered_to: e.target.value })} />
            </div>
          </div>
          <p className="text-xs opacity-60">Optional: show this link only to users who registered between the two dates above.</p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Active
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : editingId ? 'Update link' : 'Add link'}
            </button>
            {editingId && <button type="button" className="btn-outline" onClick={reset}>Cancel</button>}
            {!editingId && <button type="button" className="btn-outline inline-flex items-center gap-1" onClick={() => setForm(emptyForm)}><Plus className="w-4 h-4" /> New</button>}
          </div>
        </form>
      </DashCard>

      <div className="space-y-2">
        {sorted.length === 0 && <p className="text-sm opacity-60">No scheduled community links yet.</p>}
        {sorted.map((entry) => (
          <DashCard key={entry.id} className="!p-4 !overflow-visible" glow={false} hover={false}>
            <div className="admin-settings-row">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-bold">{entry.title}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${entry.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-sand-200'}`}>
                    {entry.active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs opacity-60 mb-1">{formatRange(entry.start_at, entry.end_at)}</p>
                {formatRegRange(entry.user_registered_from, entry.user_registered_to) && (
                  <p className="text-xs text-amber-700 mb-1">{formatRegRange(entry.user_registered_from, entry.user_registered_to)}</p>
                )}
                {entry.description && <p className="text-sm opacity-80 mb-1">{entry.description}</p>}
                <a href={entry.url} target="_blank" rel="noreferrer" className="text-sm text-amber-700 underline break-all">{entry.url}</a>
              </div>
              <div className="admin-settings-row__actions">
                <button type="button" className="btn-outline !py-1.5 !px-3 text-sm" onClick={() => startEdit(entry)}>Edit</button>
                <button type="button" className="btn-outline !py-1.5 !px-3 text-sm text-red-700" onClick={() => handleDelete(entry.id)}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </DashCard>
        ))}
      </div>
    </div>
  );
}
