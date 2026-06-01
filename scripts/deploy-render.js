/**
 * One-time Render deploy script.
 * Usage:
 *   1. Render Dashboard → Account Settings → API Keys → Create API Key
 *   2. PowerShell:
 *      $env:RENDER_API_KEY = "rnd_..."
 *      node scripts/deploy-render.js
 */
const API = 'https://api.render.com/v1';

const REPO = 'https://github.com/DreamsMantra/dream-mantra';
const SERVICE_NAME = 'dream-mantra';

async function api(path, options = {}) {
  const key = process.env.RENDER_API_KEY;
  if (!key) {
    console.error('\nMissing RENDER_API_KEY.');
    console.error('Create one: https://dashboard.render.com/u/settings#api-keys');
    console.error('Then run: $env:RENDER_API_KEY = "rnd_your_key"; node scripts/deploy-render.js\n');
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
  if (!res.ok) {
    throw new Error(`${res.status} ${path}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function getOwnerId() {
  const owners = await api('/owners?limit=20');
  const list = Array.isArray(owners) ? owners : owners?.data || [];
  const user = list.find((o) => o.owner?.email === 'eshalohiya45@gmail.com')?.owner
    || list.find((o) => o.owner?.name?.includes('Esha'))?.owner
    || list[0]?.owner;
  if (!user?.id) {
    console.log('Owners:', JSON.stringify(list, null, 2));
    throw new Error('Could not find Render workspace. Set RENDER_OWNER_ID env var manually.');
  }
  console.log(`Workspace: ${user.name || user.email} (${user.id})`);
  return process.env.RENDER_OWNER_ID || user.id;
}

async function findExistingService(ownerId) {
  const res = await api(`/services?ownerId=${ownerId}&limit=50`);
  const list = Array.isArray(res) ? res : res?.data || [];
  return list.find((s) => s.service?.name === SERVICE_NAME || s.service?.slug === SERVICE_NAME)?.service;
}

async function createService(ownerId) {
  const jwtSecret = process.env.JWT_SECRET || require('crypto').randomBytes(32).toString('hex');
  const body = {
    type: 'web_service',
    name: SERVICE_NAME,
    ownerId,
    repo: REPO,
    branch: 'main',
    autoDeploy: 'yes',
    serviceDetails: {
      runtime: 'node',
      plan: 'free',
      region: 'singapore',
      healthCheckPath: '/api/health',
      envSpecificDetails: {
        buildCommand: 'npm run install:all && npm run build',
        startCommand: 'cd backend && node index.js',
      },
      envVars: [
        { key: 'NODE_ENV', value: 'production' },
        { key: 'JWT_EXPIRES_IN', value: '7d' },
        { key: 'ADMIN_EMAIL', value: 'admin@dreamsmantra.com' },
        { key: 'ADMIN_PHONE', value: '9680102276' },
        { key: 'PAYMENT_GATEWAY_ENABLED', value: 'false' },
        { key: 'SEED_SAMPLE_SLOTS', value: 'true' },
        ...(process.env.GEMINI_API_KEY ? [{ key: 'GEMINI_API_KEY', value: process.env.GEMINI_API_KEY }] : []),
        ...(process.env.ADMIN_PASSWORD ? [{ key: 'ADMIN_PASSWORD', value: process.env.ADMIN_PASSWORD }] : []),
        ...(process.env.JWT_SECRET ? [{ key: 'JWT_SECRET', value: process.env.JWT_SECRET }] : [{ key: 'JWT_SECRET', value: jwtSecret }]),
      ],
    },
  };

  const res = await api('/services', { method: 'POST', body: JSON.stringify(body) });
  return res.service || res;
}

async function triggerDeploy(serviceId) {
  return api(`/services/${serviceId}/deploys`, {
    method: 'POST',
    body: JSON.stringify({ clearCache: false }),
  });
}

async function main() {
  console.log('Dream Mantra → Render deploy\n');
  const ownerId = await getOwnerId();

  let service = await findExistingService(ownerId);
  if (service) {
    console.log(`Service exists: ${service.name} → ${service.serviceDetails?.url || service.url || '(building)'}`);
    console.log('Triggering redeploy...');
    await triggerDeploy(service.id);
  } else {
    console.log('Creating web service...');
    service = await createService(ownerId);
    console.log(`Created: ${service.name}`);
  }

  const url = service.serviceDetails?.url || service.url;
  console.log('\nDeploy started. Live URL (when ready):');
  console.log(url ? `https://${url.replace(/^https?:\/\//, '')}` : `https://${SERVICE_NAME}.onrender.com`);
  console.log('\nTrack progress: https://dashboard.render.com/');
}

main().catch((err) => {
  console.error('\nDeploy failed:', err.message);
  process.exit(1);
});
