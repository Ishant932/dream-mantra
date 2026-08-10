import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, FileText, Link2, Loader2, Paperclip } from 'lucide-react';
import { userApi } from '../../api';

function ResourceCard({ msg }) {
  const attachments = msg.attachments || [];
  const links = (msg.body || '').match(/https?:\/\/[^\s]+/g) || [];

  return (
    <div className="training-resource-card">
      <div className="training-resource-card__head">
        <Paperclip className="w-4 h-4 text-amber-600 shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold text-theme-primary text-sm">
            From Dream Mantra team
          </p>
          <p className="text-xs dash-card-meta">
            {new Date(msg.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
      </div>
      {msg.body && (
        <p className="text-sm dash-card-meta mt-3 whitespace-pre-wrap leading-relaxed">{msg.body}</p>
      )}
      {links.length > 0 && (
        <ul className="mt-3 space-y-2">
          {links.map((url) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noreferrer" className="training-resource-link">
                <Link2 className="w-4 h-4 shrink-0" />
                <span className="truncate">{url}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60" />
              </a>
            </li>
          ))}
        </ul>
      )}
      {attachments.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {attachments.map((att, i) => (
            <a
              key={i}
              href={att.url?.startsWith('/') ? att.url : att.url}
              target="_blank"
              rel="noreferrer"
              className="training-resource-link"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="truncate">{att.name || 'Download document'}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TrainingResourcesPanel({ token, resources: sharedResources = [] }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await userApi.messages(token);
      const adminMsgs = (data.messages || []).filter((m) => m.sender_role === 'admin');
      setMessages(adminMsgs);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm dash-card-meta gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
        Loading resources…
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600 py-6 text-center">{error}</p>;
  }

  if (!messages.length && !sharedResources.length) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-300/70 bg-amber-50/50 p-8 text-center dark:bg-amber-950/20">
        <Paperclip className="w-10 h-10 text-amber-500 mx-auto mb-3 opacity-80" />
        <p className="font-semibold text-theme-primary">No resources yet</p>
        <p className="text-sm dash-card-meta mt-2 max-w-md mx-auto">
          When your counsellor or admin shares links, notes, or documents, they will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sharedResources.map((r) => (
        <div key={r.id} className="training-resource-card">
          <p className="font-semibold text-theme-primary text-sm">{r.title}</p>
          {r.note && <p className="text-sm dash-card-meta mt-2">{r.note}</p>}
          <a href={r.url} target="_blank" rel="noreferrer" className="training-resource-link mt-3">
            <Link2 className="w-4 h-4 shrink-0" /><span className="truncate">{r.url}</span>
          </a>
        </div>
      ))}
      {messages.map((msg) => (
        <ResourceCard key={msg.id} msg={msg} />
      ))}
    </div>
  );
}
