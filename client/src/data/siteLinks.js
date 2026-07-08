/**
 * Central site navigation links — footer, quick menus, etc.
 * Single source of truth for URLs and labels across the site.
 */

/** Footer — Quick Links column */
export const footerQuickLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/pillars', label: '7 Pillars' },
  { to: '/careers', label: 'Career Library' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/counselling', label: 'Counselling' },
  { to: '/contact', label: 'Contact' },
  { to: '/terms', label: 'Terms & Conditions' },
  { to: '/privacy', label: 'Privacy Policy' },
];

/** Footer — Programs & Assessments column */
export const footerPrograms = [
  { to: '/programs/class-1-5', label: 'Class 1-5' },
  { to: '/programs/class-6-8', label: 'Class 6-8' },
  { to: '/programs/class-9-10', label: 'Class 9-10' },
  { to: '/programs/class-11-12', label: 'Class 11-12' },
  { to: '/programs/college-students', label: 'College Students' },
  { to: '/programs/working-professionals', label: 'Working Professionals' },
  { to: '/assessments/dmit', label: 'Mind Mapping' },
  { to: '/assessments/psychometric', label: 'Skill Mapping' },
  { to: '/assessments/dmit-psychometric', label: 'Mind Mapping + Skill Mapping' },
  { to: '/assessments/why-dreams-mantra', label: 'Why Career Counselling' },
  { to: '/crp', label: 'AI Career Launchpad' },
  { to: '/counsellors', label: 'Join as Counsellor' },
];

/** Free Twilio WhatsApp Sandbox number. Production overrides via VITE_WHATSAPP_BUSINESS_PHONE. */
export const WHATSAPP_AGENT_PHONE = (
  import.meta.env.VITE_WHATSAPP_BUSINESS_PHONE || '14155238886'
).replace(/\D/g, '');

const AGENT_PREFILL =
  'Hi Esh! I want career guidance from Dream Mantra 🚀';

/**
 * Opens WhatsApp chat with the AI agent.
 * Free sandbox ALWAYS needs a one-tap "join …" first (Twilio/Meta rule — not optional).
 */
export function getWhatsAppAgentLink(opts = {}) {
  const options = typeof opts === 'string' ? { text: opts } : (opts || {});
  const joinCode = (options.joinCode || import.meta.env.VITE_WHATSAPP_SANDBOX_CODE || 'join atomic-later').trim();
  // Default to sandbox join on free plan (production can pass sandbox:false)
  const useSandbox = options.sandbox !== false;
  let text = options.text;
  if (!text) {
    text = useSandbox ? joinCode : AGENT_PREFILL;
  }
  return `https://wa.me/${WHATSAPP_AGENT_PHONE}?text=${encodeURIComponent(text)}`;
}

export const footerSocial = {
  /** Office / team WhatsApp (fixed business line). FAB uses getWhatsAppAgentLink() for AI agent. */
  whatsapp: 'https://api.whatsapp.com/send/?phone=919680102276&text&type=phone_number&app_absent=0',
  whatsappAgent: getWhatsAppAgentLink({ sandbox: true }),
  instagram: 'https://www.instagram.com/dream.mantra/',
  linkedin: 'https://www.linkedin.com/company/dreammantra',
  facebook: 'https://www.facebook.com/people/Dreamz/61577007261235/',
};

/** Jaipur centres + pan-India online — map links for footer & site-wide use */
export const JAIPUR_LOCATIONS = [
  { name: 'Raja Park', mapUrl: 'https://maps.app.goo.gl/7DjoroaKSUi2srsE9' },
  { name: 'Shastri Nagar', mapUrl: 'https://maps.app.goo.gl/yNpFN3hdMyvLnUrk9' },
  { name: 'Nirman Nagar', mapUrl: 'https://maps.app.goo.gl/Xns95EsMy79wUAEDA' },
  { name: 'Pan-India Online', online: true },
];

/** Partner category display order — matches Dreamz Roadmap partner page */
export const PARTNER_DISPLAY_ORDER = [
  'teachers',
  'corporates',
  'coaching-centers',
  'colleges',
  'schools',
  'referral-partner',
];
