import { isProviderConfigured, twilio, meta } from './providers/index.js';

export function siteUrl() {
  const base = (process.env.WHATSAPP_SITE_URL || process.env.SITE_URL || 'https://dreammantra.in').trim();
  return base.replace(/\/$/, '');
}

export function isTwilioWhatsAppConfigured() {
  return twilio.isConfigured();
}

export function isMetaWhatsAppConfigured() {
  return meta.isConfigured();
}

/** twilio | meta — auto-detect from env if not set */
export function getWhatsAppProvider() {
  const forced = process.env.WHATSAPP_PROVIDER?.trim().toLowerCase();
  if (forced === 'twilio' || forced === 'meta') return forced;
  if (isTwilioWhatsAppConfigured()) return 'twilio';
  if (isMetaWhatsAppConfigured()) return 'meta';
  return 'none';
}

export function isWhatsAppConfigured() {
  return isProviderConfigured();
}

export function isWhatsAppEnabled() {
  if (process.env.WHATSAPP_ENABLED === 'false') return false;
  return isWhatsAppConfigured();
}

export function whatsAppApiVersion() {
  return process.env.WHATSAPP_API_VERSION?.trim() || 'v21.0';
}

export function verifyToken() {
  return process.env.WHATSAPP_VERIFY_TOKEN?.trim() || '';
}

export function cronSecret() {
  return process.env.CRON_SECRET?.trim() || '';
}

export function dedupHours() {
  const h = Number(process.env.WHATSAPP_DEDUP_HOURS);
  return Number.isFinite(h) && h > 0 ? h : 48;
}

export function getWhatsAppPublicConfig() {
  const provider = getWhatsAppProvider();
  return {
    provider,
    configured: isWhatsAppConfigured(),
    enabled: isWhatsAppEnabled(),
    sandbox: provider === 'twilio' && twilio.isSandboxMode(),
    sandboxJoinCode: provider === 'twilio' ? twilio.sandboxJoinCode() : null,
  };
}
