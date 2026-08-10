import { useCallback, useEffect, useState } from 'react';
import { Copy, ExternalLink, Save, RefreshCw } from 'lucide-react';
import AdminPanelHeader from '../AdminPanelHeader';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api';
import {
  studioLandingLocalUrl,
  studioLandingProductionUrl,
} from '../../data/studioLandings';

const FILE_TABS = [
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'js', label: 'JavaScript' },
];

export default function AdminStudioPanel() {
  const { token } = useAuth();
  const [landings, setLandings] = useState([]);
  const [active, setActive] = useState('');
  const [fileTab, setFileTab] = useState('html');
  const [files, setFiles] = useState({ html: '', css: '', js: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [previewKey, setPreviewKey] = useState(0);

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
    setError('');
    try {
      const res = await adminApi.getStudioLanding(token, slug);
      setFiles(res.files || { html: '', css: '', js: '' });
      setFileTab('html');
    } catch (e) {
      setError(e.message || 'Failed to load page content');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (active) loadPage(active);
  }, [active, loadPage]);

  const savePage = async () => {
    if (!token || !active) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await adminApi.updateStudioLanding(token, active, { files });
      setNotice('Landing page saved — live preview updated.');
      setPreviewKey((k) => k + 1);
    } catch (e) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard?.writeText(url);
    setNotice('Link copied.');
  };

  if (loading && !landings.length) {
    return <p className="text-sm opacity-70 py-8 text-center">Loading landing pages…</p>;
  }

  return (
    <div className="space-y-4">
      <AdminPanelHeader title="Landing Pages" />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm text-emerald-700">{notice}</p>}

      <div className="overflow-x-auto rounded-xl border border-sand-200">
        <table className="w-full text-sm admin-data-table min-w-[640px]">
          <thead>
            <tr className="border-b border-sand-200 text-left">
              <th className="py-2.5 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Program</th>
              <th className="py-2.5 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Status</th>
              <th className="py-2.5 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Local</th>
              <th className="py-2.5 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Production</th>
            </tr>
          </thead>
          <tbody>
            {landings.map((p) => {
              const local = studioLandingLocalUrl(p.slug);
              const prod = studioLandingProductionUrl(p.slug);
              return (
                <tr
                  key={p.slug}
                  className={`border-b border-sand-100 cursor-pointer hover:bg-amber-50/50 ${active === p.slug ? 'bg-amber-50/80' : ''}`}
                  onClick={() => setActive(p.slug)}
                >
                  <td className="py-2.5 px-3 font-semibold">{p.label}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.live ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                      {p.live ? 'LIVE' : 'Missing'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <a href={local} target="_blank" rel="noopener noreferrer" className="text-amber-800 hover:underline font-mono text-xs break-all">
                      {local}
                    </a>
                  </td>
                  <td className="py-2.5 px-3">
                    <a href={prod} target="_blank" rel="noopener noreferrer" className="text-amber-800 hover:underline font-mono text-xs break-all">
                      {prod}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {page && (
        <>
          <div className="admin-landing-meta rounded-xl border border-sand-200 p-3 text-sm space-y-2">
            <p className="font-bold">{page.label}</p>
            <div className="flex flex-wrap gap-2">
              <a href={localUrl} target="_blank" rel="noopener noreferrer" className="btn-outline !py-1.5 !px-3 text-xs inline-flex items-center gap-1">
                Open local <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a href={productionUrl} target="_blank" rel="noopener noreferrer" className="btn-outline !py-1.5 !px-3 text-xs inline-flex items-center gap-1">
                Open production <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button type="button" onClick={() => copyUrl(localUrl)} className="btn-outline !py-1.5 !px-3 text-xs inline-flex items-center gap-1">
                <Copy className="w-3.5 h-3.5" /> Copy local
              </button>
              <button type="button" onClick={() => setPreviewKey((k) => k + 1)} className="btn-outline !py-1.5 !px-3 text-xs inline-flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh preview
              </button>
              <button type="button" onClick={savePage} disabled={saving} className="btn-primary !py-1.5 !px-3 text-xs inline-flex items-center gap-1">
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {FILE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFileTab(tab.id)}
                className={`subtab-btn ${fileTab === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <textarea
            className="input-field w-full min-h-[280px] font-mono text-xs leading-relaxed"
            value={files[fileTab] || ''}
            onChange={(e) => setFiles((prev) => ({ ...prev, [fileTab]: e.target.value }))}
            spellCheck={false}
          />

          <div className="admin-landing-preview">
            <iframe
              key={`${active}-${previewKey}`}
              title={page.label}
              src={localUrl}
              className="admin-landing-preview__frame"
            />
          </div>
        </>
      )}
    </div>
  );
}
