import { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToCsv, exportToPdf } from '../utils/adminExport';

export default function AdminSectionExport({ title, rows = [], columns = [], filename }) {
  const [open, setOpen] = useState(false);
  const safeName = (filename || title || 'export').replace(/\s+/g, '-').toLowerCase();

  if (!rows.length || !columns.length) return null;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-sand-200 dark:border-sand-600 hover:bg-amber-50 dark:hover:bg-sand-800"
        title="Download section data"
      >
        <Download className="w-4 h-4" /> Export
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40" aria-label="Close" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 min-w-[150px] rounded-xl border border-sand-200 dark:border-sand-700 bg-[var(--bg-elevated)] shadow-lg py-1">
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 dark:hover:bg-sand-800 flex items-center gap-2"
              onClick={() => { exportToCsv(safeName, rows, columns); setOpen(false); }}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Excel (CSV)
            </button>
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 dark:hover:bg-sand-800 flex items-center gap-2"
              onClick={() => { exportToPdf(title, rows, columns); setOpen(false); }}
            >
              <FileText className="w-4 h-4 text-red-600" /> PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
