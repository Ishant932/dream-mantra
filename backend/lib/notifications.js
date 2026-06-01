import { getData, saveData } from './database.js';

function ensureNotifications() {
  const data = getData();
  if (!data.user_notifications) data.user_notifications = [];
  if (!data.nextId.user_notifications) data.nextId.user_notifications = 1;
}

export function notifyUser(userId, { type, title, body, link = null, meta = {} }) {
  ensureNotifications();
  const data = getData();
  const id = data.nextId.user_notifications++;
  const row = {
    id,
    user_id: Number(userId),
    type: type || 'info',
    title: String(title || '').slice(0, 200),
    body: String(body || '').slice(0, 500),
    link,
    meta,
    read: false,
    created_at: new Date().toISOString(),
  };
  data.user_notifications.unshift(row);
  saveData();
  return row;
}

export function listNotificationsForUser(userId, { limit = 50 } = {}) {
  ensureNotifications();
  return (getData().user_notifications || [])
    .filter((n) => n.user_id === Number(userId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
}

export function countUnreadNotifications(userId) {
  ensureNotifications();
  return (getData().user_notifications || []).filter(
    (n) => n.user_id === Number(userId) && !n.read
  ).length;
}

export function markNotificationRead(userId, notificationId) {
  ensureNotifications();
  const data = getData();
  const row = data.user_notifications.find(
    (n) => n.id === Number(notificationId) && n.user_id === Number(userId)
  );
  if (!row) return null;
  row.read = true;
  row.read_at = new Date().toISOString();
  saveData();
  return row;
}

export function markAllNotificationsRead(userId) {
  ensureNotifications();
  const data = getData();
  const now = new Date().toISOString();
  let count = 0;
  for (const n of data.user_notifications || []) {
    if (n.user_id === Number(userId) && !n.read) {
      n.read = true;
      n.read_at = now;
      count += 1;
    }
  }
  if (count) saveData();
  return count;
}
