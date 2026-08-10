import { useState, useEffect } from 'react';
import { Link2, Trash2, Users } from 'lucide-react';
import { adminApi } from '../../api';
import { DashCard } from '../DashboardUI';

export default function AdminResourceLinksPanel({ token, users = [], onNotice, onError }) {
  const [resources, setResources] = useState([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [allUsers, setAllUsers] = useState(false);
  const [joinedFrom, setJoinedFrom] = useState('');
  const [joinedTo, setJoinedTo] = useState('');
  const [userIds, setUserIds] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = () => {
    adminApi.resources(token).then((r) => setResources(r.resources || [])).catch((e) => onError?.(e.message));
  };

  useEffect(() => { if (token) load(); }, [token]);

  const toggleUser = (id) => {
    setUserIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createResource(token, { title, url, note, allUsers, userIds, joinedFrom: joinedFrom || null, joinedTo: joinedTo || null });
      setTitle(''); setUrl(''); setNote(''); setUserIds([]); setAllUsers(false); setJoinedFrom(''); setJoinedTo('');
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
        <form onSubmit={submit} className="space-y-3 max-w-xl">
          <input className="input-field w-full" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input className="input-field w-full" type="url" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} required />
          <textarea className="input-field w-full min-h-20" placeholder="Optional note" value={note} onChange={(e) => setNote(e.target.value)} />
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={allUsers} onChange={(e) => setAllUsers(e.target.checked)} /> All users
          </label>
          {allUsers && (
            <div className="grid sm:grid-cols-2 gap-3 p-3 border rounded-xl bg-sand-50/80">
              <label className="text-xs font-bold">
                Joined from
                <input type="date" className="input-field !py-2 mt-1 w-full" value={joinedFrom} onChange={(e) => setJoinedFrom(e.target.value)} />
              </label>
              <label className="text-xs font-bold">
                Joined until
                <input type="date" className="input-field !py-2 mt-1 w-full" value={joinedTo} onChange={(e) => setJoinedTo(e.target.value)} />
              </label>
              <p className="text-xs opacity-70 sm:col-span-2">Only users who signed up in this date range will see this resource.</p>
            </div>
          )}
          {!allUsers && (
            <div className="border rounded-xl p-3 max-h-40 overflow-y-auto space-y-1">
              <p className="text-xs font-bold flex items-center gap-1 mb-2"><Users className="w-3 h-3" /> Select users</p>
              {users.filter((u) => u.role === 'user' || !u.role || u.role === 'student').map((u) => (
                <label key={u.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={userIds.includes(u.id)} onChange={() => toggleUser(u.id)} />
                  {u.name || u.email} ({u.user_uid})
                </label>
              ))}
            </div>
          )}
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Sending…' : 'Send resource'}</button>
        </form>
      </DashCard>
      <DashCard className="!p-5">
        <h4 className="font-bold mb-3">Sent resources</h4>
        <div className="space-y-2">
          {resources.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-2 border rounded-lg p-3 text-sm">
              <div><p className="font-semibold">{r.title}</p><a href={r.url} className="text-amber-700 break-all">{r.url}</a>
                {r.all_users && (r.joined_from || r.joined_to) && (
                  <p className="text-xs opacity-60 mt-1">Cohort: {r.joined_from || '…'} → {r.joined_to || '…'}</p>
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
