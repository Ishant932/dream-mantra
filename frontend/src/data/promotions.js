/** Welcome offer — first-time assessment bookings */
export const WELCOME_OFFER = {
  code: 'DREAMS20',
  discountPercent: 20,
  title: 'First User Special',
  headline: '20% OFF Your First Assessment',
  description: 'New to Dream Mantra? Use coupon code at checkout on Mind Mapping, Skill Mapping, or any assessment.',
  badge: 'Limited Offer',
  validFor: 'First assessment payment only',
};

export function calcDiscountedPrice(price, discountPercent = WELCOME_OFFER.discountPercent) {
  const pct = Number(discountPercent) || 0;
  return Math.round(price * (1 - pct / 100));
}

/** Apply admin or static voucher to a checkout price */
export function applyVoucherPrice(price, coupon) {
  const original = Number(price) || 0;
  if (!coupon) return { original, final: original, savings: 0 };
  if (coupon.discountFixed != null && Number(coupon.discountFixed) > 0) {
    const savings = Math.min(original, Math.round(Number(coupon.discountFixed)));
    return { original, final: Math.max(0, original - savings), savings };
  }
  const pct = Number(coupon.discountPercent) || 0;
  const final = calcDiscountedPrice(original, pct);
  return { original, final, savings: original - final };
}
