/**
 * Configure Razorpay on Render and redeploy.
 *
 * PowerShell:
 *   $env:RENDER_API_KEY = "rnd_..."
 *   $env:RAZORPAY_KEY_ID = "rzp_live_..."   # or rzp_test_...
 *   $env:RAZORPAY_KEY_SECRET = "..."
 *   $env:RAZORPAY_WEBHOOK_SECRET = "whsec_..."  # from Razorpay Dashboard → Webhooks
 *   node scripts/setup-razorpay-render.js
 */
const API = 'https://api.render.com/v1';
const SERVICE_ID = process.env.RENDER_SERVICE_ID || 'srv-d8en4919rddc73chhqh0';

async function api(path, options = {}) {
  const key = process.env.RENDER_API_KEY;
  if (!key) {
    console.error('\nMissing RENDER_API_KEY.');
    process.exit(1);
  }
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

async function upsertEnvVar(key, value) {
  await api(`/services/${SERVICE_ID}/env-vars/${encodeURIComponent(key)}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  });
  console.log(`  ✓ ${key}`);
}

async function triggerDeploy() {
  await api(`/services/${SERVICE_ID}/deploys`, {
    method: 'POST',
    body: JSON.stringify({ clearCache: 'clear' }),
  });
}

async function main() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();

  if (!keyId || !keySecret) {
    console.error('\nRequired: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
    console.error('Get keys: https://dashboard.razorpay.com/app/keys');
    console.error('Webhook secret: Dashboard → Webhooks → create webhook for:');
    console.error('  https://dreammantra.in/api/payments/webhook/razorpay');
    console.error('  Event: payment.captured\n');
    process.exit(1);
  }

  console.log('\nDream Mantra → Razorpay setup on Render\n');
  console.log('Setting environment variables...');

  await upsertEnvVar('RAZORPAY_KEY_ID', keyId);
  await upsertEnvVar('RAZORPAY_KEY_SECRET', keySecret);
  if (webhookSecret) {
    await upsertEnvVar('RAZORPAY_WEBHOOK_SECRET', webhookSecret);
  }
  // Remove forced manual-only mode if it was set
  await upsertEnvVar('PAYMENT_GATEWAY_ENABLED', 'true');

  console.log('\nTriggering redeploy...');
  await triggerDeploy();

  console.log('\nDone. After deploy (~1 min):');
  console.log('  • https://dreammantra.in/api/health → payments.gatewayEnabled: true');
  console.log('  • Dashboard → Modules → Pay → "Pay via Razorpay" should be active');
  console.log('\nRazorpay webhook URL (register in Razorpay Dashboard):');
  console.log('  https://dreammantra.in/api/payments/webhook/razorpay\n');
}

main().catch((err) => {
  console.error('\nSetup failed:', err.message);
  process.exit(1);
});
