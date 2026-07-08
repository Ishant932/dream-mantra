/**
 * Configure Twilio WhatsApp on Render and redeploy.
 *
 * Usage:
 *   $env:RENDER_API_KEY = "rnd_..."
 *   $env:TWILIO_ACCOUNT_SID = "AC..."
 *   $env:TWILIO_AUTH_TOKEN = "..."
 *   $env:TWILIO_WHATSAPP_FROM = "+14155238886"
 *   $env:TWILIO_WHATSAPP_SANDBOX_CODE = "join your-word"
 *   $env:CRON_SECRET = "random-secret"
 *   node scripts/configure-twilio-whatsapp.js
 */
const API = 'https://api.render.com/v1';
const SERVICE_ID = process.env.RENDER_SERVICE_ID || 'srv-d8en4919rddc73chhqh0';
const CRON_SERVICE_NAME = 'dream-mantra-whatsapp';

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

async function upsertEnv(serviceId, key, value) {
  await api(`/services/${serviceId}/env-vars/${encodeURIComponent(key)}`, {
    method: 'PUT',
    body: JSON.stringify({ value: String(value) }),
  });
  console.log(`  ${key} = ${value}`);
}

async function findCronService() {
  const data = await api('/services?limit=100');
  const list = Array.isArray(data) ? data.map((x) => x.service || x) : [];
  return list.find((s) => s.name === CRON_SERVICE_NAME || s.slug === CRON_SERVICE_NAME);
}

async function main() {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_WHATSAPP_FROM?.trim() || '+14155238886';
  const sandboxCode = process.env.TWILIO_WHATSAPP_SANDBOX_CODE?.trim() || '';
  const cronSecret = process.env.CRON_SECRET?.trim() || '';

  if (!sid || !token) {
    console.error('\nSet TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
    process.exit(1);
  }
  if (!cronSecret) {
    console.error('\nSet CRON_SECRET (random string for hourly reminder job)');
    process.exit(1);
  }

  console.log('Configuring Twilio WhatsApp on Render...\n');

  console.log('Web service env:');
  await upsertEnv(SERVICE_ID, 'WHATSAPP_ENABLED', 'true');
  await upsertEnv(SERVICE_ID, 'WHATSAPP_PROVIDER', 'twilio');
  await upsertEnv(SERVICE_ID, 'TWILIO_ACCOUNT_SID', sid);
  await upsertEnv(SERVICE_ID, 'TWILIO_AUTH_TOKEN', token);
  await upsertEnv(SERVICE_ID, 'TWILIO_WHATSAPP_FROM', from);
  await upsertEnv(SERVICE_ID, 'TWILIO_WHATSAPP_SANDBOX', 'true');
  if (sandboxCode) await upsertEnv(SERVICE_ID, 'TWILIO_WHATSAPP_SANDBOX_CODE', sandboxCode);
  await upsertEnv(SERVICE_ID, 'WHATSAPP_SITE_URL', 'https://dreammantra.in');
  await upsertEnv(SERVICE_ID, 'CRON_SECRET', cronSecret);

  const cron = await findCronService();
  if (cron?.id) {
    console.log('\nCron service env:');
    await upsertEnv(cron.id, 'CRON_SECRET', cronSecret);
  } else {
    console.log('\nCron service not found — set CRON_SECRET on dream-mantra-whatsapp manually.');
  }

  console.log('\nDeploying web service (clear cache)...');
  const deploy = await api(`/services/${SERVICE_ID}/deploys`, {
    method: 'POST',
    body: JSON.stringify({ clearCache: 'clear' }),
  });
  const d = deploy.deploy || deploy;
  console.log(`Deploy id: ${d.id} status: ${d.status}`);

  console.log('\n--- Next steps ---');
  console.log('1. Twilio Console → Messaging → WhatsApp sandbox');
  console.log('2. Webhook URL: https://dreammantra.in/api/webhooks/whatsapp (POST)');
  if (sandboxCode) {
    console.log(`3. Join sandbox: WhatsApp "${sandboxCode}" to ${from}`);
  }
  console.log('4. Verify: curl https://dreammantra.in/api/health');
  console.log('\nDocs: docs/WHATSAPP_SETUP.md');
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
