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
  return Math.round(price * (1 - discountPercent / 100));
}
