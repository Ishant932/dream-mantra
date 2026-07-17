/**
 * Dream Mantra WhatsApp message catalog — rich, emoji-heavy, link-rich templates.
 * Twilio sandbox sends plain text; Meta maps to Content SIDs in production.
 */
import { siteUrl } from './config.js';
import {
  banner,
  bullet,
  cta,
  fireBar,
  miniPulse,
  priceTag,
  progressBar,
  sparkleBar,
} from './format.js';

export function supportLine() {
  return process.env.SUPPORT_EMAIL?.trim() || 'info@dreammantra.in';
}

export function messageCatalog(trigger, user, extra = {}) {
  const name = user?.name?.split(' ')[0] || 'there';
  const uid = user?.user_uid || '';
  const base = siteUrl();

  const messages = {
    registration_success: `${sparkleBar()}
${banner('Welcome to Dream Mantra', '🎉', '🎉')}

Hey *${name}*! ${miniPulse('🚀', '💫', '🌟')}
Your *Dream Mantra* account is *LIVE* ✅

🆔 *Dreams ID:* \`${uid}\`
📊 Journey: ${progressBar(25)}

${fireBar()}
*What you can do right now:*
${bullet('🧠', 'Brain Mapping — discover your strengths')}
${bullet('🎯', 'Skill Mapping — map skills to careers')}
${bullet('💼', '1:1 Career Counselling')}
${bullet('🤖', 'AI Career Launchpad community')}

${cta('Open your dashboard', `${base}/dashboard`)}
${cta('Explore modules & pricing', `${base}/dashboard?tab=assess`)}

💬 Reply *MENU* for quick options
🤖 Ask *Esh* anything — careers, courses, counselling!
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

Hi *${name}*! Our most-loved career modules:

${priceTag('Brain Mapping', '₹1,999', 'Deep personality + career fit')}
${priceTag('Skill Mapping', '₹699', 'Skills → job roles')}
${priceTag('Combo + Counselling', '₹2,999', 'Best value — tests + session')}
${priceTag('AI Career Launchpad', '₹1,499', 'Community + mentorship')}

${cta('Browse & pay securely', `${base}/dashboard?tab=assess`)}
${cta('See all programs', `${base}/programs`)}

Reply *1* for full pricing breakdown 💬`,

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

${bullet('📊', 'Dashboard updated')}
${bullet('📝', 'Tests unlocked')}
${bullet('📅', 'Book counselling when ready')}

${cta('Go to dashboard', `${base}/dashboard?tab=assess`)}
${sparkleBar()}`,

    payment_proof_pending: `${banner('Proof received', '📋', '⏳')}

Hi *${name}*! We got your payment proof for *${extra.moduleTitle || 'your module'}* ✅

🔍 Status: *Under verification*
⏱️ Usually confirmed within *24 hours*

${cta('Track on dashboard', `${base}/dashboard`)}

We'll WhatsApp you the moment it's approved! 🔔`,

    session_reminder: `${banner('Counselling reminder', '📅', '🔔')}

Hi *${name}*! Your session is coming up ⏰

🗓️ *Date:* ${extra.sessionDate || 'See dashboard'}
🕐 *Time:* ${extra.sessionTime || 'See dashboard'}

${bullet('💻', 'Join from dashboard link')}
${bullet('📝', 'Keep your Dreams ID handy')}
${bullet('🎯', 'List 2–3 career questions')}

${cta('Open session details', `${base}/dashboard?tab=book`)}

_Good luck — you've got this!_ 🌟`,

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

    chat_welcome: `${sparkleBar()}
${banner("I'm Esh — your AI counsellor", '🤖', '✨')}

Dream Mantra's 24/7 career buddy at your service! 💬

*Quick menu — reply with a number:*
1️⃣ 💎 Modules & pricing
2️⃣ 📅 Book counselling
3️⃣ 🆔 My Dreams ID
4️⃣ 🆘 Talk to support

Or just *type your question* — careers, courses, payments, anything! 🚀
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
  };

  return messages[trigger] || null;
}
