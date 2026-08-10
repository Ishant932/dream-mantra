import { getData, saveData } from './database.js';

function ensureLeads() {
  const data = getData();
  if (!data.contact_leads) data.contact_leads = [];
  if (!data.nextId.contact_leads) data.nextId.contact_leads = 1;
}

export function createContactLead({ name, email, phone, message, source = 'contact_page' }) {
  ensureLeads();
  const data = getData();
  const id = data.nextId.contact_leads++;
  const row = {
    id,
    name: String(name || '').trim(),
    email: String(email || '').trim(),
    phone: phone ? String(phone).trim() : null,
    message: String(message || '').trim(),
    status: 'new',
    source,
    created_at: new Date().toISOString(),
  };
  data.contact_leads.unshift(row);
  saveData();
  return row;
}

export function deleteContactLead(id) {
  ensureLeads();
  const data = getData();
  const idx = data.contact_leads.findIndex((l) => l.id === Number(id));
  if (idx === -1) return false;
  data.contact_leads.splice(idx, 1);
  saveData();
  return true;
}

export function listContactLeads({ status, program, search } = {}) {
  ensureLeads();
  let rows = getData().contact_leads || [];
  if (status && status !== 'all') rows = rows.filter((l) => l.status === status);
  const q = String(search || '').trim().toLowerCase();
  if (q) {
    rows = rows.filter((l) =>
      l.name?.toLowerCase().includes(q)
      || l.email?.toLowerCase().includes(q)
      || l.phone?.includes(q)
      || l.message?.toLowerCase().includes(q)
    );
  }
  if (program && program !== 'all') {
    rows = rows.filter((l) => matchLeadProgram(l, program));
  }
  return rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function matchLeadProgram(lead, program) {
  const msg = String(lead.message || '').toLowerCase();
  if (program === 'counselling') return /counselling|brain mapping|dmit|psychometric|skill mapping/.test(msg);
  if (program === 'training') return /training|placement|crp|job/.test(msg);
  if (program === 'partner') return /partner|institution|school/.test(msg);
  if (program === 'other') return !/counselling|training|placement|partner|brain|dmit|psychometric/.test(msg);
  return true;
}

export function updateContactLead(id, patch) {
  ensureLeads();
  const data = getData();
  const row = data.contact_leads.find((l) => l.id === Number(id));
  if (!row) return null;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.admin_notes !== undefined) row.admin_notes = String(patch.admin_notes || '').slice(0, 1000);
  row.updated_at = new Date().toISOString();
  saveData();
  return row;
}

export function countNewLeads() {
  ensureLeads();
  return (getData().contact_leads || []).filter((l) => l.status === 'new').length;
}
