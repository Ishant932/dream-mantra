/** CSV (Excel-compatible) and printable PDF export for admin panels */
import { downloadBlob } from './downloadFile';

function escapeCsv(val) {
  const s = val == null ? '' : String(val);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportToCsv(filename, rows, columns) {
  const header = columns.map((c) => escapeCsv(c.label)).join(',');
  const body = rows.map((row) =>
    columns.map((c) => escapeCsv(typeof c.get === 'function' ? c.get(row) : row[c.key])).join(',')
  );
  const csv = [header, ...body].join('\r\n');
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportToPdf(title, rows, columns) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;padding:24px;font-size:12px}h1{font-size:18px;margin-bottom:16px}
table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
th{background:#f5f5f5;font-size:11px;text-transform:uppercase}</style></head><body>
<h1>${title}</h1><p>Exported ${new Date().toLocaleString('en-IN')}</p>
<table><thead><tr>${columns.map((c) => `<th>${c.label}</th>`).join('')}</tr></thead><tbody>
${rows.map((row) => `<tr>${columns.map((c) => {
  const v = typeof c.get === 'function' ? c.get(row) : row[c.key];
  return `<td>${String(v ?? '').replace(/</g, '&lt;')}</td>`;
}).join('')}</tr>`).join('')}
</tbody></table></body></html>`;
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}
