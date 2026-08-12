import { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, ExternalLink, Save, RefreshCw, Plus, Trash2, Power } from 'lucide-react';
import AdminPanelHeader from '../AdminPanelHeader';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api';
import { MODULE_CATALOG } from '../../data/moduleCatalog';
import { studioLandingLocalUrl, studioLandingProductionUrl } from '../../data/studioLandings';

const FILE_TABS = [
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'js', label: 'JavaScript' },
];

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] || '');
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function AdminStudioPanel({ catalogModules = [] }) {
  const { token } = useAuth();
  const [landings, setLandings] = useState([]);
  const [active, setActive] = useState('');
  const [fileTab, setFileTab] = useState('html');
  const [files, setFiles] = useState({ html: '', css: '', js: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newPage, setNewPage] = useState({ slug: '', label: '', productSlug: 'dmit', folder: '', ctaLabel: 'Book Now' });
  const [heroFile, setHeroFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [editHeroFile, setEditHeroFile] = useState(null);
  const [editLogoFile, setEditLogoFile] = useState(null);
  const [savingAssets, setSavingAssets] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [previewKey, setPreviewKey] = useState(0);
  const [productSlug, setProductSlug] = useState('dmit');
  const [savingModule, setSavingModule] = useState(false);
  const [fetchedModules, setFetchedModules] = useState([]);

  const checkoutModules = useMemo(() => {
    const fromApi = (catalogModules?.length ? catalogModules : fetchedModules).filter((m) => !m.hidden && !m.followUpOnly);
    if (fromApi.length) return fromApi;
    return MODULE_CATALOG.filter((m) => !m.followUpOnly);
  }, [catalogModules, fetchedModules]);

  const moduleLabel = (slug) => checkoutModules.find((m) => m.slug === slug)?.title || slug;

  const page = landings.find((p) => p.slug === active) || landings[0];
  const localUrl = page ? studioLandingLocalUrl(page.slug) : '';
  const productionUrl = page ? studioLandingProductionUrl(page.slug) : '';

  const loadList = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.studioLandings(token);
      const list = res.landings || [];
      setLandings(list);
      if (!active && list[0]) setActive(list[0].slug);
    } catch (e) {
      setError(e.message || 'Failed to load landing pages');
    } finally {
      setLoading(false);
    }
  }, [token, active]);

  const loadPage = useCallback(async (slug) => {
    if (!token || !slug) return;
    setLoading(true);
    try {
      const res = await adminApi.getStudioLanding(token, slug);
      setFiles(res.files || { html: '', css: '', js: '' });
      setFileTab('html');
      setEditHeroFile(null);
      setEditLogoFile(null);
    } catch (e) {
      setError(e.message || 'Failed to load page content');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => { if (active) loadPage(active); }, [active, loadPage]);
  useEffect(() => {
    if (!token || catalogModules.length) return;
    adminApi.modules(token)
      .then((res) => setFetchedModules(res.modules || []))
      .catch(() => {});
  }, [token, catalogModules.length]);
  useEffect(() => {
    if (page?.productSlug) setProductSlug(page.productSlug);
  }, [page?.productSlug, active]);

  const savePage = async () => {
    if (!token || !active) return;
    setSaving(true);
    setError('');
    try {
      await adminApi.updateStudioLanding(token, active, { files });
      setNotice('Landing page saved.');
      setPreviewKey((k) => k + 1);
    } catch (e) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const saveAssets = async () => {
    if (!token || !active || (!editHeroFile && !editLogoFile)) return;
    setSavingAssets(true);
    setError('');
    try {
      const body = {};
      if (editHeroFile) body.heroImage = await fileToBase64(editHeroFile);
      if (editLogoFile) body.logoImage = await fileToBase64(editLogoFile);
      const res = await adminApi.updateStudioLandingMeta(token, active, body);
      setLandings(res.landings || landings);
      setEditHeroFile(null);
      setEditLogoFile(null);
      setNotice('Hero and logo images updated.');
      setPreviewKey((k) => k + 1);
      await loadPage(active);
    } catch (e) {
      setError(e.message || 'Failed to upload images');
    } finally {
      setSavingAssets(false);
    }
  };

  const toggleLive = async (slug, published) => {
    try {
      const res = await adminApi.updateStudioLandingMeta(token, slug, { published });
      setLandings(res.landings || []);
      setNotice(published ? 'Page is now LIVE' : 'Page is now OFFLINE');
    } catch (e) {
      setError(e.message);
    }
  };

  const removePage = async (slug) => {
    if (!window.confirm('Delete or unpublish this landing page?')) return;
    try {
      const res = await adminApi.deleteStudioLanding(token, slug);
      setLandings(res.landings || []);
      setActive(res.landings?.[0]?.slug || '');
      setNotice(res.deleted ? 'Landing page deleted' : 'Landing page taken offline');
    } catch (e) {
      setError(e.message);
    }
  };

  const saveModule = async () => {
    if (!token || !active) return;
    setSavingModule(true);
    try {
      await adminApi.updateStudioLandingMeta(token, active, { productSlug });
      const res = await adminApi.studioLandings(token);
      setLandings(res.landings || []);
      setNotice('Checkout module updated — Join Now opens that program checkout.');
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingModule(false);
    }
  };

  const createPage = async (e) => {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    setError('');
    try {
      const payload = { ...newPage };
      if (heroFile) payload.heroImage = await fileToBase64(heroFile);
      if (logoFile) payload.logoImage = await fileToBase64(logoFile);
      const res = await adminApi.createStudioLanding(token, payload);
      setLandings(res.landings || []);
      if (res.landing?.slug) setActive(res.landing.slug);
      setShowCreate(false);
      setNewPage({ slug: '', label: '', productSlug: 'dmit', folder: '', ctaLabel: 'Book Now' });
      setHeroFile(null);
      setLogoFile(null);
      setNotice('Landing page created with Join Now → checkout.');
      setPreviewKey((k) => k + 1);
    } catch (e) {
      setError(e.message || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  if (loading && !landings.length) {
    return <p className="text-sm opacity-70 py-8 text-center">Loading landing pages…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminPanelHeader title="Landing Pages" />
        <button type="button" onClick={() => setShowCreate((v) => !v)} className="btn-primary !py-2 !px-4 text-sm inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> New landing page
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createPage} className="rounded-xl border border-sand-200 p-4 grid sm:grid-cols-2 gap-3 bg-sand-50/50">
          <input className="input-field" placeholder="URL slug" value={newPage.slug} onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })} required />
          <input className="input-field" placeholder="Page label" value={newPage.label} onChange={(e) => setNewPage({ ...newPage, label: e.target.value })} required />
          <select className="input-field" value={newPage.productSlug} onChange={(e) => setNewPage({ ...newPage, productSlug: e.target.value })} required>
            <option value="">Select checkout module…</option>
            {checkoutModules.map((m) => <option key={m.slug} value={m.slug}>{m.title} (₹{m.price})</option>)}
          </select>
          <input className="input-field" placeholder="CTA label (e.g. Book Now)" value={newPage.ctaLabel} onChange={(e) => setNewPage({ ...newPage, ctaLabel: e.target.value })} />
          <input className="input-field" placeholder="Folder name (optional)" value={newPage.folder} onChange={(e) => setNewPage({ ...newPage, folder: e.target.value })} />
          <label className="text-xs font-bold">Hero image<input type="file" accept="image/*" className="input-field !py-2 mt-1" onChange={(e) => setHeroFile(e.target.files?.[0] || null)} /></label>
          <label className="text-xs font-bold">Logo image<input type="file" accept="image/*" className="input-field !py-2 mt-1" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} /></label>
          {(heroFile || logoFile) && (
            <p className="sm:col-span-2 text-xs text-emerald-700 font-semibold">
              {heroFile ? `Hero: ${heroFile.name}` : ''}{heroFile && logoFile ? ' · ' : ''}{logoFile ? `Logo: ${logoFile.name}` : ''}
            </p>
          )}
          <button type="submit" disabled={creating} className="btn-primary sm:col-span-2">{creating ? 'Creating…' : 'Create page'}</button>
        </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-emerald-700">{notice}</p>}

      <div className="overflow-x-auto rounded-xl border border-sand-200">
        <table className="w-full text-sm admin-data-table min-w-[720px]">
          <thead>
            <tr className="border-b border-sand-200 text-left">
              <th className="py-2.5 px-3 font-semibold text-xs uppercase opacity-60">Page</th>
              <th className="py-2.5 px-3 font-semibold text-xs uppercase opacity-60">Checkout module</th>
              <th className="py-2.5 px-3 font-semibold text-xs uppercase opacity-60">Status</th>
              <th className="py-2.5 px-3 font-semibold text-xs uppercase opacity-60">Actions</th>
            </tr>
          </thead>
          <tbody>
            {landings.map((p) => (
              <tr key={p.slug} className={`border-b border-sand-100 cursor-pointer hover:bg-amber-50/50 ${active === p.slug ? 'bg-amber-50/80' : ''}`} onClick={() => setActive(p.slug)}>
                <td className="py-2.5 px-3 font-semibold">{p.label}</td>
                <td className="py-2.5 px-3 text-xs opacity-80">{moduleLabel(p.productSlug)}</td>
                <td className="py-2.5 px-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.live ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                    {p.live ? 'LIVE' : 'OFFLINE'}
                  </span>
                </td>
                <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2">
                    <button type="button" className="btn-outline !py-1 !px-2 text-xs" onClick={() => toggleLive(p.slug, !p.live)}>
                      <Power className="w-3.5 h-3.5 inline" /> {p.live ? 'Unpublish' : 'Go live'}
                    </button>
                    <button type="button" className="btn-outline !py-1 !px-2 text-xs text-red-700" onClick={() => removePage(p.slug)}>
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {page && (
        <>
          <div className="admin-landing-meta rounded-xl border border-sand-200 p-3 text-sm space-y-3">
            <p className="font-bold">{page.label}</p>
            <div className="flex flex-wrap items-end gap-2">
              <label className="text-xs font-bold flex-1 min-w-[200px]">
                Checkout module (Join Now → payment)
                <select className="input-field mt-1" value={productSlug} onChange={(e) => setProductSlug(e.target.value)}>
                  {checkoutModules.map((m) => (
                    <option key={m.slug} value={m.slug}>{m.title} — ₹{m.price}</option>
                  ))}
                </select>
              </label>
              <button type="button" onClick={saveModule} disabled={savingModule} className="btn-outline !py-2 !px-3 text-xs">
                {savingModule ? 'Saving…' : 'Save module'}
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 rounded-lg border border-sand-200/80 bg-white/60 p-3">
              <label className="text-xs font-bold">Replace hero image
                <input type="file" accept="image/*" className="input-field !py-2 mt-1" onChange={(e) => setEditHeroFile(e.target.files?.[0] || null)} />
              </label>
              <label className="text-xs font-bold">Replace logo image
                <input type="file" accept="image/*" className="input-field !py-2 mt-1" onChange={(e) => setEditLogoFile(e.target.files?.[0] || null)} />
              </label>
              {(editHeroFile || editLogoFile) && (
                <button type="button" onClick={saveAssets} disabled={savingAssets} className="btn-primary sm:col-span-2 !py-2 text-xs">
                  {savingAssets ? 'Uploading…' : 'Upload hero / logo images'}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={localUrl} target="_blank" rel="noopener noreferrer" className="btn-outline !py-1.5 !px-3 text-xs inline-flex items-center gap-1">Open local <ExternalLink className="w-3.5 h-3.5" /></a>
              <a href={productionUrl} target="_blank" rel="noopener noreferrer" className="btn-outline !py-1.5 !px-3 text-xs inline-flex items-center gap-1">Production <ExternalLink className="w-3.5 h-3.5" /></a>
              <button type="button" onClick={() => { navigator.clipboard?.writeText(localUrl); setNotice('Copied'); }} className="btn-outline !py-1.5 !px-3 text-xs"><Copy className="w-3.5 h-3.5 inline" /> Copy</button>
              <button type="button" onClick={() => setPreviewKey((k) => k + 1)} className="btn-outline !py-1.5 !px-3 text-xs"><RefreshCw className="w-3.5 h-3.5 inline" /> Refresh</button>
              <button type="button" onClick={savePage} disabled={saving} className="btn-primary !py-1.5 !px-3 text-xs"><Save className="w-3.5 h-3.5 inline" /> {saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILE_TABS.map((tab) => (
              <button key={tab.id} type="button" onClick={() => setFileTab(tab.id)} className={`subtab-btn ${fileTab === tab.id ? 'active' : ''}`}>{tab.label}</button>
            ))}
          </div>
          <textarea className="input-field w-full min-h-[280px] font-mono text-xs" value={files[fileTab] || ''} onChange={(e) => setFiles((prev) => ({ ...prev, [fileTab]: e.target.value }))} spellCheck={false} />
          <div className="admin-landing-preview">
            <iframe key={`${active}-${previewKey}`} title={page.label} src={localUrl} className="admin-landing-preview__frame" />
          </div>
        </>
      )}
    </div>
  );
}
