import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { downloadUserRecord } from '../utils/userExport';

export default function UserDownloadMenu({
  api,
  token,
  user,
  onError,
  compact = false,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user?.id) return null;

  const run = async (format) => {
    setLoading(true);
    setOpen(false);
    try {
      await downloadUserRecord({
        api,
        token,
        userId: user.id,
        listUser: user,
        format,
      });
    } catch (err) {
      onError?.(err.message || 'Could not download user record');
    } finally {
      setLoading(false);
    }
  };

  const btnClass = compact
    ? 'h-9 w-9 rounded-xl inline-flex items-center justify-center border border-sand-200 dark:border-sand-600 hover:bg-amber-50 dark:hover:bg-sand-800 disabled:opacity-50'
    : 'text-sm font-bold px-3 py-2 rounded-lg border border-sand-200 dark:border-sand-600 hover:bg-amber-50 dark:hover:bg-sand-800 inline-flex items-center gap-1.5 disabled:opacity-50';

  return (
    <div className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        disabled={loading}
        onClick={() => setOpen((o) => !o)}
        className={btnClass}
        title="Download this user's information"
        aria-label="Download user information"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {!compact && <span>Download</span>}
      </button>
      {open && !loading && (
        <>
          <button type="button" className="fixed inset-0 z-40" aria-label="Close" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 min-w-[150px] rounded-xl border border-sand-200 dark:border-sand-700 bg-[var(--bg-elevated)] shadow-lg py-1">
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 dark:hover:bg-sand-800 flex items-center gap-2"
              onClick={() => run('csv')}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Excel (CSV)
            </button>
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 dark:hover:bg-sand-800 flex items-center gap-2"
              onClick={() => run('pdf')}
            >
              <FileText className="w-4 h-4 text-red-600" /> PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
