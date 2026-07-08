import { isWhatsAppConfigured } from './config.js';
import { getData } from '../database.js';
import { sendTextMessage as sendText, sendTemplateMessage as sendTemplate } from './providers/index.js';
import { buildTextBody } from './templates.js';

export { sendText as sendTextMessage };

export async function sendTemplateMessage(toWaId, templateName, langCode, components = [], options = {}) {
  if (!isWhatsAppConfigured()) {
    console.warn('[whatsapp] Skipping template — not configured');
    return { skipped: true };
  }

  const textFallback = options.textFallback
    || buildTextBody(options.trigger, options.user, options.extra)
    || buildTextBodyFromComponents(templateName, components);

  return sendTemplate(toWaId, templateName, langCode, components, textFallback);
}

function buildTextBodyFromComponents(templateName, components) {
  const body = components?.find((c) => c.type === 'body');
  if (!body?.parameters?.length) return null;
  const parts = body.parameters.map((p) => p.text);

  switch (templateName) {
    case 'dm_welcome':
      return `Hi ${parts[0]}, welcome to Dream Mantra! Your Dreams ID is ${parts[1]}. Complete your profile: ${parts[2]}`;
    case 'dm_profile_reminder':
      return `Hi ${parts[0]}, your Dream Mantra profile is incomplete. Finish it here: ${parts[1]}`;
    case 'dm_payment_reminder':
      return `Hi ${parts[0]}, your ${parts[1]} payment is pending. Pay here: ${parts[2]}`;
    case 'dm_session_reminder':
      return `Reminder: your counselling session is on ${parts[0]} at ${parts[1]}.`;
    case 'dm_report_ready':
      return `Hi ${parts[0]}, your ${parts[1]} report is ready! View: ${parts[2]}`;
    default:
      return parts.join(' — ');
  }
}

function userById(userId) {
  if (!userId) return null;
  return (getData().users || []).find((u) => Number(u.id) === Number(userId)) || null;
}

export async function sendTemplateForRow(row) {
  return sendTemplateMessage(
    row.phone,
    row.template_name,
    row.template_lang || 'en',
    row.template_components || [],
    {
      trigger: row.trigger,
      user: userById(row.user_id),
      extra: row.meta || {},
    }
  );
}
