export const COUPONS = {
  DREAMS20: {
    code: 'DREAMS20',
    discountPercent: 20,
    label: 'First assessment — 20% off',
    firstTimeOnly: true,
    active: false,
    visibility: 'selected_users',
    allowedUserIds: [],
  },
};

export function validateCoupon(code, { paidTestsCount = 0 } = {}) {
  const normalized = (code || '').trim().toUpperCase();
  const coupon = COUPONS[normalized];
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
    label: coupon.label,
  };
}

export function applyDiscount(price, discountPercent) {
  const discount = Math.round((price * discountPercent) / 100);
  return {
    original: price,
    discount,
    final: Math.max(0, price - discount),
    discountPercent,
  };
}
