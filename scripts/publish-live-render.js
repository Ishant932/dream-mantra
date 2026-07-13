/**
 * Set ADMIN_REQUIRE_2FA=true on Render and trigger a fresh deploy.
 * Usage: $env:RENDER_API_KEY = "rnd_..."; node scripts/publish-live-render.js
 */
const API = 'https://api.render.com/v1';
const SERVICE_ID = process.env.RENDER_SERVICE_ID || 'srv-d8en4919rddc73chhqh0';

async function api(path, options = {}) {
  const key = process.env.RENDER_API_KEY;
  if (!key) {
    console.error('\nMissing RENDER_API_KEY.');
    console.error('Create one: https://dashboard.render.com/u/settings#api-keys\n');
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
  console.log(`  ${key} = ${value}`);
}

async function main() {
  console.log('Publishing Dream Mantra to Render...\n');

  console.log('Setting environment:');
  await upsertEnvVar('ADMIN_REQUIRE_2FA', 'true');

  console.log('\nTriggering deploy (clear cache)...');
  const deploy = await api(`/services/${SERVICE_ID}/deploys`, {
    method: 'POST',
    body: JSON.stringify({ clearCache: 'clear' }),
  });
  const d = deploy.deploy || deploy;
  console.log(`Deploy id: ${d.id} status: ${d.status}`);

  console.log('\nTrack: https://dashboard.render.com/web/srv-d8en4919rddc73chhqh0/deploys');
  console.log('Live URLs: https://dreammantra.in  https://dream-mantra.onrender.com');
  console.log('\nVerify when live: /api/health should show version 2f53bae or newer.');
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
