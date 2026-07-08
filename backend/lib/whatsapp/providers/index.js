import * as meta from './meta.js';
import * as twilio from './twilio.js';
import { getWhatsAppProvider } from '../config.js';

function provider() {
  const name = getWhatsAppProvider();
  return name === 'twilio' ? twilio : meta;
}

export function isProviderConfigured() {
  return provider().isConfigured();
}

export async function sendTextMessage(toWaId, text) {
  return provider().sendTextMessage(toWaId, text);
}

export async function sendTemplateMessage(toWaId, templateName, langCode, components = [], textFallback = null) {
  return provider().sendTemplateMessage(toWaId, templateName, langCode, components, textFallback);
}

export function parseInboundWebhook(body, providerName) {
  const p = providerName === 'twilio' ? twilio : meta;
  return p.parseInboundWebhook(body);
}

export function verifyWebhookGet(query, providerName) {
  const p = providerName === 'twilio' ? twilio : meta;
  return p.verifyWebhookGet(query);
}

export { twilio, meta };
