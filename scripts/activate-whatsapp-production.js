/**
 * Activate Dream Mantra WhatsApp for ALL users (no join code).
 *
 * Prerequisite (one-time, ~10 mins — only you can do this in a browser):
 *   1. Open: https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders
 *   2. Click "Create new sender"
 *   3. Select phone: +1 424 497 2690  (already purchased for Dream Mantra)
 *   4. Continue with Facebook → create Meta Business + WhatsApp Business Account
 *   5. Display name: Dream Mantra | Category: Education
 *   6. Complete OTP (shown in Twilio Console) + Confirm
 *   7. Set webhook: https://dreammantra.in/api/webhooks/whatsapp (POST)
 *
 * Then run:
 *   $env:RENDER_API_KEY = "rnd_..."
 *   node scripts/activate-whatsapp-production.js
 *
 * Optional override:
 *   $env:TWILIO_WHATSAPP_FROM = "+14244972690"
 */
const API = 'https://api.render.com/v1';
const SERVICE_ID = process.env.RENDER_SERVICE_ID || 'srv-d8en4919rddc73chhqh0';
const DEFAULT_FROM = '+14244972690';
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID?.trim() || '';
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN?.trim() || '';

async function renderApi(path, options = {}) {
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
  await renderApi(`/services/${SERVICE_ID}/env-vars/${encodeURIComponent(key)}`, {
    method: 'PUT',
    body: JSON.stringify({ value: String(value) }),
  });
  console.log(`  ${key} = ${value}`);
}

async function listOnlineSenders() {
  const token = TWILIO_TOKEN || process.env.TWILIO_AUTH_TOKEN;
  if (!token) return [];
  const auth = Buffer.from(`${TWILIO_SID}:${token}`).toString('base64');
  const res = await fetch('https://messaging.twilio.com/v2/Channels/Senders?Channel=whatsapp', {
    headers: { Authorization: `Basic ${auth}` },
  });
  const data = await res.json();
  return (data.senders || []).filter((s) => {
    const id = s.sender_id || '';
    if (id.includes('4155238886')) return false; // skip sandbox
    return String(s.status || '').toUpperCase() === 'ONLINE';
  });
}

function printGuide() {
  console.log(`
════════════════════════════════════════════════════════════════
  WhatsApp for ALL users = Dream Mantra Business Sender
  Sandbox CANNOT do this. One Meta link is required (once).
════════════════════════════════════════════════════════════════

Phone already bought for you:  +1 424 497 2690

DO THIS NOW (browser, ~10 minutes):

1) https://console.twilio.com/billing/upgrade
   (Upgrade Trial → paid — required for WhatsApp Business)

2) https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders
   → Create new sender
   → Choose +14244972690
   → Continue with Facebook
   → Create Meta Business Portfolio (Dream Mantra)
   → Create WhatsApp Business Account
   → Display name: Dream Mantra
   → Category: Education
   → Website: https://dreammantra.in
   → Complete OTP from Twilio Console
   → Confirm Twilio access

3) Sender webhook URL:
   https://dreammantra.in/api/webhooks/whatsapp   (HTTP POST)

4) Re-run this script (auto-detects ONLINE sender):
   $env:RENDER_API_KEY = "..."
   $env:TWILIO_AUTH_TOKEN = "..."
   node scripts/activate-whatsapp-production.js

After that: registration, reminders, notifications and Esh chat
go to ALL opted-in users with NO join code.
`);
}

async function main() {
  const forced = process.env.TWILIO_WHATSAPP_FROM?.trim();
  let from = forced;

  if (!from || from.includes('4155238886')) {
    try {
      const online = await listOnlineSenders();
      if (online[0]?.sender_id) {
        from = online[0].sender_id.replace(/^whatsapp:/i, '');
        console.log(`Detected ONLINE sender: ${from}`);
      }
    } catch (err) {
      console.warn('Could not list senders:', err.message);
    }
  }

  if (!from || from.includes('4155238886')) {
    printGuide();
    from = DEFAULT_FROM;
    console.log(`\nNo ONLINE business sender yet. Not switching env (still sandbox).\n`);
    process.exit(0);
  }

  const digits = from.replace(/\D/g, '');
  const e164 = from.startsWith('+') ? from : `+${digits}`;

  console.log('Activating production WhatsApp on Render...\n');
  await upsertEnv('WHATSAPP_ENABLED', 'true');
  await upsertEnv('WHATSAPP_PROVIDER', 'twilio');
  await upsertEnv('TWILIO_WHATSAPP_FROM', e164);
  await upsertEnv('TWILIO_WHATSAPP_SANDBOX', 'false');
  await upsertEnv('VITE_WHATSAPP_BUSINESS_PHONE', digits);
  await upsertEnv('WHATSAPP_SITE_URL', 'https://dreammantra.in');

  console.log('\nDeploying...');
  const deploy = await renderApi(`/services/${SERVICE_ID}/deploys`, {
    method: 'POST',
    body: JSON.stringify({ clearCache: 'clear' }),
  });
  const d = deploy.deploy || deploy;
  console.log(`Deploy: ${d.id} (${d.status})`);
  console.log('\nExpect health: "sandbox":false  "configured":true');
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
