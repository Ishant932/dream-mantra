import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { userApi } from '../api';

export default function NotificationBell({ token, initialUnread = 0, onRefresh }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(initialUnread);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await userApi.notifications(token);
      setItems(data.notifications || []);
      setUnread(data.unread ?? 0);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    setUnread(initialUnread);
  }, [initialUnread]);

  useEffect(() => {
    if (!token) return undefined;
    load();
    const timer = window.setInterval(load, 45000);
    return () => window.clearInterval(timer);
  }, [token, load]);

  useEffect(() => {
    if (!open || !token) return;
    load();
  }, [open, token, load]);

  const markRead = async (id) => {
    try {
      const res = await userApi.markNotificationRead(token, id);
      setUnread(res.unread ?? 0);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      onRefresh?.();
    } catch {
      /* silent */
    }
  };

  const markAll = async () => {
    try {
      await userApi.markAllNotificationsRead(token);
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      onRefresh?.();
    } catch {
      /* silent */
    }
  };

  if (!token) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="dash-notif-btn"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && <span className="dash-notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <>
          <button type="button" className="dash-notif-backdrop" aria-label="Close notifications" onClick={() => setOpen(false)} />
          <div className="dash-notif-panel">
            <div className="dash-notif-panel__head">
              <h4 className="font-bold text-sm">Notifications</h4>
              {unread > 0 && (
                <button type="button" onClick={markAll} className="text-xs font-semibold text-amber-600 inline-flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>
            <div className="dash-notif-panel__body">
              {loading && <p className="text-sm dash-card-meta p-4">Loading…</p>}
              {!loading && items.length === 0 && (
                <p className="text-sm dash-card-meta p-6 text-center">No notifications yet.</p>
              )}
              {!loading && items.map((n) => (
                <div key={n.id} className={`dash-notif-item ${n.read ? 'dash-notif-item--read' : ''}`}>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm">{n.title}</p>
                    <p className="text-xs dash-card-meta mt-0.5">{n.body}</p>
                    <p className="text-[10px] dash-card-meta mt-1">
                      {new Date(n.created_at).toLocaleString('en-IN')}
                    </p>
                    {n.link && (
                      <Link to={n.link} onClick={() => setOpen(false)} className="text-xs font-semibold text-amber-600 mt-1 inline-block">
                        View →
                      </Link>
                    )}
                  </div>
                  {!n.read && (
                    <button type="button" onClick={() => markRead(n.id)} className="dash-notif-item__read" aria-label="Mark read">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
