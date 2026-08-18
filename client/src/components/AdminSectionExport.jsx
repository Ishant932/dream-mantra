import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { exportToCsv, exportToPdf } from '../utils/adminExport';

/**
 * Admin export controls — primary one-click CSV download.
 * Optional onFetchRows loads full dataset (e.g. all payments, not just current page).
 */
export default function AdminSectionExport({
  title,
  rows = [],
  columns = [],
  filename,
  disabled = false,
  onFetchRows,
}) {
  const [busy, setBusy] = useState(false);
  const safeName = (filename || title || 'export').replace(/\s+/g, '-').toLowerCase();

  if (!columns.length) return null;

  const canExport = !disabled && (rows.length > 0 || onFetchRows);

  const runCsv = async () => {
    if (!canExport || busy) return;
    setBusy(true);
    try {
      const exportRows = onFetchRows ? await onFetchRows() : rows;
      if (!exportRows?.length) return;
      exportToCsv(safeName, exportRows, columns);
    } finally {
      setBusy(false);
    }
  };

  const runPdf = async () => {
    if (!canExport || busy) return;
    setBusy(true);
    try {
      const exportRows = onFetchRows ? await onFetchRows() : rows;
      if (!exportRows?.length) return;
      exportToPdf(title, exportRows, columns);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={runCsv}
        disabled={!canExport || busy}
        className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 disabled:opacity-45 disabled:cursor-not-allowed"
        title="Download CSV (Excel)"
      >
        <Download className="w-4 h-4" />
        {busy ? 'Preparing…' : 'Download CSV'}
      </button>
      <button
        type="button"
        onClick={runPdf}
        disabled={!canExport || busy}
        className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-2 rounded-lg border border-sand-200 dark:border-sand-600 hover:bg-amber-50 dark:hover:bg-sand-800 disabled:opacity-45 disabled:cursor-not-allowed"
        title="Open printable PDF"
      >
        <FileText className="w-4 h-4 text-red-600" /> PDF
      </button>
    </div>
  );
}
