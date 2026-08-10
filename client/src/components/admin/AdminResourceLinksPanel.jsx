import { useState, useEffect, useMemo } from 'react';
import { Link2, Trash2, Users, Search } from 'lucide-react';
import { adminApi } from '../../api';
import { DashCard } from '../DashboardUI';
import { MODULE_CATALOG } from '../../data/moduleCatalog';

const TIMEFRAMES = [
  { id: 'all', label: 'All time' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
  { id: 'custom', label: 'Custom dates' },
];

function startDateForTimeframe(tf) {
  if (tf === '7d') return new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  if (tf === '30d') return new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  if (tf === '90d') return new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10);
  return '';
}

export default function AdminResourceLinksPanel({ token, users = [], payments = [], onNotice, onError }) {
  const [resources, setResources] = useState([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [allUsers, setAllUsers] = useState(false);
  const [timeframe, setTimeframe] = useState('all');
  const [joinedFrom, setJoinedFrom] = useState('');
  const [joinedTo, setJoinedTo] = useState('');
  const [programSlug, setProgramSlug] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userIds, setUserIds] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = () => {
    adminApi.resources(token).then((r) => setResources(r.resources || [])).catch((e) => onError?.(e.message));
  };

  useEffect(() => { if (token) load(); }, [token]);

  const paidByUser = useMemo(() => {
    const map = new Map();
    for (const p of payments) {
      const uid = Number(p.user_id);
      const slug = p.product_slug || p.module_slug;
      if (!uid || !slug) continue;
      if (!map.has(uid)) map.set(uid, new Set());
      map.get(uid).add(slug);
    }
    return map;
  }, [payments]);

  const studentUsers = useMemo(
    () => users.filter((u) => u.role === 'user' || !u.role || u.role === 'student'),
    [users]
  );

  const effectiveFrom = timeframe === 'custom' ? joinedFrom : startDateForTimeframe(timeframe);
  const effectiveTo = timeframe === 'custom' ? joinedTo : '';

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return studentUsers.filter((u) => {
      if (q) {
        const hay = `${u.name || ''} ${u.email || ''} ${u.phone || ''} ${u.user_uid || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (effectiveFrom && u.created_at && u.created_at.slice(0, 10) < effectiveFrom) return false;
      if (effectiveTo && u.created_at && u.created_at.slice(0, 10) > effectiveTo) return false;
      if (programSlug) {
        const owned = paidByUser.get(Number(u.id));
        if (!owned?.has(programSlug)) return false;
      }
      return true;
    });
  }, [studentUsers, userSearch, effectiveFrom, effectiveTo, programSlug, paidByUser]);

  const toggleUser = (id) => {
    setUserIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const selectAllFiltered = () => setUserIds(filteredUsers.map((u) => u.id));
  const clearSelection = () => setUserIds([]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        url,
        note,
        allUsers,
        userIds: allUsers ? [] : userIds,
        joinedFrom: allUsers && effectiveFrom ? effectiveFrom : null,
        joinedTo: allUsers && effectiveTo ? effectiveTo : null,
        programSlug: allUsers && programSlug ? programSlug : null,
      };
      await adminApi.createResource(token, payload);
      setTitle(''); setUrl(''); setNote(''); setUserIds([]); setAllUsers(false);
      setTimeframe('all'); setJoinedFrom(''); setJoinedTo(''); setProgramSlug(''); setUserSearch('');
      onNotice?.('Resource shared with users');
      load();
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await adminApi.deleteResource(token, id);
      load();
    } catch (err) {
      onError?.(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <DashCard className="!p-5">
        <h3 className="font-bold flex items-center gap-2 mb-3"><Link2 className="w-5 h-5 text-amber-500" /> Share resource links</h3>
        <form onSubmit={submit} className="space-y-3 max-w-2xl">
          <input className="input-field w-full" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input className="input-field w-full" type="url" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} required />
          <textarea className="input-field w-full min-h-20" placeholder="Optional note" value={note} onChange={(e) => setNote(e.target.value)} />

          <div className="grid sm:grid-cols-2 gap-3 p-3 border rounded-xl bg-sand-50/80">
            <label className="text-xs font-bold sm:col-span-2">
              Timeframe
              <select className="input-field !py-2 mt-1 w-full" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                {TIMEFRAMES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </label>
            {timeframe === 'custom' && (
              <>
                <label className="text-xs font-bold">
                  Joined from
                  <input type="date" className="input-field !py-2 mt-1 w-full" value={joinedFrom} onChange={(e) => setJoinedFrom(e.target.value)} />
                </label>
                <label className="text-xs font-bold">
                  Joined until
                  <input type="date" className="input-field !py-2 mt-1 w-full" value={joinedTo} onChange={(e) => setJoinedTo(e.target.value)} />
                </label>
              </>
            )}
            <label className="text-xs font-bold sm:col-span-2">
              Program
              <select className="input-field !py-2 mt-1 w-full" value={programSlug} onChange={(e) => setProgramSlug(e.target.value)}>
                <option value="">All programs</option>
                {MODULE_CATALOG.map((m) => <option key={m.slug} value={m.slug}>{m.title}</option>)}
              </select>
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={allUsers} onChange={(e) => setAllUsers(e.target.checked)} />
            Send to all users matching filters above
          </label>

          {!allUsers && (
            <div className="border rounded-xl p-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <p className="text-xs font-bold flex items-center gap-1"><Users className="w-3 h-3" /> Select users ({filteredUsers.length})</p>
                <div className="flex gap-2">
                  <button type="button" className="text-xs font-semibold text-amber-800" onClick={selectAllFiltered}>Select all</button>
                  <button type="button" className="text-xs font-semibold opacity-60" onClick={clearSelection}>Clear</button>
                </div>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  className="input-field w-full !pl-9 !py-2"
                  placeholder="Search name, email, phone, ID…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredUsers.map((u) => (
                  <label key={u.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={userIds.includes(u.id)} onChange={() => toggleUser(u.id)} />
                    {u.name || u.email} ({u.user_uid})
                  </label>
                ))}
                {!filteredUsers.length && <p className="text-xs opacity-60 py-2">No users match your filters.</p>}
              </div>
            </div>
          )}

          <button type="submit" disabled={saving || (!allUsers && !userIds.length)} className="btn-primary">
            {saving ? 'Sending…' : 'Send resource'}
          </button>
        </form>
      </DashCard>
      <DashCard className="!p-5">
        <h4 className="font-bold mb-3">Sent resources</h4>
        <div className="space-y-2">
          {resources.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-2 border rounded-lg p-3 text-sm">
              <div>
                <p className="font-semibold">{r.title}</p>
                <a href={r.url} className="text-amber-700 break-all">{r.url}</a>
                {r.all_users && (
                  <p className="text-xs opacity-60 mt-1">
                    Cohort: {r.joined_from || '…'} → {r.joined_to || '…'}
                    {r.program_slug ? ` · ${r.program_slug}` : ''}
                  </p>
                )}
              </div>
              <button type="button" className="text-red-600" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </DashCard>
    </div>
  );
}
