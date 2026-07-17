/** Helpers for applying account vouchers at checkout (no public promo marketing). */

export function calcDiscountedPrice(price, discountPercent = 0) {
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
