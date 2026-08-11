import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2, Eye, ChevronUp, ChevronDown, Search, ExternalLink, Type } from 'lucide-react';
import AdminPanelHeader from '../AdminPanelHeader';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api';
import { DashCard } from '../DashboardUI';
import { CmsPreviewLink } from '../CmsPageSections';

const SITE_GROUPS = [
  { id: 'main', label: 'Main Site', slugs: ['home', 'about', 'contact'] },
  { id: 'counselling', label: 'Counselling', slugs: ['brain-mapping', 'skill-mapping', 'combo', 'counselling'] },
  { id: 'training', label: 'Training & CRP', slugs: ['crp', 'career-readiness'] },
  { id: 'explore', label: 'Explore', slugs: ['marketplace', 'careers', 'blog'] },
  { id: 'legal', label: 'Legal', slugs: ['terms', 'policies', 'privacy', 'refund'] },
];

const EMPTY_SECTION = { title: '', content: '', image: '' };

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildPreviewHtml(form, label) {
  const sections = (form.sections || [])
    .map((s) => `<section style="margin:1rem 0;padding:1rem;border:1px solid #fde68a;border-radius:12px;background:#fff">
      <h2 style="margin:0 0 .5rem;color:#b45309;font-size:1.1rem">${escapeHtml(s.title || 'Section')}</h2>
      ${s.image ? `<img src="${escapeHtml(s.image)}" style="max-width:100%;border-radius:8px;margin-bottom:.5rem" alt="" />` : ''}
      <p style="margin:0;color:#475569;white-space:pre-line">${escapeHtml(s.content || '')}</p>
    </section>`).join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;margin:0;padding:1.25rem;line-height:1.6;color:#334155}
  .hero{padding:1.5rem;border-radius:1rem;background:linear-gradient(135deg,#fffbeb,#fff);margin-bottom:1rem}
  .hero h1{margin:0 0 .35rem;font-size:1.5rem;color:#0f172a}.hero p{margin:0;color:#64748b}
  .intro{font-size:1.05rem;color:#475569;margin-bottom:1rem}</style></head><body>
  <div class="hero"><h1>${escapeHtml(form.heroTitle || label || '')}</h1><p>${escapeHtml(form.heroSubtitle || '')}</p></div>
  ${form.intro ? `<p class="intro">${escapeHtml(form.intro)}</p>` : ''}${sections}</body></html>`;
}

export default function AdminPageCatalogPanel({ onNotice, onError }) {
  const { token } = useAuth();
  const [pages, setPages] = useState([]);
  const [active, setActive] = useState('home');
  const [form, setForm] = useState({ heroTitle: '', heroSubtitle: '', heroImage: '', intro: '', sections: [] });
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const res = await adminApi.pageCatalog(token);
      setPages(res.pages || []);
    } catch (e) { onError?.(e.message); }
  }, [token, onError]);

  const loadPage = useCallback(async (slug) => {
    if (!token || !slug) return;
    try {
      const res = await adminApi.getPageCatalog(token, slug);
      const p = res.page || {};
      setForm({
        heroTitle: p.heroTitle || '',
        heroSubtitle: p.heroSubtitle || '',
        heroImage: p.heroImage || '',
        intro: p.intro || '',
        sections: p.sections?.length ? p.sections : [{ ...EMPTY_SECTION }],
      });
    } catch (e) { onError?.(e.message); }
  }, [token, onError]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (active) loadPage(active); }, [active, loadPage]);

  const pageMap = useMemo(() => Object.fromEntries(pages.map((p) => [p.slug, p])), [pages]);
  const page = pageMap[active];
  const previewDoc = useMemo(() => buildPreviewHtml(form, page?.label), [form, page]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SITE_GROUPS.map((g) => ({
      ...g,
      slugs: g.slugs.filter((slug) => {
        const p = pageMap[slug];
        if (!p) return false;
        if (!q) return true;
        return [p.label, p.route, slug].some((v) => String(v || '').toLowerCase().includes(q));
      }),
    })).filter((g) => g.slugs.length);
  }, [query, pageMap]);

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updatePageCatalog(token, active, form);
      onNotice?.('Saved — this copy is now live on the website');
      load();
    } catch (e) { onError?.(e.message); }
    finally { setSaving(false); }
  };

  const updateSection = (i, patch) => setForm((f) => ({
    ...f, sections: f.sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
  }));
  const moveSection = (i, dir) => setForm((f) => {
    const next = [...f.sections];
    const j = i + dir;
    if (j < 0 || j >= next.length) return f;
    [next[i], next[j]] = [next[j], next[i]];
    return { ...f, sections: next };
  });

  return (
    <div className="space-y-4 admin-copy-cms">
      <AdminPanelHeader
        title="Website Copy"
        subtitle="Pick a page, edit the text, save — it appears on the live website immediately."
      />

      <DashCard className="!p-3 bg-amber-50/70 border-amber-200">
        <p className="text-sm text-amber-950">
          This is the live website copy editor. Change the hero title, intro, or add/update sections for any page.
          After Save, visitors see your text on that page (and matching tabs) across the site.
        </p>
      </DashCard>

      <div className="admin-copy-cms__layout">
        <DashCard className="!p-3 admin-copy-cms__nav">
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
            <input
              className="input-field w-full !pl-9 !py-2"
              placeholder="Search pages…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="admin-copy-cms__list">
            {filteredGroups.map((g) => (
              <div key={g.id} className="mb-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-sand-500 px-1 mb-1">{g.label}</p>
                {g.slugs.map((slug) => {
                  const p = pageMap[slug];
                  if (!p) return null;
                  return (
                    <button
                      key={slug}
                      type="button"
                      className={`admin-copy-cms__page${active === slug ? ' is-active' : ''}`}
                      onClick={() => setActive(slug)}
                    >
                      <span className="font-bold text-sm block">{p.label}</span>
                      <span className="font-mono text-[11px] text-sand-500">{p.route}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </DashCard>

        <div className="admin-copy-cms__editor space-y-3">
          {page && (
            <DashCard className="!p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Type className="w-4 h-4" /> {page.label}
                  </h3>
                  <p className="text-xs text-sand-500 font-mono">{page.route}</p>
                </div>
                <CmsPreviewLink route={page.route} />
              </div>

              <div>
                <h4 className="font-bold text-sm mb-2">Hero copy (shows at the top of the page)</h4>
                <div className="grid sm:grid-cols-2 gap-2">
                  <label className="text-xs font-semibold text-sand-600 sm:col-span-2">
                    Page title
                    <input className="input-field mt-1" value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} />
                  </label>
                  <label className="text-xs font-semibold text-sand-600 sm:col-span-2">
                    Subtitle
                    <input className="input-field mt-1" value={form.heroSubtitle} onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })} />
                  </label>
                  <label className="text-xs font-semibold text-sand-600 sm:col-span-2">
                    Intro paragraph
                    <textarea className="input-field mt-1 w-full min-h-20" value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} />
                  </label>
                  <label className="text-xs font-semibold text-sand-600 sm:col-span-2">
                    Hero image URL (optional)
                    <input className="input-field mt-1" value={form.heroImage} onChange={(e) => setForm({ ...form, heroImage: e.target.value })} />
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm">Page sections (add, edit, or remove blocks)</h4>
                  <button type="button" className="btn-outline !py-1 !px-2 text-xs inline-flex gap-1" onClick={() => setForm((f) => ({ ...f, sections: [...f.sections, { ...EMPTY_SECTION }] }))}>
                    <Plus className="w-3.5 h-3.5" /> Add section
                  </button>
                </div>
                {form.sections.map((s, i) => (
                  <div key={i} className="border rounded-xl p-3 space-y-2 bg-sand-50/50">
                    <div className="flex gap-2">
                      <input className="input-field flex-1" placeholder="Section heading" value={s.title} onChange={(e) => updateSection(i, { title: e.target.value })} />
                      <button type="button" className="p-2 text-sand-500" onClick={() => moveSection(i, -1)} disabled={i === 0}><ChevronUp className="w-4 h-4" /></button>
                      <button type="button" className="p-2 text-sand-500" onClick={() => moveSection(i, 1)} disabled={i === form.sections.length - 1}><ChevronDown className="w-4 h-4" /></button>
                      <button type="button" className="p-2 text-red-600" onClick={() => setForm((f) => ({ ...f, sections: f.sections.filter((_, idx) => idx !== i) }))}><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <input className="input-field w-full" placeholder="Image URL (optional)" value={s.image || ''} onChange={(e) => updateSection(i, { image: e.target.value })} />
                    <textarea className="input-field w-full min-h-24" placeholder="Section text — this is what visitors read" value={s.content || ''} onChange={(e) => updateSection(i, { content: e.target.value })} />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={save} disabled={saving} className="btn-primary inline-flex items-center gap-2">
                  <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save & publish to website'}
                </button>
                <a href={page.route} target="_blank" rel="noreferrer" className="btn-outline inline-flex items-center gap-1 text-sm">
                  <ExternalLink className="w-3.5 h-3.5" /> Open live page
                </a>
              </div>
            </DashCard>
          )}

          <DashCard className="!p-0 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-amber-50/80">
              <span className="text-xs font-bold flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Copy preview</span>
            </div>
            <iframe title="Preview" className="admin-cms-editor__preview" srcDoc={previewDoc} />
          </DashCard>
        </div>
      </div>
    </div>
  );
}
