import { useCallback, useEffect, useRef, useState } from 'react';
import { Layers, Plus, Pencil, Trash2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { adminApi } from '../api';
import { DEFAULT_COUNSELLING_ADDON } from '../data/moduleCatalog';
import { DashCard } from './DashboardUI';

const defaultAddonForm = {
  title: DEFAULT_COUNSELLING_ADDON.title,
  price: String(DEFAULT_COUNSELLING_ADDON.price),
  description: DEFAULT_COUNSELLING_ADDON.description,
};

const emptyForm = {
  slug: '',
  title: '',
  price: '',
  description: '',
  icon: '📋',
  optionalCounselling: false,
  includesCounselling: false,
  hidden: false,
  counsellingAddon: { ...defaultAddonForm },
};

export default function AdminModulesPanel({ token, onNotice, onError, onCatalogChange }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showAddonFields, setShowAddonFields] = useState(false);
  const onCatalogChangeRef = useRef(onCatalogChange);
  onCatalogChangeRef.current = onCatalogChange;

  const applyModules = useCallback((next) => {
    const list = next || [];
    setModules(list);
    onCatalogChangeRef.current?.(list);
  }, []);

  const load = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    try {
      const data = await adminApi.modules(token);
      applyModules(data.modules || []);
    } catch (e) {
      onError?.(e.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token, onError, applyModules]);

  useEffect(() => { load(); }, [load]);

  const startNew = () => {
    setEditing('new');
    setForm(emptyForm);
    setShowAddonFields(false);
  };

  const startEdit = (mod) => {
    const addon = mod.counsellingAddon || DEFAULT_COUNSELLING_ADDON;
    setEditing(mod.slug);
    setForm({
      slug: mod.slug,
      title: mod.title,
      price: String(mod.price ?? ''),
      description: mod.description || '',
      icon: mod.icon || '📋',
      optionalCounselling: !!mod.optionalCounselling,
      includesCounselling: !!mod.includesCounselling,
      hidden: !!mod.hidden,
      counsellingAddon: {
        title: addon.title || DEFAULT_COUNSELLING_ADDON.title,
        price: String(addon.price ?? DEFAULT_COUNSELLING_ADDON.price),
        description: addon.description || DEFAULT_COUNSELLING_ADDON.description,
      },
    });
    setShowAddonFields(!!mod.optionalCounselling);
  };

  const cancel = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowAddonFields(false);
  };

  const save = async (e) => {
    e?.preventDefault();
    setSaving(true);
    onError?.('');
    try {
      const body = {
        ...form,
        price: Number(form.price) || 0,
        slug: form.slug || undefined,
        counsellingAddon: form.optionalCounselling
          ? {
              title: form.counsellingAddon.title,
              price: Number(form.counsellingAddon.price) || DEFAULT_COUNSELLING_ADDON.price,
              description: form.counsellingAddon.description,
            }
          : undefined,
      };
      let res;
      if (editing === 'new') {
        res = await adminApi.createModule(token, body);
        onNotice?.('Module created');
      } else {
        res = await adminApi.updateModule(token, editing, body);
        onNotice?.('Module updated');
      }
      cancel();
      if (Array.isArray(res.modules) && res.modules.length) {
        applyModules(res.modules);
      } else {
        await load(true);
      }
    } catch (err) {
      onError?.(err.message || 'Could not save module');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (slug) => {
    if (!window.confirm('Remove or hide this module from checkout?')) return;
    onError?.('');
    try {
      const res = await adminApi.deleteModule(token, slug);
      onNotice?.('Module removed');
      if (Array.isArray(res.modules)) {
        applyModules(res.modules);
      } else {
        await load(true);
      }
    } catch (err) {
      onError?.(err.message || 'Could not remove module');
    }
  };

  const toggleOptionalCounselling = (checked) => {
    setForm((prev) => ({
      ...prev,
      optionalCounselling: checked,
      counsellingAddon: checked
        ? prev.counsellingAddon
        : { ...defaultAddonForm },
    }));
    setShowAddonFields(checked);
  };

  return (
    <div className="space-y-6">
      <DashCard className="!p-5 sm:!p-6" glow={false} hover={false}>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" /> Module Catalog
            </h2>
            <p className="text-sm opacity-70 mt-1">Changes save instantly and appear in the user dashboard &amp; website.</p>
          </div>
          {!editing && (
            <button type="button" onClick={startNew} className="btn-primary !py-2 !px-4 text-sm inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add module
            </button>
          )}
        </div>

        {editing && (
          <form onSubmit={save} className="mb-6 p-4 rounded-xl border border-amber-200/60 bg-amber-50/40 dark:bg-sand-900/40 space-y-3">
            <p className="text-sm font-bold">{editing === 'new' ? 'New module' : `Edit: ${editing}`}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <input className="input-field !py-2 text-sm" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <input className="input-field !py-2 text-sm" placeholder="Slug (auto if empty)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} disabled={editing !== 'new'} />
              <input type="number" min="0" className="input-field !py-2 text-sm" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              <input className="input-field !py-2 text-sm" placeholder="Icon (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              <input className="input-field !py-2 text-sm sm:col-span-2" placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.optionalCounselling}
                  onChange={(e) => toggleOptionalCounselling(e.target.checked)}
                />
                Optional counselling add-on
              </label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.includesCounselling} onChange={(e) => setForm({ ...form, includesCounselling: e.target.checked })} /> Includes counselling</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.hidden} onChange={(e) => setForm({ ...form, hidden: e.target.checked })} /> Hidden from catalog</label>
            </div>

            {form.optionalCounselling && (
              <div className="rounded-xl border border-amber-200/70 bg-white/60 dark:bg-stone-900/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAddonFields((v) => !v)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-left hover:bg-amber-50/80 dark:hover:bg-stone-800/50"
                >
                  <span>Counselling add-on details (title, price, description)</span>
                  {showAddonFields ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                </button>
                {showAddonFields && (
                  <div className="px-4 pb-4 pt-1 grid sm:grid-cols-2 gap-3 border-t border-amber-100 dark:border-stone-700">
                    <input
                      className="input-field !py-2 text-sm sm:col-span-2"
                      placeholder="Add-on title"
                      value={form.counsellingAddon.title}
                      onChange={(e) => setForm({ ...form, counsellingAddon: { ...form.counsellingAddon, title: e.target.value } })}
                      required
                    />
                    <input
                      type="number"
                      min="0"
                      className="input-field !py-2 text-sm"
                      placeholder="Add-on price (₹)"
                      value={form.counsellingAddon.price}
                      onChange={(e) => setForm({ ...form, counsellingAddon: { ...form.counsellingAddon, price: e.target.value } })}
                      required
                    />
                    <input
                      className="input-field !py-2 text-sm sm:col-span-2"
                      placeholder="Add-on description (shown at checkout)"
                      value={form.counsellingAddon.description}
                      onChange={(e) => setForm({ ...form, counsellingAddon: { ...form.counsellingAddon, description: e.target.value } })}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary !py-2 !px-4 text-sm inline-flex items-center gap-1">
                <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={cancel} className="btn-outline !py-2 !px-4 text-sm inline-flex items-center gap-1">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-sm opacity-60 py-6 text-center">Loading modules…</p>
        ) : modules.length === 0 ? (
          <p className="text-sm opacity-60 py-6 text-center">No modules in catalog. Click &quot;Add module&quot; to create one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm admin-data-table min-w-[640px]">
              <thead>
                <tr className="border-b border-sand-200 dark:border-sand-700 text-left">
                  <th className="py-2 px-2 font-semibold text-xs uppercase opacity-60">Module</th>
                  <th className="py-2 px-2 font-semibold text-xs uppercase opacity-60">Slug</th>
                  <th className="py-2 px-2 font-semibold text-xs uppercase opacity-60">Price</th>
                  <th className="py-2 px-2 font-semibold text-xs uppercase opacity-60">Counselling</th>
                  <th className="py-2 px-2 font-semibold text-xs uppercase opacity-60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((m) => (
                  <tr key={m.slug} className="border-b border-sand-100 dark:border-sand-800/60 align-top">
                    <td className="py-3 px-2">
                      <p className="font-semibold">{m.icon ? `${m.icon} ` : ''}{m.title}</p>
                      {m.description && <p className="text-xs opacity-60 mt-0.5">{m.description}</p>}
                      {m.hidden && <span className="text-xs text-red-600 font-semibold">Hidden</span>}
                    </td>
                    <td className="py-3 px-2 font-mono text-xs">{m.slug}</td>
                    <td className="py-3 px-2 font-semibold text-amber-700">₹{Number(m.price).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-2 text-xs">
                      {m.includesCounselling ? 'Included' : m.optionalCounselling ? (
                        <>
                          Optional add-on
                          {m.counsellingAddon && (
                            <p className="opacity-60 mt-0.5">{m.counsellingAddon.title} · ₹{Number(m.counsellingAddon.price).toLocaleString('en-IN')}</p>
                          )}
                        </>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => startEdit(m)} className="p-2 rounded-lg border hover:bg-amber-50" title="Edit"><Pencil className="w-4 h-4" /></button>
                        <button type="button" onClick={() => remove(m.slug)} className="p-2 rounded-lg border hover:bg-red-50 text-red-700" title="Remove"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashCard>
    </div>
  );
}
