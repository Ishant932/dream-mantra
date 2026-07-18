/**
 * Payment gateway — enabled when PhonePe credentials are configured.
 * Set PAYMENT_GATEWAY_ENABLED=false to force manual-only mode.
 */
import { isPhonePeConfigured } from './phonepeClient.js';

export function isGatewayEnabled() {
  if (process.env.PAYMENT_GATEWAY_ENABLED === 'false') return false;
  return isPhonePeConfigured();
}

export function getPaymentMode() {
  return isGatewayEnabled() ? 'gateway' : 'manual';
}

export function getGatewayPublicConfig() {
  const enabled = isGatewayEnabled();
  const rawEnv = (process.env.PHONEPE_ENV || 'PRODUCTION').trim().toUpperCase();
  const phonepeEnv =
    rawEnv === 'SANDBOX' || rawEnv === 'UAT' || rawEnv === 'TEST' ? 'sandbox' : 'production';
  return {
    mode: getPaymentMode(),
    gatewayEnabled: enabled,
    provider: enabled ? 'phonepe' : null,
    /** @deprecated kept for older clients — always null after PhonePe migration */
    razorpayKeyId: null,
    webhookConfigured: !!(
      process.env.PHONEPE_WEBHOOK_USERNAME?.trim() &&
      process.env.PHONEPE_WEBHOOK_PASSWORD?.trim()
    ),
    phonepeEnv: enabled ? phonepeEnv : null,
  };
}
