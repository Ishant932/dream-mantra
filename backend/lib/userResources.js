import { getData, saveData } from './database.js';
import { notifyUser } from './notifications.js';

export function ensureUserResources() {
  const data = getData();
  if (!Array.isArray(data.user_resources)) data.user_resources = [];
  if (!data.nextId.user_resources) data.nextId.user_resources = 1;
}

export function listResourcesForUser(userId) {
  ensureUserResources();
  const uid = Number(userId);
  const data = getData();
  const user = (data.users || []).find((u) => Number(u.id) === uid);
  const joined = user?.created_at || null;
  return (data.user_resources || [])
    .filter((r) => {
      if (r.all_users) {
        if (r.joined_from && joined && joined < r.joined_from) return false;
        if (r.joined_to && joined && joined > r.joined_to) return false;
        return true;
      }
      return (r.user_ids || []).some((id) => Number(id) === uid);
    })
    .map((r) => ({
      id: r.id,
      title: r.title,
      url: r.url,
      note: r.note || '',
      created_at: r.created_at,
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function listAllResources() {
  ensureUserResources();
  const data = getData();
  return [...(data.user_resources || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function createUserResource({ title, url, note, userIds = [], allUsers = false, adminId, joinedFrom = null, joinedTo = null }) {
  ensureUserResources();
  const data = getData();
  const row = {
    id: data.nextId.user_resources++,
    title: String(title || '').trim(),
    url: String(url || '').trim(),
    note: note ? String(note).trim() : '',
    user_ids: allUsers ? [] : userIds.map((id) => Number(id)).filter(Boolean),
    all_users: !!allUsers,
    joined_from: joinedFrom || null,
    joined_to: joinedTo || null,
    created_by: adminId,
    created_at: new Date().toISOString(),
  };
  if (!row.title || !row.url) throw new Error('Title and URL are required');
  data.user_resources.push(row);
  saveData();
  if (!allUsers) {
    for (const uid of row.user_ids) {
      notifyUser(uid, { type: 'resource', title: 'New resource shared', body: row.title, link: row.url });
    }
  }
  return row;
}

export function deleteUserResource(id) {
  ensureUserResources();
  const data = getData();
  const nid = Number(id);
  data.user_resources = (data.user_resources || []).filter((r) => Number(r.id) !== nid);
  saveData();
}
