import { COUPONS as STATIC_COUPONS, applyDiscount as staticApplyDiscount } from '../config/coupons.js';
import { findVoucher, isVoucherExpired } from './catalogStore.js';

export { applyDiscount } from '../config/coupons.js';

export function validateCoupon(code, { paidTestsCount = 0, moduleSlug = null } = {}) {
  const normalized = (code || '').trim().toUpperCase();
  if (!normalized) {
    return { valid: false, message: 'Enter a coupon code' };
  }

  const dynamic = findVoucher(normalized);
  if (dynamic) {
    if (isVoucherExpired(dynamic.expiresAt)) {
      return { valid: false, message: 'This voucher has expired' };
    }
    if (dynamic.firstTimeOnly && paidTestsCount > 0) {
      return { valid: false, message: 'This offer is for first-time bookings only' };
    }
    const slugs = Array.isArray(dynamic.moduleSlugs) && dynamic.moduleSlugs.length
      ? dynamic.moduleSlugs
      : ['all'];
    if (moduleSlug && !slugs.includes('all') && !slugs.includes(moduleSlug)) {
      return { valid: false, message: 'This voucher does not apply to the selected module' };
    }
    return {
      valid: true,
      code: normalized,
      discountPercent: dynamic.discountPercent ?? null,
      discountFixed: dynamic.discountFixed ?? null,
      label: dynamic.label || normalized,
    };
  }

  const coupon = STATIC_COUPONS[normalized];
  if (!coupon) {
    return { valid: false, message: 'Invalid coupon code' };
  }
  if (coupon.firstTimeOnly && paidTestsCount > 0) {
    return { valid: false, message: 'This offer is for first-time assessment bookings only' };
  }
  return {
    valid: true,
    code: normalized,
    discountPercent: coupon.discountPercent,
    discountFixed: null,
    label: coupon.label,
  };
}

export function applyCouponDiscount(price, couponResult) {
  if (!couponResult?.valid) return staticApplyDiscount(price, 0);
  if (couponResult.discountFixed != null) {
    const discount = Math.min(price, Math.round(couponResult.discountFixed));
    return {
      original: price,
      discount,
      final: Math.max(0, price - discount),
      discountPercent: price ? Math.round((discount / price) * 100) : 0,
    };
  }
  return staticApplyDiscount(price, couponResult.discountPercent || 0);
}
