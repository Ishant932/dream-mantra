/**
 * Dream Mantra WhatsApp message catalog (ecommerce-style automated messages).
 * Twilio sends these as plain text in sandbox; map to Content SIDs in production.
 */
import { siteUrl } from './config.js';

export function supportLine() {
  return process.env.SUPPORT_EMAIL?.trim() || 'info@dreammantra.in';
}

export function messageCatalog(trigger, user, extra = {}) {
  const name = user?.name?.split(' ')[0] || 'there';
  const uid = user?.user_uid || '';
  const base = siteUrl();

  const messages = {
    registration_success: `🎉 *Welcome to Dream Mantra, ${name}!*

✅ Your registration is successful.
🆔 Dreams ID: *${uid}*

👉 Complete your profile: ${base}/dashboard

Reply *MENU* for quick options or ask me about Mind Mapping, Skill Mapping, careers & counselling.`,

    welcome_step1: `Hi ${name}! 👋 Welcome to Dream Mantra.

Your Dreams ID is *${uid}*.
Start here: ${base}/dashboard

Reply *MENU* anytime.`,

    welcome_step2: `Hi ${name}, complete your Dream Mantra profile to unlock counselling & tests.

📝 Add class, stream, career goal & WhatsApp number:
${base}/dashboard`,

    welcome_step3: `Hi ${name}! Explore our modules:

• Mind Mapping — ₹1,999
• Skill Mapping — ₹699
• Combo + Counselling — ₹2,999
• AI Career Launchpad — ₹1,499

Browse: ${base}/dashboard?tab=assess`,

    welcome_step4: `Hi ${name}! After payment, book counselling from Dashboard → Book tab.

${base}/dashboard?tab=book

Reply *HELP* to reach our team.`,

    profile_reminder: `⏰ Hi ${name}, your Dream Mantra profile is incomplete.

Complete it to unlock modules, tests & counselling:
${base}/dashboard`,

    profile_complete: `✅ Great work, ${name}! Your profile is complete.

Explore modules & book your career journey:
${base}/dashboard?tab=assess`,

    payment_reminder: `🛒 Hi ${name}, payment pending for *${extra.moduleTitle || 'your module'}*.

Complete payment here:
${extra.paymentUrl || `${base}/dashboard?tab=assess`}`,

    payment_confirmed: `✅ Payment confirmed, ${name}!

*${extra.moduleTitle || 'Your module'}* is now active in your dashboard.
${base}/dashboard?tab=assess`,

    payment_proof_pending: `📋 Hi ${name}, we received your payment proof for *${extra.moduleTitle || 'your module'}*.

Our team is verifying it. You'll get a confirmation soon.
${base}/dashboard`,

    session_reminder: `📅 *Counselling reminder*

Hi ${name}, your session is on *${extra.sessionDate || 'your date'}* at *${extra.sessionTime || 'your time'}*.

Check your dashboard for details: ${base}/dashboard?tab=book`,

    report_ready: `📄 Hi ${name}, your *${extra.reportTitle || 'assessment report'}* is ready!

View & download: ${base}/dashboard?tab=reports`,

    test_reminder: `📝 Hi ${name}, your *${extra.moduleTitle || 'module'}* is active.

Complete your test: Dashboard → Modules → Take test
${base}/dashboard?tab=assess`,

    community_invite: `👥 Hi ${name}, join the AI Career Launchpad community (Step 5 after payment).

${base}/dashboard?tab=assess`,

    booking_confirmed: `✅ Session booked, ${name}!

Date: ${extra.sessionDate || 'scheduled'}
Time: ${extra.sessionTime || 'see dashboard'}

${base}/dashboard?tab=book`,

    chat_welcome: `Hi! I'm *Esh*, Dream Mantra's AI counsellor 🤖

Reply with a number:
1️⃣ Modules & pricing
2️⃣ Book counselling
3️⃣ My Dreams ID
4️⃣ Talk to support

Or type your question directly!`,
  };

  return messages[trigger] || null;
}
