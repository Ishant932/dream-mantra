import { useCallback, useMemo, useState } from 'react';
import { Download, Upload, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api';
import { MODULE_CATALOG } from '../../data/moduleCatalog';
import { DashCard } from '../DashboardUI';

function parseCsv(text) {
  const lines = String(text || '').trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const hasHeader = header.includes('name');
  const start = hasHeader ? 1 : 0;
  const idx = {
    name: header.indexOf('name'),
    email: header.indexOf('email'),
    phone: Math.max(header.indexOf('phone'), header.indexOf('mobile')),
    password: header.indexOf('password'),
  };
  return lines.slice(start).map((line) => {
    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    return {
      name: cols[idx.name >= 0 ? idx.name : 0] || '',
      email: cols[idx.email >= 0 ? idx.email : 1] || '',
      phone: cols[idx.phone >= 0 ? idx.phone : 2] || '',
      password: cols[idx.password >= 0 ? idx.password : 3] || '',
    };
  }).filter((r) => r.name || r.email || r.phone);
}

export default function AdminBulkUsersPanel({ onNotice, onError, selectedUserIds = [], onComplete }) {
  const { token } = useAuth();
  const [csvText, setCsvText] = useState('');
  const [moduleSlugs, setModuleSlugs] = useState([]);
  const [approvePayments, setApprovePayments] = useState(false);
  const [importing, setImporting] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const preview = useMemo(() => parseCsv(csvText), [csvText]);

  const toggleModule = (slug) => {
    setModuleSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };

  const downloadTemplate = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users/bulk-template', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dream-mantra-users-template.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      onError?.(e.message);
    }
  }, [token, onError]);

  const onFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCsvText(String(reader.result || ''));
    reader.readAsText(file);
  };

  const runImport = async () => {
    if (!token) return;
    if (!preview.length && !selectedUserIds.length) {
      onError?.('Upload a CSV or select users first');
      return;
    }
    setImporting(true);
    try {
      const res = await adminApi.bulkImportUsers(token, {
        csv: preview.length ? csvText : undefined,
        userIds: selectedUserIds.length ? selectedUserIds : undefined,
        moduleSlugs,
        approvePayments,
      });
      setLastResult(res);
      onNotice?.(`Imported ${res.success}/${res.total} users`);
      onComplete?.(res);
      if (res.results?.some((r) => r.password)) {
        setCsvText('');
      }
    } catch (e) {
      onError?.(e.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <DashCard className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold flex items-center gap-2"><Users className="w-5 h-5" /> Bulk users & programs</h3>
        <button type="button" className="btn-outline !py-1.5 !px-3 text-sm" onClick={downloadTemplate}>
          <Download className="w-4 h-4 inline" /> CSV template
        </button>
      </div>

      <p className="text-sm text-[var(--text-secondary)]">
        Upload CSV: <code>name,email,phone,password</code>. Password is optional — we generate one if blank.
        Select programs to assign; enable admin approval to mark payment as done instantly.
      </p>

      <label className="block text-sm font-semibold">
        Upload CSV
        <input type="file" accept=".csv,text/csv" className="input-field mt-1" onChange={(e) => onFile(e.target.files?.[0])} />
      </label>

      {preview.length > 0 && (
        <p className="text-xs text-emerald-700">{preview.length} row(s) ready to import</p>
      )}

      {selectedUserIds.length > 0 && (
        <p className="text-xs text-amber-800">Will apply programs to {selectedUserIds.length} selected user(s)</p>
      )}

      <div>
        <p className="text-sm font-semibold mb-2">Programs to assign</p>
        <div className="flex flex-wrap gap-2">
          {MODULE_CATALOG.filter((m) => !m.followUpOnly).map((m) => (
            <button
              key={m.slug}
              type="button"
              className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${moduleSlugs.includes(m.slug) ? 'bg-amber-600 text-white border-amber-600' : ''}`}
              onClick={() => toggleModule(m.slug)}
            >
              {m.title}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={approvePayments} onChange={(e) => setApprovePayments(e.target.checked)} />
        Admin approval — mark payment as done for assigned programs
      </label>

      <button type="button" className="btn-primary inline-flex items-center gap-2" disabled={importing} onClick={runImport}>
        <Upload className="w-4 h-4" />
        {importing ? 'Importing…' : 'Import users & assign programs'}
      </button>

      {lastResult?.results?.length > 0 && (
        <div className="text-xs space-y-1 max-h-40 overflow-y-auto border rounded-lg p-2 bg-sand-50">
          {lastResult.results.map((r, i) => (
            <p key={i} className={r.ok ? 'text-emerald-800' : 'text-red-700'}>
              {r.ok
                ? `${r.name} — ID ${r.dreamsId || r.userId}${r.password ? ` · temp password: ${r.password}` : ''}`
                : `${r.name}: ${r.error}`}
            </p>
          ))}
        </div>
      )}
    </DashCard>
  );
}
