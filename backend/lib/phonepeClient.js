/**
 * PhonePe Standard Checkout client (singleton).
 * Docs: https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/
 */
import {
  StandardCheckoutClient,
  Env,
  StandardCheckoutPayRequest,
} from '@phonepe-pg/pg-sdk-node';
import { randomUUID } from 'crypto';

let client = null;

export function isPhonePeConfigured() {
  return !!(process.env.PHONEPE_CLIENT_ID?.trim() && process.env.PHONEPE_CLIENT_SECRET?.trim());
}

export function getPhonePeEnv() {
  const raw = (process.env.PHONEPE_ENV || 'PRODUCTION').trim().toUpperCase();
  return raw === 'SANDBOX' || raw === 'UAT' || raw === 'TEST' ? Env.SANDBOX : Env.PRODUCTION;
}

export function getPhonePeClient() {
  if (!isPhonePeConfigured()) {
    throw new Error('PhonePe is not configured — set PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET');
  }
  if (!client) {
    const version = Number(process.env.PHONEPE_CLIENT_VERSION || 1);
    client = StandardCheckoutClient.getInstance(
      process.env.PHONEPE_CLIENT_ID.trim(),
      process.env.PHONEPE_CLIENT_SECRET.trim(),
      Number.isFinite(version) && version > 0 ? version : 1,
      getPhonePeEnv()
    );
  }
  return client;
}

/** Public site URL used for PhonePe redirect after payment */
export function getAppPublicUrl() {
  const raw =
    process.env.APP_PUBLIC_URL ||
    process.env.SITE_URL ||
    process.env.WHATSAPP_SITE_URL ||
    'https://dreammantra.in';
  return String(raw).trim().replace(/\/$/, '');
}

export function buildMerchantOrderId(assessmentId) {
  const id = String(assessmentId || '0').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 12);
  return `DM${id}-${randomUUID().replace(/-/g, '').slice(0, 16)}`;
}

/**
 * Start Standard Checkout — returns PhonePe redirect URL.
 * Amount must be in paise (₹1 = 100).
 */
export async function createPhonePeCheckout({
  merchantOrderId,
  amountPaise,
  redirectUrl,
  meta = {},
}) {
  const pe = getPhonePeClient();
  const request = StandardCheckoutPayRequest.builder()
    .merchantOrderId(merchantOrderId)
    .amount(amountPaise)
    .redirectUrl(redirectUrl)
    .build();

  const response = await pe.pay(request);
  return {
    merchantOrderId,
    redirectUrl: response.redirectUrl,
    orderId: response.orderId || null,
    meta,
  };
}

/** Poll PhonePe for order state (COMPLETED / FAILED / PENDING / …) */
export async function getPhonePeOrderStatus(merchantOrderId) {
  const pe = getPhonePeClient();
  return pe.getOrderStatus(merchantOrderId);
}

/**
 * Validate S2S webhook callback from PhonePe.
 * Username/password are set by you in the PhonePe Business dashboard webhook config.
 */
export function validatePhonePeCallback(authorizationHeader, bodyString) {
  const username = process.env.PHONEPE_WEBHOOK_USERNAME?.trim();
  const password = process.env.PHONEPE_WEBHOOK_PASSWORD?.trim();
  if (!username || !password) {
    throw new Error('PhonePe webhook username/password not configured');
  }
  const pe = getPhonePeClient();
  return pe.validateCallback(username, password, authorizationHeader, bodyString);
}
