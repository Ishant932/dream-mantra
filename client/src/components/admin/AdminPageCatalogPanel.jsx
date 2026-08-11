import { useCallback, useEffect, useMemo, useState } from 'react';
import { Save, Search, Type } from 'lucide-react';
import AdminPanelHeader from '../AdminPanelHeader';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api';
import { DashCard } from '../DashboardUI';
import { siteEn } from '../../i18n/site.en';
import { flattenStrings } from '../../i18n/flatten';

const GROUPS = [
  { id: 'hero', label: 'Homepage hero', prefix: 'hero' },
  { id: 'nav', label: 'Navigation', prefix: 'nav' },
  { id: 'navMega', label: 'Menus', prefix: 'navMega' },
  { id: 'home', label: 'Homepage body', prefix: 'home' },
  { id: 'dmit', label: 'Brain Mapping', prefix: 'pages.dmit' },
  { id: 'psycho', label: 'Skill Mapping', prefix: 'pages.psychometric' },
  { id: 'combo', label: 'Brain + Skill', prefix: 'pages.dmitPsychometric' },
  { id: 'counselling', label: 'Counselling hub', prefix: 'pages.counselling' },
  { id: 'crp', label: 'Training & Placement', prefix: 'pages.crp' },
  { id: 'marketplace', label: 'Book Now', prefix: 'pages.marketplace' },
  { id: 'about', label: 'About', prefix: 'about' },
  { id: 'contact', label: 'Contact', prefix: 'pages.contact' },
  { id: 'footer', label: 'Footer', prefix: 'footer' },
  { id: 'auth', label: 'Login / Signup', prefix: 'auth' },
  { id: 'other', label: 'All other copy', prefix: '' },
];

export default function AdminPageCatalogPanel({ onNotice, onError }) {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('hero');
  const [savedPatches, setSavedPatches] = useState({});
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() => flattenStrings(siteEn), []);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const res = await adminApi.copyOverrides(token);
      const en = res.patches?.en || {};
      setSavedPatches(en);
      setDraft(en);
    } catch (e) { onError?.(e.message); }
  }, [token, onError]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const g = GROUPS.find((x) => x.id === group);
    return rows.filter((row) => {
      if (g?.prefix && !row.path.startsWith(g.prefix)) return false;
      if (g?.id === 'other' && GROUPS.some((x) => x.prefix && row.path.startsWith(x.prefix))) return false;
      if (!q) return true;
      return row.path.toLowerCase().includes(q) || String(row.value).toLowerCase().includes(q) || String(draft[row.path] || '').toLowerCase().includes(q);
    }).slice(0, 80);
  }, [rows, query, group, draft]);

  const dirtyCount = useMemo(
    () => Object.keys(draft).filter((k) => draft[k] !== (savedPatches[k] || '') && draft[k] !== undefined).length,
    [draft, savedPatches],
  );

  const save = async () => {
    setSaving(true);
    try {
      const patches = { ...draft };
      for (const [k, v] of Object.entries(savedPatches)) {
        if (!(k in patches)) patches[k] = '';
      }
      await adminApi.updateCopyOverrides(token, { lang: 'en', patches });
      onNotice?.('Website text saved — refresh any open page to see it live');
      await load();
    } catch (e) { onError?.(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4 admin-copy-cms">
      <AdminPanelHeader
        title="Website text"
        subtitle="Search any line on the live site, edit it, and save. Changes apply across the website."
      />

      <DashCard className="!p-3 bg-amber-50/70 border-amber-200">
        <p className="text-sm text-amber-950">
          This is the live copy of the website. Pick a section or search for a sentence you see on a page, change it, then Save.
          Visitors see the new text immediately after a refresh.
        </p>
      </DashCard>

      <div className="flex flex-wrap gap-2">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`dash-subtab-rail__chip${group === g.id ? ' is-active' : ''}`}
            onClick={() => setGroup(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="relative max-w-xl">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
        <input
          className="input-field w-full !pl-9"
          placeholder="Search website text — e.g. Brain Mapping, Book now, hero…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <DashCard className="!p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-amber-50/80">
          <span className="text-xs font-bold flex items-center gap-1">
            <Type className="w-3.5 h-3.5" /> {filtered.length} text lines
          </span>
          <button type="button" onClick={save} disabled={saving} className="btn-primary !py-1.5 !px-3 text-xs inline-flex items-center gap-1">
            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : dirtyCount ? `Save ${dirtyCount} change${dirtyCount === 1 ? '' : 's'}` : 'Save'}
          </button>
        </div>
        <div className="divide-y max-h-[70vh] overflow-y-auto">
          {filtered.map((row) => {
            const current = draft[row.path] ?? row.value;
            const changed = draft[row.path] != null && draft[row.path] !== row.value;
            return (
              <label key={row.path} className="block px-4 py-3 hover:bg-amber-50/40">
                <span className="block text-[11px] font-mono text-sand-500 mb-1">{row.path}</span>
                <textarea
                  className={`input-field w-full min-h-[3.2rem] text-sm${changed ? ' ring-1 ring-amber-400' : ''}`}
                  value={current}
                  onChange={(e) => setDraft((d) => ({ ...d, [row.path]: e.target.value }))}
                />
              </label>
            );
          })}
          {!filtered.length && (
            <p className="px-4 py-8 text-sm text-sand-500 text-center">No matching text. Try another search.</p>
          )}
        </div>
      </DashCard>
    </div>
  );
}
