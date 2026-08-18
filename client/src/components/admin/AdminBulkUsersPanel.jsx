import { useCallback, useMemo, useState } from 'react';
import { Download, Upload, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api';
import { MODULE_CATALOG } from '../../data/moduleCatalog';
import { downloadText } from '../../utils/downloadFile';
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

const TARGET_OPTIONS = [
  { id: 'import', label: 'CSV import (new users)' },
  { id: 'selected', label: 'Selected users' },
  { id: 'filtered', label: 'Filtered list' },
  { id: 'all', label: 'All students' },
];

const PAYMENT_OPTIONS = [
  { id: 'none', label: 'Assign only — payment pending' },
  { id: 'admin', label: 'Admin approval — mark paid' },
  { id: 'razorpay', label: 'Razorpay — mark paid' },
];

export default function AdminBulkUsersPanel({
  onNotice,
  onError,
  selectedUserIds = [],
  filteredUserIds = [],
  totalUsers = 0,
  onClearSelection,
  catalogModules = [],
  onComplete,
}) {
  const { token } = useAuth();
  const [csvText, setCsvText] = useState('');
  const [moduleSlugs, setModuleSlugs] = useState([]);
  const [target, setTarget] = useState('import');
  const [paymentMode, setPaymentMode] = useState('none');
  const [importing, setImporting] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const preview = useMemo(() => parseCsv(csvText), [csvText]);
  const checkoutModules = useMemo(() => {
    const fromApi = (catalogModules || []).filter((m) => !m.hidden && !m.followUpOnly);
    return fromApi.length ? fromApi : MODULE_CATALOG.filter((m) => !m.followUpOnly);
  }, [catalogModules]);

  const targetCount = useMemo(() => {
    if (target === 'import') return preview.length;
    if (target === 'selected') return selectedUserIds.length;
    if (target === 'filtered') return filteredUserIds.length;
    if (target === 'all') return totalUsers;
    return 0;
  }, [target, preview.length, selectedUserIds.length, filteredUserIds.length, totalUsers]);

  const toggleModule = (slug) => {
    setModuleSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };

  const downloadTemplate = useCallback(async () => {
    try {
      const text = await adminApi.bulkUsersTemplate(token);
      if (!text || !String(text).trim()) {
        throw new Error('Template is empty');
      }
      downloadText(String(text).replace(/^\ufeff/, ''), 'dream-mantra-users-template.csv');
    } catch (e) {
      onError?.(e.message);
    }
  }, [token, onError]);

  const onFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCsvText(String(reader.result || ''));
      setTarget('import');
    };
    reader.readAsText(file);
  };

  const runImport = async () => {
    if (!token) return;
    if (!moduleSlugs.length) {
      onError?.('Select at least one program to assign');
      return;
    }
    if (!targetCount) {
      onError?.('No users in the selected target group');
      return;
    }
    setImporting(true);
    try {
      const body = {
        moduleSlugs,
        paymentMethod: paymentMode,
        approvePayments: paymentMode === 'admin',
      };
      if (target === 'import') body.csv = csvText;
      else if (target === 'all') body.applyToAll = true;
      else if (target === 'filtered') body.userIds = filteredUserIds;
      else body.userIds = selectedUserIds;

      const res = await adminApi.bulkImportUsers(token, body);
      setLastResult(res);
      onNotice?.(`Done: ${res.success}/${res.total} users · programs assigned`);
      onComplete?.(res);
      if (target === 'import' && res.results?.some((r) => r.password)) {
        setCsvText('');
      }
      if (target === 'selected') onClearSelection?.();
    } catch (e) {
      onError?.(e.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <DashCard className="space-y-4 admin-bulk-users">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold flex items-center gap-2"><Users className="w-5 h-5" /> Bulk users & programs</h3>
        <button type="button" className="btn-outline !py-1.5 !px-3 text-sm" onClick={downloadTemplate}>
          <Download className="w-4 h-4 inline" /> CSV template
        </button>
      </div>

      <p className="text-sm text-[var(--text-secondary)]">
        Import new users from CSV or assign programs to selected, filtered, or all students.
        Mark payments as done via admin approval or Razorpay.
      </p>

      <div>
        <p className="text-sm font-semibold mb-2">Apply to</p>
        <div className="flex flex-wrap gap-2">
          {TARGET_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${target === opt.id ? 'bg-amber-600 text-white border-amber-600' : ''}`}
              onClick={() => setTarget(opt.id)}
            >
              {opt.label}
              {opt.id === 'selected' && selectedUserIds.length ? ` (${selectedUserIds.length})` : ''}
              {opt.id === 'filtered' && filteredUserIds.length ? ` (${filteredUserIds.length})` : ''}
              {opt.id === 'all' && totalUsers ? ` (${totalUsers})` : ''}
            </button>
          ))}
        </div>
      </div>

      {target === 'import' && (
        <label className="block text-sm font-semibold">
          Upload CSV <span className="font-normal text-xs opacity-70">(name, email, phone, password)</span>
          <input type="file" accept=".csv,text/csv" className="input-field mt-1" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
      )}

      {target === 'selected' && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-amber-800 font-semibold">{selectedUserIds.length} user(s) selected</span>
          {onClearSelection && (
            <button type="button" className="text-amber-700 underline" onClick={onClearSelection}>Clear</button>
          )}
        </div>
      )}

      {targetCount > 0 && (
        <p className="text-xs text-emerald-700 font-semibold">{targetCount} user(s) will receive selected programs</p>
      )}

      <div>
        <p className="text-sm font-semibold mb-2">Programs to assign</p>
        <div className="flex flex-wrap gap-2">
          {checkoutModules.map((m) => (
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

      <div>
        <p className="text-sm font-semibold mb-2">Payment status</p>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${paymentMode === opt.id ? 'bg-emerald-700 text-white border-emerald-700' : ''}`}
              onClick={() => setPaymentMode(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button type="button" className="btn-primary inline-flex items-center gap-2" disabled={importing} onClick={runImport}>
        <Upload className="w-4 h-4" />
        {importing ? 'Processing…' : 'Run bulk assign'}
      </button>

      {lastResult?.results?.length > 0 && (
        <div className="text-xs space-y-1 max-h-48 overflow-y-auto border rounded-lg p-2 bg-sand-50">
          {lastResult.results.map((r, i) => (
            <p key={i} className={r.ok ? 'text-emerald-800' : 'text-red-700'}>
              {r.ok
                ? `${r.name} — ID ${r.dreamsId || r.userId}${r.password ? ` · temp password: ${r.password}` : ''}${r.modules?.length ? ` · ${r.modules.length} module(s)` : ''}`
                : `${r.name}: ${r.error}`}
            </p>
          ))}
        </div>
      )}
    </DashCard>
  );
}
