import { useState, useEffect, useCallback } from 'react';
import { Mail, Phone, MessageSquare, CheckCircle2, Clock } from 'lucide-react';
import { adminApi } from '../api';
import { DashCard } from './DashboardUI';
import AdminPanelHeader from './AdminPanelHeader';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
];

export default function AdminLeadsPanel({ token, onNotice, onError }) {
  const [leads, setLeads] = useState([]);
  const [newCount, setNewCount] = useState(0);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminApi.leads(token, { status });
      setLeads(data.leads || []);
      setNewCount(data.newCount ?? 0);
    } catch (e) {
      onError?.(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, status, onError]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id, nextStatus) => {
    try {
      await adminApi.updateLead(token, id, { status: nextStatus });
      onNotice?.('Lead updated');
      load();
    } catch (e) {
      onError?.(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <AdminPanelHeader
        title="Contact & Leads"
        subtitle="Messages from the website contact form"
        exportProps={{
          title: 'Leads',
          filename: 'contact-leads',
          rows: leads,
          columns: [
            { label: 'Name', get: (l) => l.name },
            { label: 'Email', get: (l) => l.email },
            { label: 'Phone', get: (l) => l.phone },
            { label: 'Message', get: (l) => l.message },
            { label: 'Status', get: (l) => l.status },
            { label: 'Created', get: (l) => l.created_at },
          ],
        }}
      >
        {newCount > 0 && (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
            {newCount} new
          </span>
        )}
      </AdminPanelHeader>

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStatus(opt.value)}
            className={`subtab-btn ${status === opt.value ? 'active' : ''}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm opacity-60 py-8 text-center">Loading leads…</p>
      ) : leads.length === 0 ? (
        <p className="text-sm opacity-60 py-8 text-center">No leads in this filter.</p>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <DashCard key={lead.id} className="!p-4" hover={false} glow={false}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-bold">{lead.name}</p>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      lead.status === 'new' ? 'bg-amber-100 text-amber-800'
                        : lead.status === 'contacted' ? 'bg-blue-100 text-blue-800'
                          : 'bg-sand-100 text-sand-700'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-sm flex items-center gap-1.5 opacity-80">
                    <Mail className="w-3.5 h-3.5" />
                    <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
                  </p>
                  {lead.phone && (
                    <p className="text-sm flex items-center gap-1.5 opacity-80 mt-0.5">
                      <Phone className="w-3.5 h-3.5" /> {lead.phone}
                    </p>
                  )}
                  <p className="text-sm flex items-start gap-1.5 mt-2 opacity-90">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    {lead.message}
                  </p>
                  <p className="text-xs opacity-50 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(lead.created_at).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {lead.status === 'new' && (
                    <button type="button" onClick={() => updateStatus(lead.id, 'contacted')} className="btn-outline !py-1.5 !px-3 text-xs">
                      Mark contacted
                    </button>
                  )}
                  {lead.status !== 'closed' && (
                    <button type="button" onClick={() => updateStatus(lead.id, 'closed')} className="btn-outline !py-1.5 !px-3 text-xs inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Close
                    </button>
                  )}
                </div>
              </div>
            </DashCard>
          ))}
        </div>
      )}
    </div>
  );
}
