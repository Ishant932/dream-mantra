import { useState, useEffect, useCallback, useMemo } from 'react';
import { Mail, Phone, CheckCircle2, Clock, Sparkles, User, Trash2, Search } from 'lucide-react';
import { adminApi } from '../api';
import { DashCard } from './DashboardUI';
import AdminPanelHeader from './AdminPanelHeader';
import AdminSectionExport from './AdminSectionExport';

const PROGRAM_TABS = [
  { id: 'all', label: 'All programs' },
  { id: 'counselling', label: 'Counselling' },
  { id: 'training', label: 'Training & Placement' },
  { id: 'partner', label: 'Partner' },
  { id: 'other', label: 'Other' },
];

const INTENT_TONES = ['red', 'purple', 'green', 'blue', 'orange'];
const EXPORT_COLS = [
  { label: 'Name', get: (l) => l.name },
  { label: 'Email', get: (l) => l.email },
  { label: 'Phone', get: (l) => l.phone },
  { label: 'Intent', get: (l) => parseGuidanceLead(l).intent },
  { label: 'Message', get: (l) => parseGuidanceLead(l).detail },
  { label: 'Status', get: (l) => l.status },
  { label: 'Created', get: (l) => l.created_at },
];

function parseGuidanceLead(lead) {
  const msg = String(lead.message || '').trim();
  const match = msg.match(/^\[([^\]]+)\]\s*([\s\S]*)$/);
  if (match) return { intent: match[1].trim(), detail: match[2].trim() || '—' };
  return { intent: 'Guidance call', detail: msg || '—' };
}

export default function AdminLeadsPanel({ token, onNotice, onError }) {
  const [leads, setLeads] = useState([]);
  const [newCount, setNewCount] = useState(0);
  const [program, setProgram] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminApi.leads(token, { status: 'all', program, search });
      setLeads(data.leads || []);
      setNewCount(data.newCount ?? 0);
    } catch (e) {
      onError?.(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, program, search, onError]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, nextStatus) => {
    try {
      await adminApi.updateLead(token, id, { status: nextStatus });
      onNotice?.('Guidance call updated');
      load();
    } catch (e) {
      onError?.(e.message);
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm('Delete this guidance call request?')) return;
    try {
      await adminApi.deleteLead(token, id);
      onNotice?.('Deleted');
      load();
    } catch (e) {
      onError?.(e.message);
    }
  };

  const exportName = useMemo(() => {
    const prog = PROGRAM_TABS.find((p) => p.id === program)?.label || 'all';
    return `guidance-calls-${prog.replace(/\s+/g, '-').toLowerCase()}`;
  }, [program]);

  return (
    <div className="space-y-4">
      <AdminPanelHeader title="Guidance Calls" subtitle="Free guidance requests from website popup">
        {newCount > 0 && (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">{newCount} new</span>
        )}
        {leads.length > 0 && (
          <AdminSectionExport title="Guidance Calls" filename={exportName} rows={leads} columns={EXPORT_COLS} />
        )}
      </AdminPanelHeader>

      <div className="flex flex-wrap gap-2">
        {PROGRAM_TABS.map((opt) => (
          <button key={opt.id} type="button" onClick={() => setProgram(opt.id)} className={`subtab-btn ${program === opt.id ? 'active' : ''}`}>
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
          <input
            className="input-field !py-2 pl-9 w-full text-sm"
            placeholder="Search name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm opacity-60 py-8 text-center">Loading…</p>
      ) : leads.length === 0 ? (
        <p className="text-sm opacity-60 py-8 text-center">No guidance calls match filters.</p>
      ) : (
        <div className="space-y-3">
          {leads.map((lead, i) => {
            const { intent, detail } = parseGuidanceLead(lead);
            const tone = INTENT_TONES[i % INTENT_TONES.length];
            return (
              <DashCard key={lead.id} className="!p-4 guidance-lead-card" hover={false} glow={false}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`guidance-lead-card__intent guidance-lead-card__intent--${tone}`}>
                        <Sparkles className="w-3.5 h-3.5" /> {intent}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        lead.status === 'new' ? 'bg-amber-100 text-amber-800'
                          : lead.status === 'contacted' ? 'bg-blue-100 text-blue-800'
                            : 'bg-sand-100 text-sand-700'
                      }`}>{lead.status}</span>
                    </div>
                    <p className="font-bold flex items-center gap-1.5"><User className="w-4 h-4 opacity-60" /> {lead.name}</p>
                    <p className="text-sm flex items-center gap-1.5 opacity-80 mt-1">
                      <Mail className="w-3.5 h-3.5" /><a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
                    </p>
                    {lead.phone && <p className="text-sm flex items-center gap-1.5 opacity-80 mt-0.5"><Phone className="w-3.5 h-3.5" /> {lead.phone}</p>}
                    <div className="guidance-lead-card__message mt-3">
                      <p className="text-xs font-bold uppercase tracking-wide opacity-60 mb-1">Request</p>
                      <p className="text-sm leading-relaxed">{detail}</p>
                    </div>
                    <p className="text-xs opacity-50 mt-2 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(lead.created_at).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {lead.status === 'new' && (
                      <button type="button" onClick={() => updateStatus(lead.id, 'contacted')} className="btn-outline !py-1.5 !px-3 text-xs">Mark contacted</button>
                    )}
                    {lead.status !== 'closed' && (
                      <button type="button" onClick={() => updateStatus(lead.id, 'closed')} className="btn-outline !py-1.5 !px-3 text-xs inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Close
                      </button>
                    )}
                    <button type="button" onClick={() => deleteLead(lead.id)} className="btn-outline !py-1.5 !px-3 text-xs inline-flex items-center gap-1 text-red-600 border-red-200">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </DashCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
