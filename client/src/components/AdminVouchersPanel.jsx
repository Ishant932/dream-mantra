import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ticket, Plus, Pencil, Trash2, Save, X, Users, Eye, EyeOff } from 'lucide-react';
import { adminApi } from '../api';
import { DashCard } from './DashboardUI';
import AdminSectionExport from './AdminSectionExport';

const DISPLAY_MODES = {
  not_live: 'Not live — hidden from everyone',
  live_everyone: 'LIVE — visible to all signed-in users',
  live_selected: 'LIVE — selected users only (not visible to everyone)',
  live_hidden: 'LIVE — hidden from everyone (admin only)',
};

function voucherDisplayMode(v) {
  if (v.active === false) return 'not_live';
  if (v.visibility === 'hidden') return 'live_hidden';
  if (v.visibility === 'selected_users') return 'live_selected';
  return 'live_everyone';
}

function fieldsFromDisplayMode(mode, allowedUserIds = []) {
  if (mode === 'not_live') {
    return { active: false, visibility: 'everyone', allowedUserIds: [] };
  }
  if (mode === 'live_hidden') {
    return { active: true, visibility: 'hidden', allowedUserIds: [] };
  }
  if (mode === 'live_selected') {
    return { active: true, visibility: 'selected_users', allowedUserIds };
  }
  return { active: true, visibility: 'everyone', allowedUserIds: [] };
}

const emptyForm = {
  code: '',
  label: '',
  discountPercent: '',
  discountFixed: '',
  moduleSlugs: ['all'],
  displayMode: 'live_everyone',
  firstTimeOnly: false,
  startsAt: '',
  expiresAt: '',
  allowedUserIds: [],
};

function visibilityLabel(v, users = []) {
  if (v.active === false) return 'Not live';
  if (v.visibility === 'hidden') return 'Hidden from everyone (live, admin only)';
  if (v.visibility === 'selected_users') {
    const ids = v.allowedUserIds || [];
    const names = ids
      .map((id) => users.find((u) => u.id === id)?.name)
      .filter(Boolean)
      .slice(0, 3);
    return names.length ? `Selected: ${names.join(', ')}${ids.length > 3 ? ` +${ids.length - 3}` : ''}` : `Selected users (${ids.length})`;
  }
  return 'Everyone signed in';
}

function VoucherRow({ v, users, onEdit, onRemove, deletingCode }) {
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
          <button type="button" onClick={() => onEdit(v)} className="p-2 rounded-lg border"><Pencil className="w-4 h-4" /></button>
          <button type="button" onClick={() => onRemove(v.code)} disabled={deletingCode === v.code} className="p-2 rounded-lg border text-red-700 disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-0.5 rounded-full bg-sand-100 dark:bg-sand-800">{discount}</span>
        {v.live ? (
          <span className={`px-2 py-0.5 rounded-full font-semibold ${v.visibility === 'hidden' ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-800'}`}>
            {v.visibility === 'hidden' ? 'Live (hidden)' : 'Live'}
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Not live</span>
        )}
      </div>
      <p className="text-xs opacity-70">{visibilityLabel(v, users)}</p>
    </div>
  );
}

export default function AdminVouchersPanel({ token, modules = [], users = [], onNotice, onError }) {
  const [vouchers, setVouchers] = useState([]);
  const [moduleOptions, setModuleOptions] = useState(modules);
  const [allUsers, setAllUsers] = useState(users);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingCode, setDeletingCode] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [userSearch, setUserSearch] = useState('');

  const liveCount = useMemo(() => vouchers.filter((v) => v.live).length, [vouchers]);
  const studentUsers = useMemo(
    () => allUsers.filter((u) => u.role === 'user' || !u.role),
    [allUsers]
  );

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
  useEffect(() => { if (users.length) setAllUsers(users); }, [users]);

  useEffect(() => {
    if (modules.length) setModuleOptions(modules.filter((m) => !m.hidden));
  }, [modules]);

  useEffect(() => {
    if (!token || users.length) return;
    adminApi.users(token)
      .then((data) => setAllUsers(data.users || []))
      .catch(() => {});
  }, [token, users.length]);

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
    setUserSearch('');
  };

  const startEdit = (v) => {
    setEditing(v.code);
    setForm({
      code: v.code,
      label: v.label || '',
      discountPercent: v.discountPercent != null ? String(v.discountPercent) : '',
      discountFixed: v.discountFixed != null ? String(v.discountFixed) : '',
      moduleSlugs: v.moduleSlugs || ['all'],
      displayMode: voucherDisplayMode(v),
      firstTimeOnly: !!v.firstTimeOnly,
      startsAt: v.startsAt ? String(v.startsAt).slice(0, 10) : '',
      expiresAt: v.expiresAt ? String(v.expiresAt).slice(0, 10) : '',
      allowedUserIds: Array.isArray(v.allowedUserIds) ? v.allowedUserIds : [],
    });
    setUserSearch('');
  };

  const cancel = () => {
    setEditing(null);
    setForm(emptyForm);
    setUserSearch('');
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

  const toggleUser = (userId) => {
    const id = Number(userId);
    const has = form.allowedUserIds.includes(id);
    setForm({
      ...form,
      allowedUserIds: has
        ? form.allowedUserIds.filter((x) => x !== id)
        : [...form.allowedUserIds, id],
    });
  };

  const filteredPickerUsers = studentUsers.filter((u) => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name?.toLowerCase().includes(q)
      || u.email?.toLowerCase().includes(q)
      || String(u.id).includes(q)
      || u.user_uid?.toLowerCase().includes(q)
    );
  });

  const save = async (e) => {
    e?.preventDefault();
    setSaving(true);
    onError?.('');
    try {
      const modeFields = fieldsFromDisplayMode(form.displayMode, form.allowedUserIds);
      const body = {
        code: form.code,
        label: form.label,
        discountPercent: form.discountPercent !== '' ? Number(form.discountPercent) : null,
        discountFixed: form.discountFixed !== '' ? Number(form.discountFixed) : null,
        moduleSlugs: form.moduleSlugs,
        active: modeFields.active,
        firstTimeOnly: form.firstTimeOnly,
        startsAt: form.startsAt || null,
        expiresAt: form.expiresAt || null,
        visibility: modeFields.visibility,
        allowedUserIds: modeFields.allowedUserIds,
      };
      if (form.displayMode === 'live_selected' && !body.allowedUserIds.length) {
        throw new Error('Select at least one user for a LIVE private voucher.');
      }
      if (editing === 'new') {
        const res = await adminApi.createVoucher(token, body);
        onNotice?.(
          form.displayMode === 'live_hidden'
            ? 'Voucher saved as LIVE (hidden from everyone).'
            : body.active
              ? 'Voucher created and set live.'
              : 'Voucher saved as not live.'
        );
        setVouchers(res.vouchers || []);
      } else {
        const res = await adminApi.updateVoucher(token, editing, body);
        onNotice?.('Voucher updated.');
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
    if (!window.confirm(`Delete voucher ${code}?`)) return;
    setDeletingCode(code);
    onError?.('');
    try {
      const res = await adminApi.deleteVoucher(token, code);
      onNotice?.('Voucher removed.');
      setVouchers(res.vouchers || []);
      if (editing === code) cancel();
      await load();
    } catch (err) {
      onError?.(err.message);
    } finally {
      setDeletingCode(null);
    }
  };

  return (
    <DashCard className="!p-5 sm:!p-6" glow={false} hover={false}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amber-500" /> Vouchers & Discount Codes
          </h2>
          <p className="text-sm opacity-70 mt-1">
            {loading ? 'Loading…' : `${vouchers.length} total · ${liveCount} live · users only see vouchers assigned to them`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminSectionExport
            title="Vouchers"
            filename="vouchers"
            rows={vouchers}
            columns={[
              { label: 'Code', get: (v) => v.code },
              { label: 'Label', get: (v) => v.label },
              { label: 'Discount %', get: (v) => v.discountPercent },
              { label: 'Fixed ₹', get: (v) => v.discountFixed },
              { label: 'Visibility', get: (v) => v.visibility || 'everyone' },
              { label: 'Display mode', get: (v) => DISPLAY_MODES[voucherDisplayMode(v)] || v.visibility },
              { label: 'User IDs', get: (v) => (v.allowedUserIds || []).join('; ') },
              { label: 'Live', get: (v) => (v.live ? 'yes' : 'no') },
            ]}
          />
          {!editing && (
            <button type="button" onClick={startNew} className="btn-primary !py-2 !px-4 text-sm inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> New voucher
            </button>
          )}
        </div>
      </div>

      {editing && (
        <form onSubmit={save} className="mb-6 p-4 rounded-xl border border-amber-200/60 bg-amber-50/40 dark:bg-sand-900/40 space-y-4">
          <p className="text-sm font-bold">{editing === 'new' ? 'New voucher' : `Edit: ${editing}`}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input className="input-field !py-2 text-sm uppercase" placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required disabled={editing !== 'new'} />
            <input className="input-field !py-2 text-sm" placeholder="Label (shown to user)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-xs font-bold uppercase opacity-60 mb-1 block">Live status</label>
              <select
                className="input-field !py-2 text-sm w-full"
                value={form.displayMode}
                onChange={(e) => {
                  const displayMode = e.target.value;
                  setForm({
                    ...form,
                    displayMode,
                    allowedUserIds: displayMode === 'live_selected' ? form.allowedUserIds : [],
                  });
                }}
              >
                {Object.entries(DISPLAY_MODES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <p className="text-xs opacity-60 mt-1.5">
                {form.displayMode === 'live_hidden' && 'Voucher stays live in admin but is not shown or redeemable by any user until you change visibility.'}
                {form.displayMode === 'live_selected' && 'Only students you pick below will see and use this voucher.'}
                {form.displayMode === 'live_everyone' && 'All signed-in users can see this voucher when it is live.'}
                {form.displayMode === 'not_live' && 'Voucher is off — hidden from all users.'}
              </p>
            </div>
            <input type="number" min="0" max="100" className="input-field !py-2 text-sm" placeholder="Discount %" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value, discountFixed: e.target.value ? '' : form.discountFixed })} />
            <input type="number" min="0" className="input-field !py-2 text-sm" placeholder="Fixed discount (₹)" value={form.discountFixed} onChange={(e) => setForm({ ...form, discountFixed: e.target.value, discountPercent: e.target.value ? '' : form.discountPercent })} />
            <input type="date" className="input-field !py-2 text-sm" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} title="Available from" />
            <input type="date" className="input-field !py-2 text-sm" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} title="Expires on" />
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.firstTimeOnly} onChange={(e) => setForm({ ...form, firstTimeOnly: e.target.checked })} />
            First-time purchasers only
          </label>
          {form.displayMode === 'live_selected' && (
            <div className="rounded-xl border border-sand-200 p-3 bg-white/60 dark:bg-stone-900/30">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-amber-600" />
                <p className="text-xs font-bold uppercase opacity-60">Select users who will see this voucher</p>
              </div>
              <input
                className="input-field !py-2 text-sm w-full mb-2"
                placeholder="Search by name, email, or ID…"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <div className="max-h-40 overflow-y-auto space-y-1">
                {filteredPickerUsers.map((u) => (
                  <label key={u.id} className="flex items-center gap-2 text-sm py-1 px-2 rounded-lg hover:bg-sand-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.allowedUserIds.includes(u.id)}
                      onChange={() => toggleUser(u.id)}
                    />
                    <span className="font-semibold">{u.name}</span>
                    <span className="text-xs opacity-60">{u.email || `ID ${u.id}`}</span>
                  </label>
                ))}
                {!filteredPickerUsers.length && (
                  <p className="text-xs opacity-60 py-2">No students match your search.</p>
                )}
              </div>
              {form.allowedUserIds.length > 0 && (
                <p className="text-xs mt-2 text-emerald-700 font-semibold">{form.allowedUserIds.length} user(s) selected</p>
              )}
            </div>
          )}
          <div>
            <p className="text-xs font-bold uppercase opacity-60 mb-2">Applies to modules</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => toggleModule('all')} className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${form.moduleSlugs.includes('all') ? 'bg-amber-600 text-white border-amber-600' : ''}`}>All modules</button>
              {moduleOptions.map((m) => (
                <button key={m.slug} type="button" onClick={() => toggleModule(m.slug)} className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${form.moduleSlugs.includes(m.slug) ? 'bg-amber-600 text-white border-amber-600' : ''}`}>{m.title}</button>
              ))}
            </div>
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
              <VoucherRow key={v.code} v={v} users={studentUsers} onEdit={startEdit} onRemove={remove} deletingCode={deletingCode} />
            ))}
          </div>

          <div className="hidden sm:block overflow-x-auto admin-table-wrap">
            <table className="w-full text-sm admin-data-table min-w-[760px]">
              <thead>
                <tr className="border-b border-sand-200 dark:border-sand-700 text-left">
                  <th className="py-2 px-2 text-xs uppercase opacity-60">Code</th>
                  <th className="py-2 px-2 text-xs uppercase opacity-60">Discount</th>
                  <th className="py-2 px-2 text-xs uppercase opacity-60">Audience</th>
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
                    </td>
                    <td className="py-3 px-2">
                      {v.discountPercent != null ? `${v.discountPercent}% off` : v.discountFixed != null ? `₹${v.discountFixed} off` : '—'}
                    </td>
                    <td className="py-3 px-2 text-xs max-w-[180px]">{visibilityLabel(v, studentUsers)}</td>
                    <td className="py-3 px-2 text-xs">{(v.moduleSlugs || ['all']).join(', ')}</td>
                    <td className="py-3 px-2 text-xs">
                      <span className={`inline-flex items-center gap-1 font-semibold ${v.live ? 'text-emerald-700' : 'text-red-600'}`}>
                        {v.live ? (v.visibility === 'hidden' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />) : <EyeOff className="w-3.5 h-3.5" />}
                        {v.live ? (v.visibility === 'hidden' ? 'Live (hidden)' : 'Live') : 'Not live'}
                      </span>
                      {v.firstTimeOnly && <p className="opacity-60">First-time only</p>}
                      {v.startsAt && <p className="opacity-60">From {v.startsAt.slice(0, 10)}</p>}
                      {v.expiresAt && <p className="opacity-60">Until {v.expiresAt.slice(0, 10)}</p>}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => startEdit(v)} className="p-2 rounded-lg border"><Pencil className="w-4 h-4" /></button>
                        <button type="button" onClick={() => remove(v.code)} disabled={deletingCode === v.code} className="p-2 rounded-lg border text-red-700 disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                      </div>
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
