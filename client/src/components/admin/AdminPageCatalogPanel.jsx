import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2, Map, FileText, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import AdminPanelHeader from '../AdminPanelHeader';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api';
import { DashCard } from '../DashboardUI';
import { CmsPreviewLink } from '../CmsPageSections';

const SITE_GROUPS = [
  { id: 'main', label: 'Main Site', icon: '🏠', slugs: ['home', 'about', 'contact'] },
  { id: 'counselling', label: 'Counselling', icon: '🧠', slugs: ['brain-mapping', 'skill-mapping', 'combo', 'counselling'] },
  { id: 'training', label: 'Training', icon: '🚀', slugs: ['crp', 'career-readiness'] },
  { id: 'explore', label: 'Explore & Book', icon: '📚', slugs: ['marketplace', 'careers', 'blog'] },
  { id: 'legal', label: 'Legal', icon: '📜', slugs: ['terms', 'policies', 'privacy', 'refund'] },
];

const EMPTY_SECTION = { title: '', content: '', image: '' };

function buildPreviewHtml(form, label) {
  const sections = (form.sections || [])
    .map((s) => `<section style="margin:1rem 0;padding:1rem;border:1px solid #fde68a;border-radius:12px;background:#fff">
      <h2 style="margin:0 0 .5rem;color:#b45309;font-size:1.1rem">${s.title || 'Section'}</h2>
      ${s.image ? `<img src="${s.image}" style="max-width:100%;border-radius:8px;margin-bottom:.5rem" alt="" />` : ''}
      <p style="margin:0;color:#475569;white-space:pre-line">${s.content || ''}</p>
    </section>`).join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;margin:0;padding:1.25rem;line-height:1.6;color:#334155}
  .hero{padding:1.5rem;border-radius:1rem;background:linear-gradient(135deg,#fffbeb,#fff);margin-bottom:1rem;text-align:center}
  .hero h1{margin:0 0 .35rem;font-size:1.6rem;color:#0f172a}.hero p{margin:0;color:#64748b}
  .intro{font-size:1.05rem;color:#475569;margin-bottom:1rem;text-align:center}</style></head><body>
  <div class="hero"><h1>${form.heroTitle || label || ''}</h1><p>${form.heroSubtitle || ''}</p></div>
  ${form.intro ? `<p class="intro">${form.intro}</p>` : ''}${sections}</body></html>`;
}

export default function AdminPageCatalogPanel({ onNotice, onError }) {
  const { token } = useAuth();
  const [pages, setPages] = useState([]);
  const [active, setActive] = useState('home');
  const [form, setForm] = useState({ heroTitle: '', heroSubtitle: '', heroImage: '', intro: '', sections: [] });
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('map');

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
        sections: p.sections?.length ? p.sections : [],
      });
    } catch (e) { onError?.(e.message); }
  }, [token, onError]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (active) loadPage(active); }, [active, loadPage]);

  const pageMap = useMemo(() => Object.fromEntries(pages.map((p) => [p.slug, p])), [pages]);
  const page = pageMap[active];
  const previewDoc = useMemo(() => buildPreviewHtml(form, page?.label), [form, page]);

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updatePageCatalog(token, active, form);
      onNotice?.('Page saved — live site updated');
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
    <div className="space-y-4 admin-site-map">
      <AdminPanelHeader title="Site Pages CMS" subtitle="Edit hero, titles & every section — changes go live instantly." />

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setView('map')} className={`subtab-btn ${view === 'map' ? 'active' : ''}`}>
          <Map className="w-3.5 h-3.5 inline mr-1" /> Site map
        </button>
        {page && view === 'edit' && (
          <span className="text-sm font-bold text-amber-800 self-center">Editing: {page.label}</span>
        )}
      </div>

      {view === 'map' && SITE_GROUPS.map((g) => (
        <div key={g.id} className="admin-site-map__group">
          <h3 className="admin-site-map__group-title"><span>{g.icon}</span> {g.label}</h3>
          <div className="admin-site-map__grid">
            {g.slugs.map((slug) => {
              const p = pageMap[slug];
              if (!p) return null;
              return (
                <button key={slug} type="button" className={`admin-site-map__card${active === slug ? ' is-active' : ''}`}
                  onClick={() => { setActive(slug); setView('edit'); }}>
                  <p className="font-bold text-sm">{p.label}</p>
                  <p className="admin-site-map__card-route">{p.route}</p>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {view === 'edit' && page && (
        <div className="admin-cms-editor">
          <DashCard className="!p-0 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-amber-50/80">
              <span className="text-xs font-bold flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Preview</span>
              <CmsPreviewLink route={page.route} />
            </div>
            <iframe title="Preview" className="admin-cms-editor__preview" srcDoc={previewDoc} />
          </DashCard>

          <DashCard className="!p-4 space-y-4">
            <div>
              <h4 className="font-bold text-sm mb-2">Hero</h4>
              <div className="grid sm:grid-cols-2 gap-2">
                <input className="input-field" placeholder="Page title" value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} />
                <input className="input-field" placeholder="Subtitle" value={form.heroSubtitle} onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })} />
                <input className="input-field sm:col-span-2" placeholder="Hero image URL" value={form.heroImage} onChange={(e) => setForm({ ...form, heroImage: e.target.value })} />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-2">Intro paragraph</h4>
              <textarea className="input-field w-full min-h-20" value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm">Page sections</h4>
                <button type="button" className="btn-outline !py-1 !px-2 text-xs inline-flex gap-1" onClick={() => setForm((f) => ({ ...f, sections: [...f.sections, { ...EMPTY_SECTION }] }))}>
                  <Plus className="w-3.5 h-3.5" /> Add section
                </button>
              </div>
              {form.sections.map((s, i) => (
                <div key={i} className="border rounded-xl p-3 space-y-2 bg-sand-50/50">
                  <div className="flex gap-2">
                    <input className="input-field flex-1" placeholder="Section title" value={s.title} onChange={(e) => updateSection(i, { title: e.target.value })} />
                    <button type="button" className="p-2 text-sand-500" onClick={() => moveSection(i, -1)} disabled={i === 0}><ChevronUp className="w-4 h-4" /></button>
                    <button type="button" className="p-2 text-sand-500" onClick={() => moveSection(i, 1)} disabled={i === form.sections.length - 1}><ChevronDown className="w-4 h-4" /></button>
                    <button type="button" className="p-2 text-red-600" onClick={() => setForm((f) => ({ ...f, sections: f.sections.filter((_, idx) => idx !== i) }))}><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <input className="input-field w-full" placeholder="Image URL (optional)" value={s.image || ''} onChange={(e) => updateSection(i, { image: e.target.value })} />
                  <textarea className="input-field w-full min-h-24" placeholder="Section text" value={s.content || ''} onChange={(e) => updateSection(i, { content: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={save} disabled={saving} className="btn-primary inline-flex items-center gap-2">
                <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save page'}
              </button>
              <button type="button" onClick={() => setView('map')} className="btn-outline">Back to map</button>
            </div>
          </DashCard>
        </div>
      )}
    </div>
  );
}
