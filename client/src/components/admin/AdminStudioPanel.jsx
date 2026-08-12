import { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, ExternalLink, Save, RefreshCw, Plus, Trash2, Power, Pencil, Upload } from 'lucide-react';
import AdminPanelHeader from '../AdminPanelHeader';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api';
import { MODULE_CATALOG } from '../../data/moduleCatalog';
import { studioLandingLocalUrl, studioLandingProductionUrl } from '../../data/studioLandings';

const MAIN_TABS = [
  { id: 'all', label: 'All Landing Pages' },
  { id: 'create', label: 'Create Landing Page' },
  { id: 'edit', label: 'Edit Landing Pages' },
];

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

function buildPreviewDoc(files) {
  const html = files.html || '<p style="font-family:sans-serif;padding:2rem">Add HTML to preview.</p>';
  const css = files.css || '';
  const js = files.js || '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;
}

export default function AdminStudioPanel({ catalogModules = [] }) {
  const { token } = useAuth();
  const [mainTab, setMainTab] = useState('all');
  const [landings, setLandings] = useState([]);
  const [active, setActive] = useState('');
  const [fileTab, setFileTab] = useState('html');
  const [files, setFiles] = useState({ html: '', css: '', js: '' });
  const [listLoading, setListLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPage, setNewPage] = useState({ slug: '', label: '', productSlug: 'dmit', folder: '', ctaLabel: 'Book Now' });
  const [createFiles, setCreateFiles] = useState({ html: '', css: '', js: '' });
  const [heroFile, setHeroFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [editHeroFile, setEditHeroFile] = useState(null);
  const [editLogoFile, setEditLogoFile] = useState(null);
  const [extraAssetFile, setExtraAssetFile] = useState(null);
  const [savingAssets, setSavingAssets] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [previewKey, setPreviewKey] = useState(0);
  const [productSlug, setProductSlug] = useState('dmit');
  const [editMeta, setEditMeta] = useState({ label: '', folder: '', slug: '', ctaLabel: 'Book Now' });
  const [savingModule, setSavingModule] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [pageAssets, setPageAssets] = useState([]);
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
  const createPreviewDoc = useMemo(() => buildPreviewDoc(createFiles), [createFiles]);

  const loadList = useCallback(async () => {
    if (!token) return;
    setListLoading(true);
    setError('');
    try {
      const res = await adminApi.studioLandings(token);
      setLandings(res.landings || []);
    } catch (e) {
      setError(e.message || 'Failed to load landing pages');
    } finally {
      setListLoading(false);
    }
  }, [token]);

  const loadPage = useCallback(async (slug) => {
    if (!token || !slug) return;
    setPageLoading(true);
    try {
      const res = await adminApi.getStudioLanding(token, slug);
      setFiles(res.files || { html: '', css: '', js: '' });
      setEditMeta({
        label: res.label || '',
        folder: res.folder || '',
        slug: res.slug || slug,
        ctaLabel: res.ctaLabel || 'Book Now',
      });
      setPageAssets(res.assets || []);
      setProductSlug(res.productSlug || 'dmit');
      setFileTab('html');
      setEditHeroFile(null);
      setEditLogoFile(null);
      setExtraAssetFile(null);
    } catch (e) {
      setError(e.message || 'Failed to load page content');
    } finally {
      setPageLoading(false);
    }
  }, [token]);

  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => {
    if (active && (mainTab === 'edit')) loadPage(active);
  }, [active, mainTab, loadPage]);
  useEffect(() => {
    if (!token || catalogModules.length) return;
    adminApi.modules(token)
      .then((res) => setFetchedModules(res.modules || []))
      .catch(() => {});
  }, [token, catalogModules.length]);

  const openEdit = (slug) => {
    setActive(slug);
    setMainTab('edit');
  };

  const savePage = async () => {
    if (!token || !active) return;
    setSaving(true);
    setError('');
    try {
      await adminApi.updateStudioLanding(token, active, { files });
      setNotice('Landing page code saved.');
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

  const uploadExtraAsset = async () => {
    if (!token || !active || !extraAssetFile) return;
    setUploadingAsset(true);
    setError('');
    try {
      await adminApi.uploadStudioLandingAsset(token, active, {
        filename: extraAssetFile.name,
        data: await fileToBase64(extraAssetFile),
      });
      setExtraAssetFile(null);
      setNotice(`Uploaded ${extraAssetFile.name}`);
      setPreviewKey((k) => k + 1);
      await loadPage(active);
    } catch (e) {
      setError(e.message || 'Failed to upload asset');
    } finally {
      setUploadingAsset(false);
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
      const next = res.landings?.[0]?.slug || '';
      setActive(next);
      if (!next) setMainTab('all');
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

  const saveMeta = async () => {
    if (!token || !active) return;
    setSavingMeta(true);
    setError('');
    try {
      const body = {
        label: editMeta.label,
        folder: editMeta.folder,
        ctaLabel: editMeta.ctaLabel,
      };
      if (editMeta.slug !== active) body.newSlug = editMeta.slug;
      const res = await adminApi.updateStudioLandingMeta(token, active, body);
      setLandings(res.landings || []);
      const updated = res.landings?.find((l) => l.slug === editMeta.slug || l.slug === active);
      if (updated?.slug && updated.slug !== active) setActive(updated.slug);
      setNotice('Page details updated.');
      setPreviewKey((k) => k + 1);
      await loadPage(updated?.slug || active);
    } catch (e) {
      setError(e.message || 'Failed to update page details');
    } finally {
      setSavingMeta(false);
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
      if (createFiles.html || createFiles.css || createFiles.js) payload.files = createFiles;
      const res = await adminApi.createStudioLanding(token, payload);
      setLandings(res.landings || []);
      if (res.landing?.slug) {
        setActive(res.landing.slug);
        setMainTab('edit');
      }
      setNewPage({ slug: '', label: '', productSlug: 'dmit', folder: '', ctaLabel: 'Book Now' });
      setCreateFiles({ html: '', css: '', js: '' });
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

  if (listLoading && !landings.length) {
    return <p className="text-sm opacity-70 py-8 text-center">Loading landing pages…</p>;
  }

  return (
    <div className="space-y-4 admin-landing-panel">
      <AdminPanelHeader title="Landing Pages" />

      <div className="subtab-track" role="tablist" aria-label="Landing page sections">
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mainTab === tab.id}
            onClick={() => setMainTab(tab.id)}
            className={`subtab-btn ${mainTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-emerald-700">{notice}</p>}

      {mainTab === 'all' && (
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
                <tr key={p.slug} className="border-b border-sand-100 hover:bg-amber-50/50">
                  <td className="py-2.5 px-3 font-semibold">{p.label}</td>
                  <td className="py-2.5 px-3 text-xs opacity-80">{moduleLabel(p.productSlug)}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.live ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                      {p.live ? 'LIVE' : 'OFFLINE'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="btn-outline !py-1 !px-2 text-xs" onClick={() => openEdit(p.slug)}>
                        <Pencil className="w-3.5 h-3.5 inline" /> Edit
                      </button>
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
      )}

      {mainTab === 'create' && (
        <form onSubmit={createPage} className="space-y-4">
          <div className="rounded-xl border border-sand-200 p-4 grid sm:grid-cols-2 gap-3 bg-sand-50/50">
            <input className="input-field" placeholder="URL slug" value={newPage.slug} onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })} required />
            <input className="input-field" placeholder="Page label" value={newPage.label} onChange={(e) => setNewPage({ ...newPage, label: e.target.value })} required />
            <select className="input-field" value={newPage.productSlug} onChange={(e) => setNewPage({ ...newPage, productSlug: e.target.value })} required>
              <option value="">Select checkout module…</option>
              {checkoutModules.map((m) => <option key={m.slug} value={m.slug}>{m.title} (₹{m.price})</option>)}
            </select>
            <input className="input-field" placeholder="CTA label (e.g. Book Now)" value={newPage.ctaLabel} onChange={(e) => setNewPage({ ...newPage, ctaLabel: e.target.value })} />
            <input className="input-field sm:col-span-2" placeholder="Folder name (optional — defaults to label)" value={newPage.folder} onChange={(e) => setNewPage({ ...newPage, folder: e.target.value })} />
            <label className="text-xs font-bold">Hero image
              <input type="file" accept="image/*" className="input-field !py-2 mt-1" onChange={(e) => setHeroFile(e.target.files?.[0] || null)} />
            </label>
            <label className="text-xs font-bold">Logo image
              <input type="file" accept="image/*" className="input-field !py-2 mt-1" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div>
            <p className="text-xs font-bold uppercase opacity-60 mb-2">Page code (optional — leave blank for default template)</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {FILE_TABS.map((tab) => (
                <button key={tab.id} type="button" onClick={() => setFileTab(tab.id)} className={`subtab-btn ${fileTab === tab.id ? 'active' : ''}`}>{tab.label}</button>
              ))}
            </div>
            <textarea
              className="input-field w-full min-h-[220px] font-mono text-xs"
              value={createFiles[fileTab] || ''}
              onChange={(e) => setCreateFiles((prev) => ({ ...prev, [fileTab]: e.target.value }))}
              spellCheck={false}
              placeholder={`Optional ${fileTab.toUpperCase()} — uses Counselling template if empty`}
            />
          </div>

          {(createFiles.html || createFiles.css || createFiles.js) && (
            <div className="admin-landing-preview">
              <iframe title="Create preview" srcDoc={createPreviewDoc} className="admin-landing-preview__frame" sandbox="allow-scripts" />
            </div>
          )}

          <button type="submit" disabled={creating} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> {creating ? 'Creating…' : 'Create landing page'}
          </button>
        </form>
      )}

      {mainTab === 'edit' && (
        <div className="space-y-4">
          <label className="text-xs font-bold block max-w-md">
            Select page to edit
            <select
              className="input-field mt-1"
              value={active || ''}
              onChange={(e) => setActive(e.target.value)}
            >
              <option value="">Choose a landing page…</option>
              {landings.map((p) => (
                <option key={p.slug} value={p.slug}>{p.label}</option>
              ))}
            </select>
          </label>

          {pageLoading && <p className="text-sm opacity-70">Loading page…</p>}

          {page && !pageLoading && (
            <>
              <div className="admin-landing-meta rounded-xl border border-sand-200 p-3 text-sm space-y-3">
                <p className="font-bold">{page.label}</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="text-xs font-bold">Page label
                    <input className="input-field mt-1" value={editMeta.label} onChange={(e) => setEditMeta({ ...editMeta, label: e.target.value })} />
                  </label>
                  <label className="text-xs font-bold">URL slug
                    <input className="input-field mt-1" value={editMeta.slug} onChange={(e) => setEditMeta({ ...editMeta, slug: e.target.value })} disabled={!page.custom} />
                  </label>
                  <label className="text-xs font-bold">Folder name
                    <input className="input-field mt-1" value={editMeta.folder} onChange={(e) => setEditMeta({ ...editMeta, folder: e.target.value })} disabled={!page.custom} />
                  </label>
                  <label className="text-xs font-bold">CTA button label
                    <input className="input-field mt-1" value={editMeta.ctaLabel} onChange={(e) => setEditMeta({ ...editMeta, ctaLabel: e.target.value })} />
                  </label>
                </div>
                <button type="button" onClick={saveMeta} disabled={savingMeta} className="btn-outline !py-2 !px-3 text-xs">
                  {savingMeta ? 'Saving…' : 'Save page details'}
                </button>

                <div className="flex flex-wrap items-end gap-2 pt-2 border-t border-sand-200">
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

                <div className="rounded-lg border border-sand-200/80 bg-white/60 p-3 space-y-2">
                  <p className="text-xs font-bold uppercase opacity-60">Page assets</p>
                  {pageAssets.length ? (
                    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {pageAssets.map((asset) => (
                        <li key={asset.path} className="rounded-lg border border-sand-200 p-2 text-xs">
                          <img src={asset.url} alt="" className="w-full h-20 object-cover rounded mb-1 bg-sand-100" />
                          <code className="block truncate">{asset.path}</code>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs opacity-60">No images in assets folder yet.</p>
                  )}
                  <div className="flex flex-wrap items-end gap-2">
                    <label className="text-xs font-bold flex-1 min-w-[180px]">
                      Upload image to assets/
                      <input type="file" accept="image/*" className="input-field !py-2 mt-1" onChange={(e) => setExtraAssetFile(e.target.files?.[0] || null)} />
                    </label>
                    {extraAssetFile && (
                      <button type="button" onClick={uploadExtraAsset} disabled={uploadingAsset} className="btn-outline !py-2 !px-3 text-xs inline-flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" /> {uploadingAsset ? 'Uploading…' : 'Upload'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a href={localUrl} target="_blank" rel="noopener noreferrer" className="btn-outline !py-1.5 !px-3 text-xs inline-flex items-center gap-1">Open local <ExternalLink className="w-3.5 h-3.5" /></a>
                  <a href={productionUrl} target="_blank" rel="noopener noreferrer" className="btn-outline !py-1.5 !px-3 text-xs inline-flex items-center gap-1">Production <ExternalLink className="w-3.5 h-3.5" /></a>
                  <button type="button" onClick={() => { navigator.clipboard?.writeText(localUrl); setNotice('Copied'); }} className="btn-outline !py-1.5 !px-3 text-xs"><Copy className="w-3.5 h-3.5 inline" /> Copy</button>
                  <button type="button" onClick={() => setPreviewKey((k) => k + 1)} className="btn-outline !py-1.5 !px-3 text-xs"><RefreshCw className="w-3.5 h-3.5 inline" /> Refresh</button>
                  <button type="button" onClick={() => toggleLive(page.slug, !page.live)} className="btn-outline !py-1.5 !px-3 text-xs">
                    <Power className="w-3.5 h-3.5 inline" /> {page.live ? 'Unpublish' : 'Go live'}
                  </button>
                  <button type="button" onClick={savePage} disabled={saving} className="btn-primary !py-1.5 !px-3 text-xs"><Save className="w-3.5 h-3.5 inline" /> {saving ? 'Saving…' : 'Save code'}</button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {FILE_TABS.map((tab) => (
                  <button key={tab.id} type="button" onClick={() => setFileTab(tab.id)} className={`subtab-btn ${fileTab === tab.id ? 'active' : ''}`}>{tab.label}</button>
                ))}
              </div>
              <textarea
                className="input-field w-full min-h-[280px] font-mono text-xs"
                value={files[fileTab] || ''}
                onChange={(e) => setFiles((prev) => ({ ...prev, [fileTab]: e.target.value }))}
                spellCheck={false}
              />
              <div className="admin-landing-preview">
                <iframe key={`${active}-${previewKey}`} title={page.label} src={localUrl} className="admin-landing-preview__frame" />
              </div>
            </>
          )}

          {!page && !pageLoading && (
            <p className="text-sm opacity-70">Select a landing page above to edit its content, assets, and code.</p>
          )}
        </div>
      )}
    </div>
  );
}
