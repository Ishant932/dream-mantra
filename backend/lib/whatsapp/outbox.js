import { getData, saveData } from '../database.js';
import { sendTextMessage, sendTemplateForRow } from './client.js';
import { buildTemplatePayload } from './templates.js';
import { resolveUserPhone } from './phone.js';
import { dedupHours, isWhatsAppEnabled } from './config.js';

function ensureOutbox() {
  const data = getData();
  if (!data.whatsapp_outbox) data.whatsapp_outbox = [];
  if (!data.nextId.whatsapp_outbox) data.nextId.whatsapp_outbox = 1;
}

function hoursAgo(iso, hours) {
  return Date.now() - new Date(iso).getTime() < hours * 60 * 60 * 1000;
}

export function hasRecentOutbox(userId, trigger, hours = dedupHours()) {
  ensureOutbox();
  const uid = Number(userId);
  return (getData().whatsapp_outbox || []).some(
    (row) => row.user_id === uid
      && row.trigger === trigger
      && row.status !== 'cancelled'
      && row.created_at
      && hoursAgo(row.created_at, hours)
  );
}

export function queueWhatsAppMessage({
  userId,
  user,
  phone,
  trigger,
  kind = 'auto',
  scheduledAt = null,
  templateName = null,
  templateLang = 'en',
  templateComponents = null,
  body = null,
  meta = {},
}) {
  if (!isWhatsAppEnabled()) return null;

  const waId = phone || resolveUserPhone(user);
  if (!waId) return null;

  const uid = userId != null ? Number(userId) : Number(user?.id);
  if (uid && hasRecentOutbox(uid, trigger)) return null;

  ensureOutbox();
  const data = getData();
  const id = data.nextId.whatsapp_outbox++;
  const now = new Date().toISOString();
  const row = {
    id,
    user_id: uid || null,
    phone: waId,
    trigger,
    kind,
    message_kind: templateName ? 'template' : 'text',
    template_name: templateName,
    template_lang: templateLang,
    template_components: templateComponents,
    body,
    status: 'pending',
    scheduled_at: scheduledAt || now,
    sent_at: null,
    attempts: 0,
    last_error: null,
    meta,
    created_at: now,
  };
  data.whatsapp_outbox.unshift(row);
  saveData();
  return row;
}

export function queueFromTemplate(trigger, user, extra = {}) {
  const payload = buildTemplatePayload(trigger, user, extra);
  if (!payload) return null;

  if (payload.kind === 'text') {
    return queueWhatsAppMessage({
      userId: user.id,
      user,
      trigger,
      body: payload.body,
      meta: extra,
    });
  }

  return queueWhatsAppMessage({
    userId: user.id,
    user,
    trigger,
    templateName: payload.templateName,
    templateLang: payload.lang,
    templateComponents: payload.components,
    meta: extra,
  });
}

export function scheduleWhatsAppMessage(opts, delayMs) {
  const at = new Date(Date.now() + Math.max(0, delayMs)).toISOString();
  return queueWhatsAppMessage({ ...opts, scheduledAt: at });
}

async function sendRow(row) {
  if (row.message_kind === 'template' && row.template_name) {
    return sendTemplateForRow(row);
  }
  return sendTextMessage(row.phone, row.body || '');
}

export async function processOutbox({ limit = 50, userId = null } = {}) {
  if (!isWhatsAppEnabled()) {
    return { processed: 0, sent: 0, failed: 0, skipped: true };
  }

  ensureOutbox();
  const data = getData();
  const now = Date.now();
  const uid = userId != null ? Number(userId) : null;
  const pending = (data.whatsapp_outbox || [])
    .filter((r) => r.status === 'pending'
      && new Date(r.scheduled_at).getTime() <= now
      && (uid == null || Number(r.user_id) === uid))
    .slice(0, limit);

  let sent = 0;
  let failed = 0;

  for (const row of pending) {
    row.attempts = (row.attempts || 0) + 1;
    try {
      const result = await sendRow(row);
      if (result?.skipped) {
        row.status = 'skipped';
        row.last_error = 'WhatsApp not configured';
      } else {
        row.status = 'sent';
        row.sent_at = new Date().toISOString();
        row.wa_message_id = result?.messages?.[0]?.id || null;
        sent += 1;
      }
    } catch (err) {
      row.last_error = err.message;
      if (row.attempts >= 3) row.status = 'failed';
      failed += 1;
      console.error('[whatsapp] outbox send failed:', row.id, err.message);
    }
  }

  if (sent || failed) saveData();
  return { processed: pending.length, sent, failed };
}

export function listOutboxForUser(userId, { limit = 20 } = {}) {
  ensureOutbox();
  return (getData().whatsapp_outbox || [])
    .filter((r) => r.user_id === Number(userId))
    .slice(0, limit);
}
