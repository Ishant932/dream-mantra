import { useState } from 'react';
import { ExternalLink, Users, Calendar, CheckCircle2 } from 'lucide-react';
import { DashCard } from '../DashboardUI';
import { resolveCommunityMeta } from '../../utils/communityLink';
import { userApi } from '../../api';

export default function CommunityLinksPanel({ communityLink, assessmentId, token, communityJoined, onJoined }) {
  const meta = resolveCommunityMeta(communityLink);
  const hasLink = Boolean(meta.url);
  const [saving, setSaving] = useState(false);
  const [joined, setJoined] = useState(!!communityJoined);
  const [err, setErr] = useState('');

  const markJoined = async () => {
    if (!assessmentId || !token || joined) return;
    setSaving(true);
    setErr('');
    try {
      await userApi.updateAssessmentFlow(token, assessmentId, { communityJoined: true });
      setJoined(true);
      onJoined?.();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashCard className="!p-6 !overflow-visible" glow={false} hover={false}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <Users className="w-6 h-6 text-amber-700" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{meta.title || 'Community links'}</h3>
          <p className="text-sm dash-card-meta mb-2">
            Join your AI Career Launchpad community — link provided by admin for your batch.
          </p>
          {(meta.start_at || meta.end_at) && (
            <p className="text-xs dash-card-meta flex items-center gap-1 mb-3">
              <Calendar className="w-3.5 h-3.5" />
              Active {meta.start_at ? new Date(meta.start_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'now'}
              {meta.end_at ? ` until ${new Date(meta.end_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}` : ''}
            </p>
          )}
          {meta.description && (
            <p className="text-sm dash-card-meta mb-3 p-3 rounded-lg bg-amber-50/80 border border-amber-200/50">{meta.description}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {hasLink && (
              <a href={meta.url} target="_blank" rel="noreferrer" className="btn-primary inline-flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> Open community link
              </a>
            )}
            {joined ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" /> Joined
              </span>
            ) : (
              <button type="button" className="btn-outline inline-flex items-center gap-2" disabled={saving || !assessmentId} onClick={markJoined}>
                <CheckCircle2 className="w-4 h-4" /> {saving ? 'Saving…' : "I've joined the community"}
              </button>
            )}
          </div>
          {!hasLink && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mt-3">
              Your community link will appear here when your batch window is active.
            </p>
          )}
          {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
        </div>
      </div>
    </DashCard>
  );
}
