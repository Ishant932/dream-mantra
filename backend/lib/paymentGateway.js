/**
 * Payment gateway toggle — manual flow until explicitly enabled.
 * Set PAYMENT_GATEWAY_ENABLED=true plus Razorpay keys to activate auto-confirmation.
 */
export function isGatewayEnabled() {
  return (
    process.env.PAYMENT_GATEWAY_ENABLED === 'true' &&
    !!process.env.RAZORPAY_KEY_ID &&
    !!process.env.RAZORPAY_KEY_SECRET
  );
}

export function getPaymentMode() {
  return isGatewayEnabled() ? 'gateway' : 'manual';
}
