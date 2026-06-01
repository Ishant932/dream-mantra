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

export function listContactLeads({ status } = {}) {
  ensureLeads();
  let rows = getData().contact_leads || [];
  if (status && status !== 'all') rows = rows.filter((l) => l.status === status);
  return rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
