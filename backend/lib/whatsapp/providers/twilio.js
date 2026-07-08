import { normalizePhone } from '../../../utils/passwordReset.js';

function twilioAuth() {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!sid || !token) return null;
  return {
    sid,
    token,
    header: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
  };
}

export function isConfigured() {
  const auth = twilioAuth();
  const from = process.env.TWILIO_WHATSAPP_FROM?.trim();
  return !!(auth && from);
}

/** +91XXXXXXXXXX for Twilio whatsapp: prefix */
export function toTwilioWhatsAppAddress(waId) {
  const digits = String(waId || '').replace(/\D/g, '');
  if (digits.length < 10) return null;
  const local = digits.slice(-10);
  return `+91${local}`;
}

function whatsappFrom() {
  const raw = process.env.TWILIO_WHATSAPP_FROM?.trim() || '';
  return raw.startsWith('whatsapp:') ? raw : `whatsapp:${raw}`;
}

function whatsappTo(waId) {
  const e164 = toTwilioWhatsAppAddress(waId);
  if (!e164) return null;
  return `whatsapp:${e164}`;
}

async function sendMessage(params) {
  const auth = twilioAuth();
  if (!auth) throw new Error('Twilio credentials not configured');

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${auth.sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: auth.header,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    }
  );

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const err = data?.message || text;
    throw new Error(`Twilio WhatsApp ${res.status}: ${err}`);
  }
  return data;
}

function contentSidForTemplate(templateName) {
  if (!templateName) return null;
  const key = `TWILIO_CONTENT_${String(templateName).toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
  return process.env[key]?.trim() || null;
}

function variablesFromComponents(components = []) {
  const body = components.find((c) => c.type === 'body');
  if (!body?.parameters?.length) return null;
  const vars = {};
  body.parameters.forEach((p, i) => {
    vars[String(i + 1)] = p.text;
  });
  return JSON.stringify(vars);
}

export async function sendTextMessage(toWaId, text) {
  if (!isConfigured()) {
    console.warn('[whatsapp:twilio] Skipping send — not configured');
    return { skipped: true };
  }

  const to = whatsappTo(toWaId);
  if (!to) throw new Error('Invalid recipient phone');

  const params = new URLSearchParams({
    To: to,
    From: whatsappFrom(),
    Body: String(text).slice(0, 1600),
  });

  const data = await sendMessage(params);
  return { messages: [{ id: data.sid }], provider: 'twilio' };
}

export async function sendTemplateMessage(toWaId, templateName, langCode, components = [], textFallback = null) {
  const contentSid = contentSidForTemplate(templateName);

  if (contentSid) {
    if (!isConfigured()) return { skipped: true };
    const to = whatsappTo(toWaId);
    if (!to) throw new Error('Invalid recipient phone');

    const params = new URLSearchParams({
      To: to,
      From: whatsappFrom(),
      ContentSid: contentSid,
    });
    const vars = variablesFromComponents(components);
    if (vars) params.set('ContentVariables', vars);

    const data = await sendMessage(params);
    return { messages: [{ id: data.sid }], provider: 'twilio', contentSid };
  }

  if (textFallback) {
    return sendTextMessage(toWaId, textFallback);
  }

  throw new Error(`No Twilio Content template for ${templateName} and no text fallback`);
}

export function parseInboundWebhook(body) {
  if (!body?.Body || !body?.From) return [];
  const from = String(body.From).replace(/^whatsapp:/i, '').replace(/\D/g, '');
  return [{
    from,
    text: String(body.Body).trim(),
    messageId: body.MessageSid || body.SmsSid || null,
  }];
}

export function verifyWebhookGet() {
  return { ok: true, challenge: 'twilio' };
}

/** Parse whatsapp:+91... from Twilio From field */
export function parseTwilioFrom(from) {
  return String(from || '').replace(/^whatsapp:/i, '').replace(/\D/g, '');
}

export function isSandboxMode() {
  const from = process.env.TWILIO_WHATSAPP_FROM?.trim() || '';
  return from.includes('4155238886') || process.env.TWILIO_WHATSAPP_SANDBOX === 'true';
}

export function sandboxJoinCode() {
  return process.env.TWILIO_WHATSAPP_SANDBOX_CODE?.trim() || '';
}
