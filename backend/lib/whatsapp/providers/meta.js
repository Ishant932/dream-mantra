const GRAPH = 'https://graph.facebook.com';

function isMetaEnvConfigured() {
  return !!(
    process.env.WHATSAPP_TOKEN?.trim()
    && process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()
  );
}

function apiVersion() {
  return process.env.WHATSAPP_API_VERSION?.trim() || 'v21.0';
}

async function apiRequest(path, body) {
  const token = process.env.WHATSAPP_TOKEN?.trim();
  if (!token) throw new Error('WHATSAPP_TOKEN not configured');

  const res = await fetch(`${GRAPH}/${apiVersion()}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const err = data?.error?.message || JSON.stringify(data);
    throw new Error(`Meta WhatsApp API ${res.status}: ${err}`);
  }
  return data;
}

export function isConfigured() {
  return isMetaEnvConfigured();
}

export async function sendTextMessage(toWaId, text) {
  if (!isConfigured()) {
    console.warn('[whatsapp:meta] Skipping send — not configured');
    return { skipped: true };
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID.trim();
  return apiRequest(`/${phoneNumberId}/messages`, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: String(toWaId).replace(/\D/g, ''),
    type: 'text',
    text: { preview_url: true, body: String(text).slice(0, 4096) },
  });
}

export async function sendTemplateMessage(toWaId, templateName, langCode, components = [], textFallback = null) {
  if (!isConfigured()) {
    console.warn('[whatsapp:meta] Skipping template — not configured');
    return { skipped: true };
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID.trim();
  const payload = {
    messaging_product: 'whatsapp',
    to: String(toWaId).replace(/\D/g, ''),
    type: 'template',
    template: {
      name: templateName,
      language: { code: langCode || 'en' },
    },
  };
  if (components.length) payload.template.components = components;

  return apiRequest(`/${phoneNumberId}/messages`, payload);
}

export function parseInboundWebhook(body) {
  const entry = body?.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  if (!value?.messages) return [];

  return value.messages
    .filter((msg) => msg.type === 'text' && msg.text?.body)
    .map((msg) => ({
      from: msg.from,
      text: msg.text.body,
      messageId: msg.id,
    }));
}

export function verifyWebhookGet(query) {
  const mode = query['hub.mode'];
  const token = query['hub.verify_token'];
  const challenge = query['hub.challenge'];
  const expected = process.env.WHATSAPP_VERIFY_TOKEN?.trim() || '';
  if (mode === 'subscribe' && token === expected) {
    return { ok: true, challenge };
  }
  return { ok: false };
}
