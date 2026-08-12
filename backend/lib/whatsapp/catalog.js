/**
 * Dream Mantra WhatsApp message catalog — rich, emoji-heavy, link-rich templates.
 * Twilio sandbox sends plain text; Meta maps to Content SIDs in production.
 */
import { siteUrl } from './config.js';
import { getTemplateOverride, applyTemplateVars, getJoinPhrase } from './adminConfig.js';
import {
  banner,
  bullet,
  contactBlock,
  cta,
  fireBar,
  miniPulse,
  priceTag,
  progressBar,
  sparkleBar,
  starTrail,
  trustBadge,
  waveBar,
  animatedDivider,
} from './format.js';

export function supportLine() {
  return process.env.SUPPORT_EMAIL?.trim() || 'info@dreammantra.in';
}

const SAMPLE_EXTRA = {
  joinPhrase: 'join dream-mantra',
  moduleTitle: 'Brain Mapping',
  sessionDate: '15 Mar 2026',
  sessionTime: '4:00 PM',
  reportTitle: 'Brain Mapping Report',
  statusSummary: '2 of 3 modules complete',
  progressPercent: 60,
  phoneDisplay: '+91 98765 43210',
  modulesSummary: '• Brain Mapping: Done\n• Skill Mapping: Pending',
};

export function buildDefaultMessage(trigger, user, extra = {}) {
  const name = user?.name?.split(' ')[0] || 'there';
  const uid = user?.user_uid || '';
  const base = siteUrl();

  const messages = {
    sandbox_join_prompt: `${waveBar()}
${banner('Connect with Dream Mantra', '💬', '🚀')}

Hi! To start chatting with *Esh* (our AI career counsellor) on WhatsApp:

📲 Send this exact message:
👉 *${extra.joinPhrase || 'join dream-mantra'}*

${animatedDivider()}
${trustBadge()}

_After you join, ask about Brain Mapping, Skill Mapping, counselling, or pricing — we're here 24/7!_
${sparkleBar()}`,

    registration_success: `${sparkleBar()}
${banner('Welcome to Dream Mantra', '🎉', '🎉')}

Hey *${name}*! ${miniPulse('🚀', '💫', '🌟')}
Your *Dream Mantra* account is *LIVE* ✅

🆔 *Dreams ID:* \`${uid}\`
📊 Journey: ${progressBar(25)}
${trustBadge()}

${fireBar()}
*What you can do right now:*
${bullet('🧠', 'Brain Mapping (₹1,999) — fingerprint-based talent mapping')}
${bullet('🎯', 'Skill Mapping (₹699) — personality + career fit')}
${bullet('💼', '1:1 Career Counselling — included in combo packages')}
${bullet('🤖', 'AI Career Launchpad (₹1,499) — community + mentorship')}

${cta('Open your dashboard', `${base}/dashboard`)}
${cta('Explore modules & pricing', `${base}/dashboard?tab=assess`)}
${cta('Book free guidance call', `${base}/contact`)}

${contactBlock(base)}
💬 Reply *MENU* for quick options · Type *HELP* for human support
${starTrail()}
${sparkleBar()}`,

    welcome_step1: `${miniPulse('👋', '✨', '🌟')}
Hi *${name}*! Welcome to *Dream Mantra* — India's AI-powered career platform.

🆔 Your Dreams ID: *\`${uid}\`*
📊 Profile: ${progressBar(30)}

${cta('Start here — complete profile', `${base}/dashboard`)}

Reply *MENU* anytime · Type *HELP* for human support`,

    welcome_step2: `${banner('Profile boost needed', '⏰', '✨')}

Hi *${name}*, you're *so close* to unlocking everything! 🔓

${progressBar(45)}

Add these to shine on your dashboard:
${bullet('🎓', 'Class & stream')}
${bullet('🎯', 'Career goal')}
${bullet('📱', 'WhatsApp number (for alerts)')}

${cta('Complete profile in 2 mins', `${base}/dashboard`)}

_Tip:_ Complete profile → unlock tests, reports & counselling booking 🚀`,

    welcome_step3: `${banner('Pick your power-up', '💎', '🔥')}

Hi *${name}*! Our most-loved programs:

${priceTag('Brain Mapping', '₹1,999', 'Fingerprint talent mapping')}
${priceTag('Skill Mapping', '₹699', '7 psychometric frameworks')}
${priceTag('Combo + Counselling', '₹2,999', 'Best value — tests + session')}
${priceTag('AI Career Launchpad', '₹1,499', '5 job-ready sessions')}
${priceTag('Personalised Career Readiness', '₹2,999', '8 sessions + 2 mocks + placement')}

${cta('Browse & pay securely', `${base}/dashboard?tab=assess`)}
${cta('Career Readiness details', `${base}/crp?tab=readiness`)}
${cta('See all programs', `${base}/programs`)}

Reply *1* for full pricing · Ask about *Career Readiness* anytime 💬`,

    welcome_step4: `${banner('Book your session', '📅', '✨')}

*${name}*, payment done? Amazing! 🎊

Next step → *Book counselling* from your dashboard:
${bullet('1️⃣', 'Dashboard → *Book* tab')}
${bullet('2️⃣', 'Pick date & time')}
${bullet('3️⃣', 'Get session link on WhatsApp + email')}

${cta('Book counselling now', `${base}/dashboard?tab=book`)}

Need help? Reply *HELP* — we're Mon–Sat 11am–7pm IST 🙌`,

    profile_reminder: `${banner('Profile incomplete', '⏰', '🔔')}

Hi *${name}*! Your Dream Mantra profile is still at ${progressBar(40)}

Without it you miss:
${bullet('❌', 'Personalized career reports')}
${bullet('❌', 'Test access')}
${bullet('❌', 'Counselling booking')}

${cta('Finish profile now (2 min)', `${base}/dashboard`)}

_We sent this because you opted in for WhatsApp updates._`,

    profile_complete: `${sparkleBar()}
${banner('Profile complete!', '✅', '🎉')}

*${name}*, you're all set! ${miniPulse('🚀', '💫', '⭐')}
Profile: ${progressBar(100)}

${bullet('✅', 'Modules unlocked')}
${bullet('✅', 'Tests ready')}
${bullet('✅', 'Counselling booking open')}

${cta('Explore modules', `${base}/dashboard?tab=assess`)}
${cta('Book a session', `${base}/dashboard?tab=book`)}
${sparkleBar()}`,

    payment_reminder: `${banner('Payment pending', '🛒', '💳')}

Hi *${name}*! Your cart is waiting 🛍️

📦 *${extra.moduleTitle || 'Your module'}*
💰 Complete payment to activate instantly

${cta('Pay now — secure checkout', extra.paymentUrl || `${base}/dashboard?tab=assess`)}

_Questions? Reply *HELP* or ask Esh anything._`,

    payment_confirmed: `${fireBar()}
${banner('Payment confirmed!', '✅', '🎊')}

*${name}*, you're in! 🚀

🎁 *${extra.moduleTitle || 'Your module'}* is now *ACTIVE*
🆔 Dreams ID: \`${uid}\`

${bullet('📊', 'Dashboard updated with your purchase')}
${bullet('📝', 'Tests & reports unlocked')}
${bullet('📅', 'Book counselling when profile + tests are ready')}
${bullet('📱', 'We will WhatsApp you at every step')}

${cta('Go to dashboard', `${base}/dashboard?tab=assess`)}
${cta('Complete profile (2 min)', `${base}/dashboard`)}

${contactBlock(base)}
${starTrail()}
${sparkleBar()}`,

    payment_proof_pending: `${banner('Proof received', '📋', '⏳')}

Hi *${name}*! We got your payment proof for *${extra.moduleTitle || 'your module'}* ✅

🔍 Status: *Under verification*
⏱️ Usually confirmed within *24 hours*

${cta('Track on dashboard', `${base}/dashboard`)}

We'll WhatsApp you the moment it's approved! 🔔`,

    session_reminder: `${banner('Counselling reminder', '📅', '🔔')}

Hi *${name}*! Your Dream Mantra session is coming up ⏰

🗓️ *Date:* ${extra.sessionDate || 'See dashboard'}
🕐 *Time:* ${extra.sessionTime || 'See dashboard'} *(IST)*

*Before you join:*
${bullet('💻', 'Open dashboard → Counselling → My booked sessions')}
${bullet('📝', 'Keep your Dreams ID handy: `' + (uid || 'see dashboard') + '`')}
${bullet('🎯', 'List 2–3 career questions for your counsellor')}
${bullet('👨‍👩‍👧', 'Parents welcome to join the session')}

${cta('Open session details & join link', `${base}/dashboard?tab=counselling`)}

${contactBlock(base)}
_Good luck — you've got this!_ ${miniPulse('🌟', '💪')}
${starTrail()}`,

    report_ready: `${banner('Report ready!', '📄', '✨')}

*${name}*, your *${extra.reportTitle || 'assessment report'}* is ready to download! 🎉

${bullet('📊', 'Career insights & scores')}
${bullet('🎯', 'Recommended paths')}
${bullet('💡', 'Next-step action plan')}

${cta('View & download report', `${base}/dashboard?tab=reports`)}

Share with parents — they'll love it 👨‍👩‍👧`,

    test_reminder: `${banner('Test waiting for you', '📝', '⚡')}

Hi *${name}*! *${extra.moduleTitle || 'Your module'}* is active — time to take the test! 🧠

${progressBar(60)}
${bullet('⏱️', '~20–30 mins')}
${bullet('📱', 'Works on phone')}
${bullet('📄', 'Report auto-generated')}

${cta('Start test now', `${base}/dashboard?tab=assess`)}

Reply *MENU* if you need help navigating 🙌`,

    community_invite: `${banner('Join the community', '👥', '🚀')}

*${name}*, welcome to the *AI Career Launchpad* inner circle! ✨

${bullet('🤝', 'Peer network of ambitious students')}
${bullet('💼', 'Industry mentors & tips')}
${bullet('🎯', 'Weekly career challenges')}

${cta('Enter community (Step 5)', `${base}/dashboard?tab=assess`)}
${cta('Learn about Launchpad', `${base}/programs`)}

Let's grow together 🔥`,

    booking_confirmed: `${sparkleBar()}
${banner('Session booked!', '✅', '📅')}

*${name}*, you're on the calendar! 🎊

🗓️ *${extra.sessionDate || 'Scheduled'}*
🕐 *${extra.sessionTime || 'See dashboard'}*

${cta('View booking & join link', `${base}/dashboard?tab=book`)}
${sparkleBar()}`,

    whatsapp_menu: `${sparkleBar()}
${banner('Dream Mantra Menu', '📋', '✨')}

*Reply with a number:*

1️⃣ 💎 Modules & pricing (Brain / Skill / Combo)
2️⃣ 📅 Book counselling session
3️⃣ 🤖 AI Career Launchpad (₹1,499)
4️⃣ 🎯 Personalised Career Readiness (₹2,999)
5️⃣ 🆔 My Dreams ID & dashboard
6️⃣ 🆘 Support & contact

Or *type any question* — careers, streams, payments, booking! 🚀
${cta('Open website', base)}
${miniPulse('💬', '✨', '🌟')}`,

    join_welcome: `${sparkleBar()}
${banner('Welcome to Dream Mantra!', '🎉', '🚀')}

Hey *${name}*! ${miniPulse('✨', '💫', '🌟')}
You're connected with *Esh* — our AI career counsellor on WhatsApp 💬

${trustBadge()}

${waveBar()}
*Your quick menu — reply with a number:*

1️⃣ 💎 Modules & pricing
2️⃣ 📅 Book counselling
3️⃣ 🤖 AI Career Launchpad (₹1,499)
4️⃣ 🎯 Career Readiness Program (₹2,999)
5️⃣ 🆔 Dreams ID & dashboard
6️⃣ 🆘 Support

${uid ? `🆔 *Your Dreams ID:* \`${uid}\`\n` : ''}${cta('Explore dashboard', `${base}/dashboard`)}
${cta('Book free guidance', `${base}/contact`)}

_Type any question_ — Brain Mapping, Skill Mapping, Class 9–12 streams, jobs & more!
${contactBlock(base)}
${starTrail()}
${sparkleBar()}`,

    chat_welcome: `${sparkleBar()}
${banner("I'm Esh — Dream Mantra AI Counsellor", '🤖', '✨')}

${waveBar()}
Your 24/7 career buddy — Brain Mapping, Skill Mapping, AI Launchpad, Career Readiness & counselling! 💬

${trustBadge()}

*Quick menu — reply with a number:*
1️⃣ 💎 Modules & pricing
2️⃣ 📅 Book counselling session
3️⃣ 🤖 AI Career Launchpad (₹1,499)
4️⃣ 🎯 Career Readiness Program (₹2,999)
5️⃣ 🆔 My Dreams ID & dashboard
6️⃣ 🆘 Talk to our team

Or *type your question* — careers, courses, payments, Class 9–12 streams, anything! 🚀

${contactBlock(base)}
${starTrail()}
${sparkleBar()}`,

    test_complete: `${fireBar()}
${banner('Module test complete!', '✅', '🎊')}

*${name}*, great work finishing *${extra.moduleTitle || 'your module'}*! 🧠

📊 *Your status:*
${extra.statusSummary || 'Progress updated on your dashboard'}

${bullet('📄', 'Report will be prepared by our team')}
${bullet('📅', 'Book counselling when you are ready')}

${cta('View dashboard', `${base}/dashboard`)}
${sparkleBar()}`,

    all_tests_complete: `${sparkleBar()}
${banner('All tests complete!', '🏆', '🎉')}

*${name}*, you have finished *all* your paid module tests! 🚀

📊 *Status:* ${extra.statusSummary || 'All modules complete'}
Journey: ${progressBar(95)}

${bullet('📄', 'Reports & counselling next')}
${bullet('🎯', 'Our team will review your profile')}

${cta('Book counselling', `${base}/dashboard?tab=book`)}
${cta('View reports', `${base}/dashboard?tab=reports`)}
${sparkleBar()}`,

    journey_status: `${banner('Your Dream Mantra status', '📊', '✨')}

Hi *${name}*! Here is your latest journey update:

Journey: ${progressBar(extra.progressPercent || 50)}

📋 *${extra.statusSummary || 'Keep going — you are on track!'}*

${cta('Continue on dashboard', `${base}/dashboard`)}

Reply *MENU* for quick help · Ask Esh anything 💬`,

    admin_all_tests_complete: `🎓 *ALL TESTS COMPLETE — Admin alert*

*Student:* ${name}
🆔 Dreams ID: \`${uid}\`
📱 Phone: ${extra.phoneDisplay || '—'}

📊 *Status:*
${extra.statusSummary || 'All paid module tests finished'}

📦 *Modules:*
${extra.modulesSummary || extra.moduleTitle || 'See admin panel'}

${cta('Open admin dashboard', `${base}/admin`)}`,

    career_readiness_intro: `${fireBar()}
${banner('Career Readiness Program activated!', '🎯', '🚀')}

*${name}*, welcome to the *Personalised Career Readiness Program*! ${miniPulse('💼', '✨', '🌟')}

🎁 *₹2,999 package now ACTIVE* — your complete career launch system:

${bullet('🧠', 'Brain Mapping + Skill Mapping assessments')}
${bullet('💼', 'Expert counselling session included')}
${bullet('📅', '8 LIVE sessions — Know Yourself → … → Offer & Launch')}
${bullet('🎤', '2 mock interviews with personalised feedback')}
${bullet('🔗', 'LinkedIn, CV & Naukri profile reviews')}
${bullet('🤖', 'AI-powered job search + interview mastery')}

*Your next steps:*
${bullet('1️⃣', 'Complete profile on dashboard')}
${bullet('2️⃣', 'Finish Brain Mapping + Skill Mapping tests')}
${bullet('3️⃣', 'Training tab → schedule all 8 sessions in order')}
${bullet('4️⃣', 'After session 8 → book 2 mock interview slots')}

${cta('Open Training dashboard', `${base}/dashboard?tab=training&focus=readiness`)}
${cta('Program details', `${base}/crp?tab=readiness`)}

${contactBlock(base)}
${starTrail()}
${sparkleBar()}`,

    career_readiness_schedule_reminder: `${banner('Schedule your sessions', '📅', '⏰')}

Hi *${name}*! Your *Career Readiness Program* is active — time to book your 8 live sessions! 🎯

${progressBar(35)}
${bullet('📋', 'Session 1 → Session 8 in order from Training tab')}
${bullet('🎤', 'Mock interviews unlock after all 8 are scheduled')}
${bullet('💡', 'Each session builds: clarity → direction → brand → job search → interviews → launch')}

${cta('Schedule sessions now', `${base}/dashboard?tab=training&focus=readiness`)}
${cta('View session list', `${base}/crp?tab=readiness`)}

Questions? Reply *HELP* or ask Esh anything 💬
${contactBlock(base)}`,
  };

  return messages[trigger] || null;
}

export function messageCatalog(trigger, user, extra = {}) {
  const mergedExtra = { joinPhrase: getJoinPhrase(), ...extra };
  const override = getTemplateOverride(trigger);
  if (override) return applyTemplateVars(override, user, mergedExtra);
  return buildDefaultMessage(trigger, user, mergedExtra);
}

export function messageCatalogDefault(trigger) {
  return buildDefaultMessage(
    trigger,
    { name: 'Student', user_uid: 'DM-12345' },
    SAMPLE_EXTRA,
  );
}
