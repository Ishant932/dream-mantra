import { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock, MessageSquare, RotateCcw, Save } from 'lucide-react';
import AdminPanelHeader from '../AdminPanelHeader';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api';
import { DashCard } from '../DashboardUI';

const TIMING_FIELDS = [
  { key: 'welcome_step2_hours', label: 'Welcome drip — profile reminder (hours after signup)' },
  { key: 'welcome_step3_hours', label: 'Welcome drip — modules (hours after signup)' },
  { key: 'welcome_step4_hours', label: 'Welcome drip — book session (hours after signup)' },
  { key: 'payment_reminder_first_hours', label: 'Payment pending — first reminder (hours)' },
  { key: 'payment_reminder_second_hours', label: 'Payment pending — second reminder (hours)' },
  { key: 'payment_proof_pending_hours', label: 'Payment proof pending (hours after submit)' },
  { key: 'payment_schedule_delay_hours', label: 'Payment reminder on checkout (hours)' },
  { key: 'profile_reminder_min_account_hours', label: 'Profile incomplete — min account age (hours)' },
  { key: 'test_reminder_hours_after_pay', label: 'Take test reminder (hours after payment)' },
  { key: 'community_invite_hours_after_pay', label: 'Community invite (hours after CRP/Launchpad pay)' },
  { key: 'readiness_schedule_hours_after_pay', label: 'Career Readiness schedule nudge (hours after pay)' },
  { key: 'journey_status_dedup_hours', label: 'Journey status dedup window (hours)' },
  { key: 'dedup_hours', label: 'General message dedup window (hours)' },
];

export default function AdminWhatsAppPanel({ onNotice, onError }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [triggers, setTriggers] = useState([]);
  const [defaults, setDefaults] = useState({});
  const [savedTemplates, setSavedTemplates] = useState({});
  const [draftTemplates, setDraftTemplates] = useState({});
  const [savedTiming, setSavedTiming] = useState({});
  const [draftTiming, setDraftTiming] = useState({});
  const [selected, setSelected] = useState('join_welcome');
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await adminApi.whatsappConfig(token);
      setTriggers(res.config?.triggers || []);
      setDefaults(res.defaults || {});
      const tpl = res.config?.templates || {};
      const timing = res.config?.timing || {};
      setSavedTemplates(tpl);
      setDraftTemplates(tpl);
      setSavedTiming(timing);
      setDraftTiming(timing);
    } catch (e) {
      onError?.(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, onError]);

  useEffect(() => { load(); }, [load]);

  const filteredTriggers = useMemo(() => {
    if (filter === 'all') return triggers;
    return triggers.filter((t) => t.category === filter);
  }, [triggers, filter]);

  const selectedMeta = triggers.find((t) => t.id === selected);
  const effectiveBody = draftTemplates[selected] ?? defaults[selected] ?? '';
  const isOverridden = Boolean(draftTemplates[selected]?.trim());
  const isDirty = useMemo(() => {
    const tplDirty = Object.keys({ ...savedTemplates, ...draftTemplates }).some(
      (k) => (draftTemplates[k] || '') !== (savedTemplates[k] || ''),
    );
    const timingDirty = TIMING_FIELDS.some(
      (f) => Number(draftTiming[f.key]) !== Number(savedTiming[f.key]),
    );
    return tplDirty || timingDirty;
  }, [draftTemplates, savedTemplates, draftTiming, savedTiming]);

  const save = async () => {
    setSaving(true);
    try {
      const templates = {};
      for (const t of triggers) {
        const draft = draftTemplates[t.id];
        const saved = savedTemplates[t.id] || '';
        if (draft !== undefined && draft !== saved) {
          templates[t.id] = draft || null;
        }
      }
      const timing = {};
      for (const f of TIMING_FIELDS) {
        if (Number(draftTiming[f.key]) !== Number(savedTiming[f.key])) {
          timing[f.key] = Number(draftTiming[f.key]);
        }
      }
      await adminApi.updateWhatsAppConfig(token, { templates, timing });
      onNotice?.('WhatsApp messages & reminder timings saved');
      await load();
    } catch (e) {
      onError?.(e.message);
    } finally {
      setSaving(false);
    }
  };

  const resetSelected = () => {
    setDraftTemplates((prev) => {
      const next = { ...prev };
      delete next[selected];
      return next;
    });
  };

  if (loading) {
    return <p className="text-sm text-[var(--text-secondary)]">Loading WhatsApp settings…</p>;
  }

  return (
    <div className="space-y-4 admin-whatsapp-cms">
      <AdminPanelHeader
        title="WhatsApp & Twilio messages"
        subtitle="Edit auto-replies, notifications, reminders, and their timing. Use {{name}}, {{uid}}, {{base}}, {{moduleTitle}}, etc."
      />

      <DashCard className="!p-3 bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800">
        <p className="text-sm">
          When someone sends <strong>join dream-mantra</strong>, they instantly get the Join Welcome message with the full menu.
          Leave a template blank to use the built-in default. Overrides apply immediately to new messages.
        </p>
      </DashCard>

      <div className="flex flex-wrap gap-2 items-center">
        {['all', 'chat', 'event', 'scheduled', 'reminder'].map((cat) => (
          <button
            key={cat}
            type="button"
            className={`dash-subtab-rail__chip${filter === cat ? ' is-active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
        <button
          type="button"
          className="dash-btn dash-btn--primary ml-auto"
          disabled={!isDirty || saving}
          onClick={save}
        >
          <Save size={16} />
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <DashCard className="!p-2 max-h-[70vh] overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] px-2 py-1">Messages</p>
          <ul className="space-y-0.5">
            {filteredTriggers.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={`w-full text-left text-sm px-2 py-2 rounded-lg hover:bg-[var(--surface-muted)]${selected === t.id ? ' bg-[var(--surface-muted)] font-semibold' : ''}`}
                  onClick={() => setSelected(t.id)}
                >
                  {t.label}
                  {draftTemplates[t.id]?.trim() ? ' *' : ''}
                </button>
              </li>
            ))}
          </ul>
        </DashCard>

        <div className="space-y-4">
          <DashCard className="!p-4">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageSquare size={18} />
                  {selectedMeta?.label || selected}
                </h3>
                {selectedMeta?.vars && (
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Variables: {selectedMeta.vars}</p>
                )}
              </div>
              {isOverridden && (
                <button type="button" className="dash-btn dash-btn--ghost text-sm" onClick={resetSelected}>
                  <RotateCcw size={14} />
                  Reset to default
                </button>
              )}
            </div>
            <textarea
              className="w-full min-h-[320px] font-mono text-sm p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
              value={effectiveBody}
              onChange={(e) => setDraftTemplates((prev) => ({ ...prev, [selected]: e.target.value }))}
              placeholder={defaults[selected] || 'Message body…'}
            />
            {!isOverridden && defaults[selected] && (
              <p className="text-xs text-[var(--text-secondary)] mt-2">Showing built-in default. Edit to create an override.</p>
            )}
          </DashCard>

          <DashCard className="!p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Clock size={18} />
              Reminder & drip timings (hours)
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {TIMING_FIELDS.map((f) => (
                <label key={f.key} className="text-sm block">
                  <span className="text-[var(--text-secondary)]">{f.label}</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2 bg-[var(--surface)]"
                    value={draftTiming[f.key] ?? ''}
                    onChange={(e) => setDraftTiming((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  />
                </label>
              ))}
            </div>
          </DashCard>
        </div>
      </div>
    </div>
  );
}
