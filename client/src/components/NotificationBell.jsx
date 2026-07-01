import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, AlertCircle } from 'lucide-react';
import { userApi } from '../api';

function usePanelPosition(open, anchorRef) {
  const [style, setStyle] = useState(null);

  const update = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.min(22 * 16, window.innerWidth - 16);
    let left = rect.right - width;
    if (left < 8) left = 8;
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
    const top = rect.bottom + 8;
    const maxHeight = Math.min(20 * 16, window.innerHeight - top - 12);
    setStyle({ top, left, width, maxHeight });
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) {
      setStyle(null);
      return undefined;
    }
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, update]);

  return style;
}

export default function NotificationBell({
  token,
  initialUnread = 0,
  onRefresh,
  onDark = false,
  compact = false,
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(initialUnread);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const btnRef = useRef(null);
  const panelStyle = usePanelPosition(open, btnRef);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await userApi.notifications(token);
      setItems(data.notifications || []);
      setUnread(data.unread ?? 0);
    } catch (err) {
      setError(err.message || 'Could not load notifications');
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
    if (!open || !token) return undefined;
    load();
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
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

  const panel = open && panelStyle && createPortal(
    <>
      <button
        type="button"
        className="dash-notif-backdrop"
        aria-label="Close notifications"
        onClick={() => setOpen(false)}
      />
      <div
        className="dash-notif-panel dash-notif-panel--dropdown"
        style={{
          top: panelStyle.top,
          left: panelStyle.left,
          width: panelStyle.width,
        }}
        role="dialog"
        aria-label="Notifications"
      >
        <div className="dash-notif-panel__head">
          <h4 className="dash-notif-panel__title">Notifications</h4>
          {unread > 0 && (
            <button type="button" onClick={markAll} className="dash-notif-panel__mark-all">
              <CheckCheck className="w-3.5 h-3.5" aria-hidden />
              Mark all read
            </button>
          )}
        </div>
        <div
          className="dash-notif-panel__body"
          style={{ maxHeight: panelStyle.maxHeight }}
        >
          {loading && <p className="dash-notif-panel__empty">Loading…</p>}
          {!loading && error && (
            <div className="dash-notif-panel__error">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="text-sm">{error}</p>
              <button type="button" onClick={load} className="text-xs font-semibold text-amber-600 mt-1">
                Retry
              </button>
            </div>
          )}
          {!loading && !error && items.length === 0 && (
            <p className="dash-notif-panel__empty">No notifications yet.</p>
          )}
          {!loading && !error && items.map((n) => (
            <div key={n.id} className={`dash-notif-item ${n.read ? 'dash-notif-item--read' : ''}`}>
              <div className="min-w-0 flex-1">
                <p className="dash-notif-item__title">{n.title}</p>
                {n.body && <p className="dash-notif-item__body">{n.body}</p>}
                <p className="dash-notif-item__time">
                  {new Date(n.created_at).toLocaleString('en-IN')}
                </p>
                {n.link && (
                  <Link
                    to={n.link}
                    onClick={() => setOpen(false)}
                    className="dash-notif-item__link"
                  >
                    View →
                  </Link>
                )}
              </div>
              {!n.read && (
                <button
                  type="button"
                  onClick={() => markRead(n.id)}
                  className="dash-notif-item__read"
                  aria-label="Mark read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>,
    document.body,
  );

  return (
    <div className={`dash-notif-wrap${compact ? ' dash-notif-wrap--compact' : ''}`}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`dash-notif-btn${onDark ? ' dash-notif-btn--on-dark' : ''}${open ? ' dash-notif-btn--open' : ''}`}
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="dash-notif-badge" aria-hidden>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {panel}
    </div>
  );
}
