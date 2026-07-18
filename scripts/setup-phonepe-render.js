/**
 * Configure PhonePe on Render and redeploy.
 *
 * PowerShell:
 *   $env:RENDER_API_KEY = "rnd_..."
 *   node scripts/setup-phonepe-render.js
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
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
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

async function deleteEnvVar(key) {
  try {
    await api(`/services/${SERVICE_ID}/env-vars/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
    console.log(`  ✕ removed ${key}`);
  } catch (e) {
    console.log(`  · skip remove ${key} (${e.message.slice(0, 80)})`);
  }
}

async function triggerDeploy() {
  await api(`/services/${SERVICE_ID}/deploys`, {
    method: 'POST',
    body: JSON.stringify({ clearCache: 'clear' }),
  });
}

async function main() {
  const clientId = process.env.PHONEPE_CLIENT_ID?.trim();
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET?.trim();
  const clientVersion = process.env.PHONEPE_CLIENT_VERSION?.trim() || '1';
  const env = process.env.PHONEPE_ENV?.trim() || 'PRODUCTION';
  const webhookUser = process.env.PHONEPE_WEBHOOK_USERNAME?.trim();
  const webhookPass = process.env.PHONEPE_WEBHOOK_PASSWORD?.trim();

  if (!clientId || !clientSecret) {
    console.error('\nRequired: PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET\n');
    process.exit(1);
  }

  console.log('\nDream Mantra → PhonePe setup on Render\n');
  console.log('Setting environment variables...');

  await upsertEnvVar('PHONEPE_CLIENT_ID', clientId);
  await upsertEnvVar('PHONEPE_CLIENT_SECRET', clientSecret);
  await upsertEnvVar('PHONEPE_CLIENT_VERSION', clientVersion);
  await upsertEnvVar('PHONEPE_ENV', env);
  if (webhookUser) await upsertEnvVar('PHONEPE_WEBHOOK_USERNAME', webhookUser);
  if (webhookPass) await upsertEnvVar('PHONEPE_WEBHOOK_PASSWORD', webhookPass);
  await upsertEnvVar('APP_PUBLIC_URL', process.env.APP_PUBLIC_URL?.trim() || 'https://dreammantra.in');
  await upsertEnvVar('PAYMENT_GATEWAY_ENABLED', 'true');

  console.log('\nRemoving legacy Razorpay keys (if any)...');
  await deleteEnvVar('RAZORPAY_KEY_ID');
  await deleteEnvVar('RAZORPAY_KEY_SECRET');
  await deleteEnvVar('RAZORPAY_WEBHOOK_SECRET');

  console.log('\nTriggering redeploy...');
  await triggerDeploy();

  console.log('\nDone. After deploy (~2 min):');
  console.log('  • https://dreammantra.in/api/health → payments.provider: phonepe, gatewayEnabled: true');
  console.log('  • Webhook: https://dreammantra.in/api/payments/webhook/phonepe\n');
}

main().catch((err) => {
  console.error('\nSetup failed:', err.message);
  process.exit(1);
});
