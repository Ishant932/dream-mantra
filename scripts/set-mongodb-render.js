/**
 * Set MONGODB_URI on Render and redeploy.
 *
 * Usage:
 *   $env:RENDER_API_KEY = "rnd_..."
 *   $env:MONGODB_URI = "mongodb+srv://user:pass@cluster.mongodb.net/dreammantra?retryWrites=true&w=majority"
 *   node scripts/set-mongodb-render.js
 */
const API = 'https://api.render.com/v1';
const SERVICE_NAME = 'dream-mantra';

async function api(path, options = {}) {
  const key = process.env.RENDER_API_KEY;
  if (!key) {
    console.error('\nMissing RENDER_API_KEY.\n');
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
  if (!res.ok) {
    throw new Error(`${res.status} ${path}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function findService() {
  const res = await api('/services?limit=50');
  const list = Array.isArray(res) ? res : res?.data || [];
  const service = list.find(
    (s) => s.service?.name === SERVICE_NAME || s.service?.slug === SERVICE_NAME
  )?.service;
  if (!service?.id) {
    throw new Error(`Service "${SERVICE_NAME}" not found on Render.`);
  }
  return service;
}

async function upsertEnvVar(serviceId, key, value) {
  const existing = await api(`/services/${serviceId}/env-vars?limit=100`);
  const list = Array.isArray(existing) ? existing : existing?.data || [];
  const found = list.find((e) => e.envVar?.key === key)?.envVar;

  if (found?.id) {
    return api(`/services/${serviceId}/env-vars/${found.id}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  return api(`/services/${serviceId}/env-vars`, {
    method: 'POST',
    body: JSON.stringify({ key, value }),
  });
}

async function triggerDeploy(serviceId) {
  return api(`/services/${serviceId}/deploys`, {
    method: 'POST',
    body: JSON.stringify({ clearCache: 'clear' }),
  });
}

async function main() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri || !uri.startsWith('mongodb')) {
    console.error('\nSet MONGODB_URI to your Atlas connection string first.\n');
    console.error('See MONGODB_SETUP.md for steps.\n');
    process.exit(1);
  }

  console.log('Linking MongoDB Atlas to Render...\n');
  const service = await findService();
  console.log(`Service: ${service.name} (${service.id})`);

  await upsertEnvVar(service.id, 'MONGODB_URI', uri);
  console.log('MONGODB_URI saved (secret not printed).');

  console.log('Redeploying...');
  await triggerDeploy(service.id);

  const url = service.serviceDetails?.url || service.url || `${SERVICE_NAME}.onrender.com`;
  console.log('\nDeploy started. After it finishes, verify:');
  console.log(`  https://${String(url).replace(/^https?:\/\//, '')}/api/health`);
  console.log('  → db.mode should be "mongodb"\n');
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
