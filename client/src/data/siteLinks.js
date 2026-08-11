/**
 * Central site navigation links — footer, quick menus, etc.
 * Single source of truth for URLs and labels across the site.
 */

/** Footer — Quick Links column */
export const footerQuickLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/careers', label: 'Career Library' },
  { to: '/marketplace', label: 'Book Now' },
  { to: '/counselling', label: 'Counselling' },
  { to: '/contact', label: 'Contact' },
  { to: '/terms', label: 'Terms & Conditions' },
];

/** Footer — Programs & Assessments column */
export const footerPrograms = [
  { to: '/programs/class-1-5', label: 'Class 1-5' },
  { to: '/programs/class-6-8', label: 'Class 6-8' },
  { to: '/programs/class-9-10', label: 'Class 9-10' },
  { to: '/programs/class-11-12', label: 'Class 11-12' },
  { to: '/programs/college-students', label: 'College Students' },
  { to: '/programs/working-professionals', label: 'Working Professionals' },
  { to: '/counselling/brain-mapping', label: 'Brain Mapping' },
  { to: '/counselling/skill-mapping', label: 'Skill Mapping' },
  { to: '/counselling/combo', label: 'Brain Mapping + Skill Mapping' },
  { to: '/counselling/why', label: 'Why Career Counselling' },
  { to: '/crp', label: 'AI Career Launchpad' },
];

/** Institutions / partner card display order */
export const PARTNER_DISPLAY_ORDER = [
  'schools',
  'coaching-centers',
  'colleges',
  'corporates',
  'teachers',
  'referral-partner',
];

export const JAIPUR_LOCATIONS = [
  { name: 'Raja Park', mapUrl: 'https://maps.app.goo.gl/7DjoroaKSUi2srsE9' },
  { name: 'Shastri Nagar', mapUrl: 'https://maps.app.goo.gl/yNpFN3hdMyvLnUrk9' },
  { name: 'Nirman Nagar', mapUrl: 'https://maps.app.goo.gl/Xns95EsMy79wUAEDA' },
  { name: 'Pan-India Online', online: true },
];

/** Free Twilio WhatsApp Sandbox number. Production overrides via VITE_WHATSAPP_BUSINESS_PHONE. */
export const WHATSAPP_AGENT_PHONE = (
  import.meta.env.VITE_WHATSAPP_BUSINESS_PHONE || '14155238886'
).replace(/\D/g, '');

const BUSINESS_WHATSAPP_PHONE = '919680102276';

const DEFAULT_JOIN_MSG = 'join dream-mantra';

export const footerSocial = {
  whatsapp: `https://wa.me/${BUSINESS_WHATSAPP_PHONE}`,
  instagram: 'https://www.instagram.com/dream.mantra/',
  linkedin: 'https://www.linkedin.com/company/dreammantra',
  facebook: 'https://www.facebook.com/dreammantra',
};

export function getWhatsAppHref(message = DEFAULT_JOIN_MSG) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${BUSINESS_WHATSAPP_PHONE}?text=${text}`;
}

/**
 * WhatsApp agent / sandbox join link.
 * Default prefill is always "join dream-mantra" so Esh replies with menu instantly.
 * @param {{ text?: string, sandbox?: boolean, joinCode?: string }} [opts]
 */
export function getWhatsAppAgentLink({ text, sandbox = false, joinCode } = {}) {
  const code = (joinCode || 'dream-mantra').trim();
  const joinMsg = /^join\s+/i.test(code) ? code : `join ${code}`;
  const msg = text || joinMsg;
  const phone = sandbox ? WHATSAPP_AGENT_PHONE : WHATSAPP_AGENT_PHONE;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}
