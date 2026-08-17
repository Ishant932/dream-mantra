import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, ExternalLink, FileText, Loader2, Trash2 } from 'lucide-react';
import EmbeddedAppFrame from '../EmbeddedAppFrame';
import { userApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const CV_TTL_DAYS = 30;

function daysLeftLabel(cv) {
  const days = cv?.days_left;
  if (days == null) return `${CV_TTL_DAYS} days`;
  if (days <= 0) return 'expires today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

export default function CVMakerPanel() {
  const frameRef = useRef(null);
  const { token } = useAuth();
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const saveTimer = useRef(null);

  const loadSaved = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const data = await userApi.getCv(token);
      setSaved(data.cv || null);
    } catch {
      setSaved(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  const pushLoadToFrame = useCallback(() => {
    const win = frameRef.current?.contentWindow;
    if (!win || !saved?.form) return;
    win.postMessage({ type: 'dm-cv-load', payload: saved }, '*');
  }, [saved]);

  const persist = useCallback(async (payload) => {
    if (!token || !payload?.form) return;
    setSaving(true);
    try {
      const data = await userApi.saveCv(token, {
        form: payload.form,
        template_id: payload.template_id || payload.form?.template,
        ats_score: payload.ats_score,
        name: payload.name || payload.form?.personal?.name,
      });
      setSaved(data.cv || null);
      setStatus('Saved to your dashboard · auto-deletes in 30 days');
    } catch (e) {
      setStatus(e.message || 'Could not save CV');
    } finally {
      setSaving(false);
    }
  }, [token]);

  useEffect(() => {
    const onMsg = (e) => {
      const data = e.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'dm-cv-save' && data.payload) {
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => persist(data.payload), 1200);
      }
      if (data.type === 'dm-cv-ready') {
        pushLoadToFrame();
      }
    };
    window.addEventListener('message', onMsg);
    return () => {
      window.removeEventListener('message', onMsg);
      clearTimeout(saveTimer.current);
    };
  }, [persist, pushLoadToFrame]);

  const handleDownload = () => {
    const win = frameRef.current?.contentWindow;
    if (win) {
      win.postMessage({ type: 'dm-cv-download' }, '*');
      return;
    }
    window.open('/cv-builder/index.html', '_blank', 'noopener,noreferrer');
  };

  const handleDelete = async () => {
    if (!token || !saved) return;
    try {
      await userApi.deleteCv(token);
      setSaved(null);
      setStatus('Saved CV removed');
    } catch (e) {
      setStatus(e.message || 'Could not delete CV');
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm dash-card-meta leading-relaxed">
        Build your CV, upload a photo, and download a PDF. Your latest CV is stored on this dashboard and
        <strong> auto-deletes after 30 days</strong>.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={handleDownload}>
          <Download className="w-4 h-4" /> Download as PDF
        </button>
        <a href="/cv-builder/index.html" target="_blank" rel="noreferrer" className="btn-outline inline-flex items-center gap-2">
          <ExternalLink className="w-4 h-4" /> Open full screen
        </a>
      </div>
      {status && <p className="text-xs text-amber-800">{saving ? 'Saving…' : status}</p>}

      {!loading && saved && (
        <div className="cv-saved-card">
          <FileText className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-theme-primary truncate">{saved.name || 'Saved CV'}</p>
            <p className="text-xs dash-card-meta">
              Updated {saved.updated_at ? new Date(saved.updated_at).toLocaleString('en-IN') : '—'}
              {' · '}Auto-deletes in 30 days ({daysLeftLabel(saved)})
            </p>
          </div>
          <button type="button" className="btn-outline !py-1.5 !px-3 text-xs inline-flex items-center gap-1" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" /> Download
          </button>
          <button type="button" className="btn-outline !py-1.5 !px-3 text-xs inline-flex items-center gap-1 text-red-700" onClick={handleDelete}>
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
      {loading && (
        <p className="text-xs dash-card-meta inline-flex items-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading saved CV…
        </p>
      )}

      <div className="app-embed app-embed--cv app-embed--flush cv-maker-embed">
        <EmbeddedAppFrame
          ref={frameRef}
          src="/cv-builder/index.html"
          title="CV Builder"
          className="app-embed__frame"
          embed
          loading="eager"
        />
      </div>
    </div>
  );
}
