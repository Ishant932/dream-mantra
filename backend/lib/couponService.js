import { findStoredVoucher, findVoucher, isVoucherExpired } from './catalogStore.js';

export { applyDiscount } from '../config/coupons.js';
import { applyDiscount as staticApplyDiscount } from '../config/coupons.js';

function voucherStartsOk(startsAt, now = new Date()) {
  if (!startsAt) return true;
  const raw = String(startsAt).trim();
  const start = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T00:00:00.000`)
    : new Date(raw);
  if (Number.isNaN(start.getTime())) return true;
  return start <= now;
}

function voucherVisibleToUser(voucher, userId) {
  const mode = voucher.visibility || 'everyone';
  if (mode === 'hidden') return false;
  if (mode !== 'selected_users') return true;
  const uid = userId != null ? Number(userId) : null;
  const ids = Array.isArray(voucher.allowedUserIds) ? voucher.allowedUserIds.map(Number) : [];
  return uid != null && ids.includes(uid);
}

function validateStoredVoucher(stored, { paidTestsCount, moduleSlug, userId } = {}) {
  if (stored.active === false) {
    return { valid: false, message: 'This voucher is no longer active' };
  }
  if (!voucherStartsOk(stored.startsAt)) {
    return { valid: false, message: 'This voucher is not active yet' };
  }
  if (isVoucherExpired(stored.expiresAt)) {
    return { valid: false, message: 'This voucher has expired' };
  }
  if (!voucherVisibleToUser(stored, userId)) {
    return { valid: false, message: 'This voucher is not available for your account' };
  }
  if (stored.firstTimeOnly && paidTestsCount > 0) {
    return { valid: false, message: 'This offer is for first-time bookings only' };
  }
  const slugs = Array.isArray(stored.moduleSlugs) && stored.moduleSlugs.length
    ? stored.moduleSlugs
    : ['all'];
  if (moduleSlug && !slugs.includes('all') && !slugs.includes(moduleSlug)) {
    return { valid: false, message: 'This voucher does not apply to the selected module' };
  }
  return {
    valid: true,
    code: stored.code,
    discountPercent: stored.discountPercent ?? null,
    discountFixed: stored.discountFixed ?? null,
    label: stored.label || stored.code,
  };
}

export function validateCoupon(code, { paidTestsCount = 0, moduleSlug = null, userId = null } = {}) {
  const normalized = (code || '').trim().toUpperCase();
  if (!normalized) {
    return { valid: false, message: 'Enter a coupon code' };
  }

  const stored = findStoredVoucher(normalized);
  if (stored) {
    return validateStoredVoucher({ ...stored, code: normalized }, { paidTestsCount, moduleSlug, userId });
  }

  const dynamic = findVoucher(normalized);
  if (dynamic) {
    if (!voucherStartsOk(dynamic.startsAt)) {
      return { valid: false, message: 'This voucher is not active yet' };
    }
    if (isVoucherExpired(dynamic.expiresAt)) {
      return { valid: false, message: 'This voucher has expired' };
    }
    if (!voucherVisibleToUser(dynamic, userId)) {
      return { valid: false, message: 'This voucher is not available for your account' };
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

  return { valid: false, message: 'Invalid or inactive coupon code' };
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
