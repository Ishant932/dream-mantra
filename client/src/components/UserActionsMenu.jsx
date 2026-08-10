import { useState, useEffect, useRef } from 'react';
import { MoreVertical, Ban, Trash2, Eye, FileSpreadsheet, FileText, Loader2, KeyRound } from 'lucide-react';
import { downloadUserRecord } from '../utils/userExport';

export default function UserActionsMenu({
  user,
  api,
  token,
  onView,
  onSuspend,
  onUnsuspend,
  onDelete,
  onResetPassword,
  onError,
  allowAccountActions = false,
  actionBusy = false,
  suspended = false,
}) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  if (!user?.id) return null;

  const runDownload = async (format) => {
    setDownloading(true);
    setOpen(false);
    try {
      await downloadUserRecord({ api, token, userId: user.id, listUser: user, format });
    } catch (err) {
      onError?.(err.message || 'Could not download user record');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        disabled={actionBusy || downloading}
        onClick={() => setOpen((o) => !o)}
        className="h-9 w-9 rounded-xl inline-flex items-center justify-center border border-sand-200 dark:border-sand-600 hover:bg-amber-50 dark:hover:bg-sand-800 disabled:opacity-50"
        title="User actions"
        aria-label="User actions menu"
        aria-expanded={open}
      >
        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[11rem] py-1 rounded-xl border border-sand-200 dark:border-sand-600 bg-[var(--bg-elevated)] shadow-xl">
          <button
            type="button"
            className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 dark:hover:bg-sand-800 inline-flex items-center gap-2"
            onClick={() => { setOpen(false); onView?.(user.id); }}
          >
            <Eye className="w-3.5 h-3.5" /> View profile
          </button>
          <button
            type="button"
            className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 dark:hover:bg-sand-800 inline-flex items-center gap-2"
            onClick={() => runDownload('csv')}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Download CSV
          </button>
          <button
            type="button"
            className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 dark:hover:bg-sand-800 inline-flex items-center gap-2"
            onClick={() => runDownload('pdf')}
          >
            <FileText className="w-3.5 h-3.5 text-red-600" /> Download PDF
          </button>
          {allowAccountActions && (
            <>
              <div className="border-t border-sand-100 dark:border-sand-700 my-1" />
              <button
                type="button"
                disabled={actionBusy}
                className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 dark:hover:bg-sand-800 inline-flex items-center gap-2 disabled:opacity-50"
                onClick={() => { setOpen(false); onResetPassword?.(user); }}
              >
                <KeyRound className="w-3.5 h-3.5" /> Reset password
              </button>
              {suspended ? (
                <button
                  type="button"
                  disabled={actionBusy}
                  className="w-full text-left px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 inline-flex items-center gap-2 disabled:opacity-50"
                  onClick={() => { setOpen(false); onUnsuspend?.(user.id); }}
                >
                  <Ban className="w-3.5 h-3.5" /> Unsuspend
                </button>
              ) : (
                <button
                  type="button"
                  disabled={actionBusy}
                  className="w-full text-left px-3 py-2 text-sm text-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 inline-flex items-center gap-2 disabled:opacity-50"
                  onClick={() => { setOpen(false); onSuspend?.(user); }}
                >
                  <Ban className="w-3.5 h-3.5" /> Suspend user
                </button>
              )}
              <button
                type="button"
                disabled={actionBusy}
                className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 inline-flex items-center gap-2 disabled:opacity-50"
                onClick={() => { setOpen(false); onDelete?.(user); }}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete user
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
