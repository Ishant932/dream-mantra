/**
 * Remove Dream Mantra services from Render after DigitalOcean is live.
 *
 * Usage (only after dreammantra.in works on DigitalOcean):
 *   $env:RENDER_API_KEY = "rnd_..."
 *   $env:TEARDOWN_RENDER_CONFIRM = "yes"
 *   node scripts/teardown-render.js
 */
const API = 'https://api.render.com/v1';

const SERVICES = [
  { id: 'srv-d8en4919rddc73chhqh0', name: 'dream-mantra (web)' },
  { id: process.env.RENDER_CRON_KEEPALIVE_ID || 'crn-d8en4919rddc73chhqh1', name: 'dream-mantra-keepalive (cron)' },
  { id: process.env.RENDER_CRON_WHATSAPP_ID || 'crn-d8en4919rddc73chhqh2', name: 'dream-mantra-whatsapp (cron)' },
];

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
  if (!res.ok && res.status !== 404) {
    throw new Error(`${res.status} ${path}: ${JSON.stringify(data)}`);
  }
  return { ok: res.ok, status: res.status, data };
}

async function deleteService(id, name) {
  console.log(`Deleting ${name} (${id})...`);
  const { ok, status } = await api(`/services/${id}`, { method: 'DELETE' });
  if (ok) {
    console.log(`  deleted`);
  } else if (status === 404) {
    console.log(`  not found (already removed)`);
  }
}

async function main() {
  if (process.env.TEARDOWN_RENDER_CONFIRM !== 'yes') {
    console.error('\nThis will DELETE Render services for Dream Mantra.');
    console.error('Only run after https://dreammantra.in works on DigitalOcean.\n');
    console.error('To confirm:');
    console.error('  $env:TEARDOWN_RENDER_CONFIRM = "yes"');
    console.error('  node scripts/teardown-render.js\n');
    process.exit(1);
  }

  console.log('Removing Dream Mantra from Render...\n');

  for (const svc of SERVICES) {
    try {
      await deleteService(svc.id, svc.name);
    } catch (err) {
      console.log(`  skipped: ${err.message}`);
    }
  }

  console.log('\nRender teardown complete.');
  console.log('You can also delete the Blueprint in Render Dashboard if it still exists.');
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
