/**
 * Payment gateway — enabled when Razorpay keys are configured.
 * Set PAYMENT_GATEWAY_ENABLED=false to force manual-only mode.
 */
export function isGatewayEnabled() {
  if (process.env.PAYMENT_GATEWAY_ENABLED === 'false') return false;
  return !!(process.env.RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim());
}

export function getPaymentMode() {
  return isGatewayEnabled() ? 'gateway' : 'manual';
}

export function getGatewayPublicConfig() {
  const enabled = isGatewayEnabled();
  return {
    mode: getPaymentMode(),
    gatewayEnabled: enabled,
    provider: enabled ? 'razorpay' : null,
    razorpayKeyId: enabled ? process.env.RAZORPAY_KEY_ID : null,
    webhookConfigured: !!process.env.RAZORPAY_WEBHOOK_SECRET?.trim(),
  };
}
