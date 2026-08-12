import { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock, MessageSquare, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
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

function slugifyId(label) {
  const base = String(label || 'custom')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40);
  return `custom_${base || 'message'}_${Date.now().toString(36).slice(-4)}`;
}

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
  const [savedJoinPhrase, setSavedJoinPhrase] = useState('join dream-mantra');
  const [draftJoinPhrase, setDraftJoinPhrase] = useState('join dream-mantra');
  const [savedCustomTriggers, setSavedCustomTriggers] = useState([]);
  const [draftCustomTriggers, setDraftCustomTriggers] = useState([]);
  const [savedCustomTimingFields, setSavedCustomTimingFields] = useState([]);
  const [draftCustomTimingFields, setDraftCustomTimingFields] = useState([]);
  const [selected, setSelected] = useState('join_welcome');
  const [filter, setFilter] = useState('all');
  const [newMsgLabel, setNewMsgLabel] = useState('');
  const [newTimingLabel, setNewTimingLabel] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await adminApi.whatsappConfig(token);
      setTriggers(res.config?.triggers || []);
      setDefaults(res.defaults || {});
      const tpl = res.config?.templates || {};
      const timing = res.config?.timing || {};
      const joinPhrase = res.config?.joinPhrase || 'join dream-mantra';
      const customTriggers = res.config?.customTriggers || [];
      const customTimingFields = res.config?.customTimingFields || [];
      setSavedTemplates(tpl);
      setDraftTemplates(tpl);
      setSavedTiming(timing);
      setDraftTiming(timing);
      setSavedJoinPhrase(joinPhrase);
      setDraftJoinPhrase(joinPhrase);
      setSavedCustomTriggers(customTriggers);
      setDraftCustomTriggers(customTriggers);
      setSavedCustomTimingFields(customTimingFields);
      setDraftCustomTimingFields(customTimingFields);
    } catch (e) {
      onError?.(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, onError]);

  useEffect(() => { load(); }, [load]);

  const allTimingFields = useMemo(
    () => [...TIMING_FIELDS, ...draftCustomTimingFields.map((f) => ({ key: f.key, label: f.label }))],
    [draftCustomTimingFields],
  );

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
    const timingDirty = allTimingFields.some(
      (f) => Number(draftTiming[f.key]) !== Number(savedTiming[f.key]),
    );
    const joinDirty = draftJoinPhrase.trim() !== savedJoinPhrase.trim();
    const customDirty = JSON.stringify(draftCustomTriggers) !== JSON.stringify(savedCustomTriggers)
      || JSON.stringify(draftCustomTimingFields) !== JSON.stringify(savedCustomTimingFields);
    return tplDirty || timingDirty || joinDirty || customDirty;
  }, [draftTemplates, savedTemplates, draftTiming, savedTiming, draftJoinPhrase, savedJoinPhrase, draftCustomTriggers, savedCustomTriggers, draftCustomTimingFields, savedCustomTimingFields, allTimingFields]);

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
      for (const f of allTimingFields) {
        if (Number(draftTiming[f.key]) !== Number(savedTiming[f.key])) {
          timing[f.key] = Number(draftTiming[f.key]);
        }
      }
      await adminApi.updateWhatsAppConfig(token, {
        templates,
        timing,
        joinPhrase: draftJoinPhrase.trim() || 'join dream-mantra',
        customTriggers: draftCustomTriggers,
        customTimingFields: draftCustomTimingFields,
      });
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

  const addCustomMessage = () => {
    const label = newMsgLabel.trim();
    if (!label) {
      onError?.('Enter a name for the new message');
      return;
    }
    const id = slugifyId(label);
    const entry = { id, label, category: 'event', vars: '{{name}}, {{base}}', custom: true };
    setDraftCustomTriggers((prev) => [...prev, entry]);
    setTriggers((prev) => [...prev, entry]);
    setDraftTemplates((prev) => ({ ...prev, [id]: prev[id] || '' }));
    setSelected(id);
    setNewMsgLabel('');
  };

  const removeCustomMessage = (id) => {
    setDraftCustomTriggers((prev) => prev.filter((t) => t.id !== id));
    setTriggers((prev) => prev.filter((t) => t.id !== id));
    setDraftTemplates((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (selected === id) setSelected('join_welcome');
  };

  const addCustomTimingField = () => {
    const label = newTimingLabel.trim();
    if (!label) {
      onError?.('Enter a label for the new timing field');
      return;
    }
    const key = slugifyId(label);
    setDraftCustomTimingFields((prev) => [...prev, { key, label }]);
    setDraftTiming((prev) => ({ ...prev, [key]: prev[key] ?? 24 }));
    setNewTimingLabel('');
  };

  const removeCustomTimingField = (key) => {
    setDraftCustomTimingFields((prev) => prev.filter((f) => f.key !== key));
    setDraftTiming((prev) => {
      const next = { ...prev };
      delete next[key];
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
        subtitle="Edit auto-replies, notifications, reminders, join phrase, and their timing."
      />

      <DashCard className="!p-4 bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800" hover={false}>
        <label className="text-sm font-semibold block mb-2">Join phrase (Twilio sandbox)</label>
        <input
          type="text"
          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 bg-[var(--surface)] text-sm"
          value={draftJoinPhrase}
          onChange={(e) => setDraftJoinPhrase(e.target.value)}
          placeholder="join dream-mantra"
        />
        <p className="text-xs text-[var(--text-secondary)] mt-2">
          When someone sends <strong>{draftJoinPhrase.trim() || 'join dream-mantra'}</strong>, they get the Join Welcome message with the full menu.
          Leave a template blank to use the built-in default.
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
        <DashCard className="!p-2 max-h-[70vh] overflow-y-auto" hover={false}>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] px-2 py-1">Messages</p>
          <div className="flex gap-2 px-2 pb-2">
            <input
              type="text"
              className="flex-1 min-w-0 rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm bg-[var(--surface)]"
              placeholder="New message name"
              value={newMsgLabel}
              onChange={(e) => setNewMsgLabel(e.target.value)}
            />
            <button type="button" className="dash-btn dash-btn--ghost shrink-0" onClick={addCustomMessage} title="Add message">
              <Plus size={16} />
            </button>
          </div>
          <ul className="space-y-0.5">
            {filteredTriggers.map((t) => (
              <li key={t.id} className="flex items-center gap-1">
                <button
                  type="button"
                  className={`flex-1 text-left text-sm px-2 py-2 rounded-lg hover:bg-[var(--surface-muted)]${selected === t.id ? ' bg-[var(--surface-muted)] font-semibold' : ''}`}
                  onClick={() => setSelected(t.id)}
                >
                  {t.label}
                  {draftTemplates[t.id]?.trim() ? ' *' : ''}
                </button>
                {t.custom && (
                  <button type="button" className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" onClick={() => removeCustomMessage(t.id)} aria-label="Remove">
                    <Trash2 size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </DashCard>

        <div className="space-y-4">
          <DashCard className="!p-4" hover={false}>
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
              {isOverridden && !selectedMeta?.custom && (
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

          <DashCard className="!p-4" hover={false}>
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Clock size={18} />
              Reminder & drip timings (hours)
            </h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm bg-[var(--surface)]"
                placeholder="New timing field label"
                value={newTimingLabel}
                onChange={(e) => setNewTimingLabel(e.target.value)}
              />
              <button type="button" className="dash-btn dash-btn--ghost shrink-0" onClick={addCustomTimingField}>
                <Plus size={16} /> Add field
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {allTimingFields.map((f) => (
                <label key={f.key} className="text-sm block">
                  <span className="text-[var(--text-secondary)] flex items-center justify-between gap-2">
                    {f.label}
                    {draftCustomTimingFields.some((c) => c.key === f.key) && (
                      <button type="button" className="text-red-600 text-xs" onClick={() => removeCustomTimingField(f.key)}>Remove</button>
                    )}
                  </span>
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
