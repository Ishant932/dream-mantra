/**
 * Guide + apply production WhatsApp sender once you finish Twilio Self Sign-up.
 *
 * I cannot finish Meta Business verification / OTP for you — that must be done
 * in the Twilio + Facebook popup in your browser.
 *
 * After your sender shows ONLINE in Twilio Console:
 *   $env:RENDER_API_KEY = "rnd_..."
 *   $env:TWILIO_WHATSAPP_FROM = "+91XXXXXXXXXX"   # your approved sender
 *   node scripts/activate-whatsapp-production.js
 */
const API = 'https://api.render.com/v1';
const SERVICE_ID = process.env.RENDER_SERVICE_ID || 'srv-d8en4919rddc73chhqh0';

async function api(path, options = {}) {
  const key = process.env.RENDER_API_KEY;
  if (!key) throw new Error('Missing RENDER_API_KEY');
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(`${res.status} ${path}: ${JSON.stringify(data)}`);
  return data;
}

async function upsertEnv(key, value) {
  await api(`/services/${SERVICE_ID}/env-vars/${encodeURIComponent(key)}`, {
    method: 'PUT',
    body: JSON.stringify({ value: String(value) }),
  });
  console.log(`  ${key} = ${value}`);
}

async function main() {
  const from = process.env.TWILIO_WHATSAPP_FROM?.trim();
  if (!from || from.includes('4155238886')) {
    console.log(`
═══════════════════════════════════════════════════════════
  CANNOT skip Meta verification — Twilio Trial / Sandbox
  cannot message ALL users without a real WhatsApp sender.
═══════════════════════════════════════════════════════════

Do this in your browser (≈15–30 mins if Meta verifies quickly):

1) Upgrade Twilio (needed for production WhatsApp):
   https://console.twilio.com/billing/upgrade

2) Create WhatsApp sender (Self Sign-up):
   https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders
   → Create new sender
   → Continue with Facebook
   → Create/link Meta Business Portfolio + WABA
   → Display name: Dream Mantra
   → Add a phone number that is NOT on personal WhatsApp
     (buy a Twilio US/IN number OR use a spare SIM)
   → Enter Meta OTP
   → Confirm Twilio access

3) Complete Meta Business Verification (documents):
   https://business.facebook.com/settings/security

4) In Twilio sender settings set webhook:
   https://dreammantra.in/api/webhooks/whatsapp  (POST)

5) Then run:
   $env:RENDER_API_KEY = "..."
   $env:TWILIO_WHATSAPP_FROM = "+91YOUR_NUMBER"
   node scripts/activate-whatsapp-production.js

Until then: signup auto-opens join WhatsApp so EVERY new user
can connect in one tap (sandbox limitation).
`);
    process.exit(from ? 1 : 0);
  }

  console.log('Switching Dream Mantra to production WhatsApp sender...\n');
  const digits = from.replace(/\D/g, '');
  await upsertEnv('WHATSAPP_ENABLED', 'true');
  await upsertEnv('WHATSAPP_PROVIDER', 'twilio');
  await upsertEnv('TWILIO_WHATSAPP_FROM', from.startsWith('+') ? from : `+${digits}`);
  await upsertEnv('TWILIO_WHATSAPP_SANDBOX', 'false');
  await upsertEnv('VITE_WHATSAPP_BUSINESS_PHONE', digits);

  console.log('\nDeploying...');
  const deploy = await api(`/services/${SERVICE_ID}/deploys`, {
    method: 'POST',
    body: JSON.stringify({ clearCache: 'clear' }),
  });
  const d = deploy.deploy || deploy;
  console.log(`Deploy: ${d.id} (${d.status})`);
  console.log('\nVerify: curl https://dreammantra.in/api/health');
  console.log('Expect: "sandbox":false');
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
