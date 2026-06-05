import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ticket, Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { adminApi } from '../api';
import { DashCard } from './DashboardUI';

const emptyForm = {
  code: '',
  label: '',
  discountPercent: '',
  discountFixed: '',
  moduleSlugs: ['all'],
  active: true,
  firstTimeOnly: false,
  expiresAt: '',
};

function VoucherRow({ v, onEdit, onRemove }) {
  const isSystem = v.source === 'system';
  const discount = v.discountPercent != null
    ? `${v.discountPercent}% off`
    : v.discountFixed != null
      ? `₹${v.discountFixed} off`
      : '—';

  return (
    <div className="rounded-xl border border-sand-200 dark:border-sand-700 p-4 space-y-2 sm:hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono font-bold">{v.code}</p>
          <p className="text-xs opacity-60">{v.label}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          {!isSystem && (
            <>
              <button type="button" onClick={() => onEdit(v)} className="p-2 rounded-lg border"><Pencil className="w-4 h-4" /></button>
              <button type="button" onClick={() => onRemove(v.code)} className="p-2 rounded-lg border text-red-700"><Trash2 className="w-4 h-4" /></button>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-0.5 rounded-full bg-sand-100 dark:bg-sand-800">{discount}</span>
        {v.live ? (
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">Live on site</span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Not live</span>
        )}
        {isSystem && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">Built-in</span>}
      </div>
      <p className="text-xs opacity-70">Modules: {(v.moduleSlugs || ['all']).join(', ')}</p>
    </div>
  );
}

export default function AdminVouchersPanel({ token, modules = [], onNotice, onError }) {
  const [vouchers, setVouchers] = useState([]);
  const [moduleOptions, setModuleOptions] = useState(modules);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const liveCount = useMemo(() => vouchers.filter((v) => v.live).length, [vouchers]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminApi.vouchers(token);
      setVouchers(data.vouchers || []);
    } catch (e) {
      onError?.(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, onError]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (modules.length) setModuleOptions(modules.filter((m) => !m.hidden));
  }, [modules]);

  useEffect(() => {
    if (!token) return;
    adminApi.modules(token)
      .then((data) => {
        const list = (data.modules || []).filter((m) => !m.hidden);
        if (list.length) setModuleOptions(list);
      })
      .catch(() => {});
  }, [token]);

  const startNew = () => {
    setEditing('new');
    setForm(emptyForm);
  };

  const startEdit = (v) => {
    if (v.source === 'system') {
      onError?.('Built-in vouchers are managed in code. Create a custom voucher with the same code to override it.');
      return;
    }
    setEditing(v.code);
    setForm({
      code: v.code,
      label: v.label || '',
      discountPercent: v.discountPercent != null ? String(v.discountPercent) : '',
      discountFixed: v.discountFixed != null ? String(v.discountFixed) : '',
      moduleSlugs: v.moduleSlugs || ['all'],
      active: v.active !== false,
      firstTimeOnly: !!v.firstTimeOnly,
      expiresAt: v.expiresAt ? v.expiresAt.slice(0, 10) : '',
    });
  };

  const cancel = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const toggleModule = (slug) => {
    if (slug === 'all') {
      setForm({ ...form, moduleSlugs: ['all'] });
      return;
    }
    const current = form.moduleSlugs.includes('all') ? [] : [...form.moduleSlugs];
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
    setForm({ ...form, moduleSlugs: next.length ? next : ['all'] });
  };

  const save = async (e) => {
    e?.preventDefault();
    setSaving(true);
    onError?.('');
    try {
      const body = {
        code: form.code,
        label: form.label,
        discountPercent: form.discountPercent !== '' ? Number(form.discountPercent) : null,
        discountFixed: form.discountFixed !== '' ? Number(form.discountFixed) : null,
        moduleSlugs: form.moduleSlugs,
        active: form.active,
        firstTimeOnly: form.firstTimeOnly,
        expiresAt: form.expiresAt || null,
      };
      if (editing === 'new') {
        const res = await adminApi.createVoucher(token, body);
        onNotice?.('Voucher created');
        setVouchers(res.vouchers || []);
      } else {
        const res = await adminApi.updateVoucher(token, editing, body);
        onNotice?.('Voucher updated');
        setVouchers(res.vouchers || []);
      }
      cancel();
      await load();
    } catch (err) {
      onError?.(err.message || 'Could not save voucher');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (code) => {
    const voucher = vouchers.find((v) => v.code === code);
    if (voucher?.source === 'system') {
      onError?.('Built-in vouchers cannot be deleted.');
      return;
    }
    if (!window.confirm(`Delete voucher ${code}?`)) return;
    try {
      await adminApi.deleteVoucher(token, code);
      onNotice?.('Voucher deleted');
      await load();
    } catch (err) {
      onError?.(err.message);
    }
  };

  return (
    <DashCard className="!p-5 sm:!p-6" glow={false} hover={false}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amber-500" /> Vouchers & Discount Codes
          </h2>
          <p className="text-sm opacity-70 mt-1">
            {loading ? 'Loading…' : `${vouchers.length} total · ${liveCount} live on site`}
          </p>
        </div>
        {!editing && (
          <button type="button" onClick={startNew} className="btn-primary !py-2 !px-4 text-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> New voucher
          </button>
        )}
      </div>

      {editing && (
        <form onSubmit={save} className="mb-6 p-4 rounded-xl border border-amber-200/60 bg-amber-50/40 dark:bg-sand-900/40 space-y-3">
          <p className="text-sm font-bold">{editing === 'new' ? 'New voucher' : `Edit: ${editing}`}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="input-field !py-2 text-sm uppercase" placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required disabled={editing !== 'new'} />
            <input className="input-field !py-2 text-sm" placeholder="Label (shown to user)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            <input type="number" min="0" max="100" className="input-field !py-2 text-sm" placeholder="Discount %" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value, discountFixed: e.target.value ? '' : form.discountFixed })} />
            <input type="number" min="0" className="input-field !py-2 text-sm" placeholder="Fixed discount (₹)" value={form.discountFixed} onChange={(e) => setForm({ ...form, discountFixed: e.target.value, discountPercent: e.target.value ? '' : form.discountPercent })} />
            <input type="date" className="input-field !py-2 text-sm" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase opacity-60 mb-2">Applies to modules</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => toggleModule('all')} className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${form.moduleSlugs.includes('all') ? 'bg-amber-600 text-white border-amber-600' : ''}`}>All modules</button>
              {moduleOptions.map((m) => (
                <button key={m.slug} type="button" onClick={() => toggleModule(m.slug)} className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${form.moduleSlugs.includes(m.slug) ? 'bg-amber-600 text-white border-amber-600' : ''}`}>{m.title}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.firstTimeOnly} onChange={(e) => setForm({ ...form, firstTimeOnly: e.target.checked })} /> First-time users only</label>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary !py-2 !px-4 text-sm inline-flex items-center gap-1"><Save className="w-4 h-4" /> Save</button>
            <button type="button" onClick={cancel} className="btn-outline !py-2 !px-4 text-sm inline-flex items-center gap-1"><X className="w-4 h-4" /> Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm opacity-60 py-6 text-center">Loading vouchers…</p>
      ) : vouchers.length === 0 ? (
        <p className="text-sm opacity-60 py-6 text-center">No vouchers yet. Create one above.</p>
      ) : (
        <>
          <div className="space-y-3 sm:hidden">
            {vouchers.map((v) => (
              <VoucherRow key={v.code} v={v} onEdit={startEdit} onRemove={remove} />
            ))}
          </div>

          <div className="hidden sm:block overflow-x-auto admin-table-wrap">
            <table className="w-full text-sm admin-data-table min-w-[640px]">
              <thead>
                <tr className="border-b border-sand-200 dark:border-sand-700 text-left">
                  <th className="py-2 px-2 text-xs uppercase opacity-60">Code</th>
                  <th className="py-2 px-2 text-xs uppercase opacity-60">Discount</th>
                  <th className="py-2 px-2 text-xs uppercase opacity-60">Modules</th>
                  <th className="py-2 px-2 text-xs uppercase opacity-60">Status</th>
                  <th className="py-2 px-2 text-xs uppercase opacity-60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((v) => (
                  <tr key={v.code} className="border-b border-sand-100 dark:border-sand-800/60">
                    <td className="py-3 px-2">
                      <p className="font-mono font-bold">{v.code}</p>
                      <p className="text-xs opacity-60">{v.label}</p>
                      {v.source === 'system' && <p className="text-xs text-amber-700 font-semibold mt-0.5">Built-in offer</p>}
                    </td>
                    <td className="py-3 px-2">
                      {v.discountPercent != null ? `${v.discountPercent}% off` : v.discountFixed != null ? `₹${v.discountFixed} off` : '—'}
                    </td>
                    <td className="py-3 px-2 text-xs">{(v.moduleSlugs || ['all']).join(', ')}</td>
                    <td className="py-3 px-2 text-xs">
                      {v.live ? (
                        <span className="text-emerald-700 font-semibold">Live on site</span>
                      ) : (
                        <span className="text-red-600 font-semibold">Not live</span>
                      )}
                      {v.active === false && <p className="opacity-60">Inactive</p>}
                      {v.firstTimeOnly && <p className="opacity-60">First-time only</p>}
                      {v.expiresAt && <p className="opacity-60">Expires {v.expiresAt.slice(0, 10)}</p>}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {v.source !== 'system' ? (
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => startEdit(v)} className="p-2 rounded-lg border"><Pencil className="w-4 h-4" /></button>
                          <button type="button" onClick={() => remove(v.code)} className="p-2 rounded-lg border text-red-700"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <span className="text-xs opacity-50">Read-only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashCard>
  );
}
