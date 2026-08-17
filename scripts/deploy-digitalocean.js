/**
 * Deploy Dream Mantra to DigitalOcean App Platform.
 *
 * Prerequisites:
 *   1. DigitalOcean API token: https://cloud.digitalocean.com/account/api/tokens
 *   2. GitHub connected in DO: https://cloud.digitalocean.com/apps → Create → GitHub
 *   3. (Optional) RENDER_API_KEY to copy secrets from Render automatically
 *
 * Usage:
 *   $env:DIGITALOCEAN_ACCESS_TOKEN = "dop_v1_..."
 *   $env:RENDER_API_KEY = "rnd_..."          # optional — migrate env from Render
 *   node scripts/deploy-digitalocean.js
 */
import { buildAppSpec, APP_NAME, RENDER_SECRET_KEYS } from './digitalocean-app-spec.mjs';

const DO_API = 'https://api.digitalocean.com/v2';
const RENDER_API = 'https://api.render.com/v1';
const RENDER_SERVICE_ID = process.env.RENDER_SERVICE_ID || 'srv-d8en4919rddc73chhqh0';

async function doApi(path, options = {}) {
  const token = process.env.DIGITALOCEAN_ACCESS_TOKEN || process.env.DO_API_TOKEN;
  if (!token) {
    console.error('\nMissing DIGITALOCEAN_ACCESS_TOKEN.');
    console.error('Create one: https://cloud.digitalocean.com/account/api/tokens');
    console.error('Then run:');
    console.error('  $env:DIGITALOCEAN_ACCESS_TOKEN = "dop_v1_..."');
    console.error('  node scripts/deploy-digitalocean.js\n');
    process.exit(1);
  }
  const res = await fetch(`${DO_API}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(`${res.status} ${path}: ${JSON.stringify(data)}`);
  return data;
}

async function renderApi(path) {
  const key = process.env.RENDER_API_KEY;
  if (!key) return null;
  const res = await fetch(`${RENDER_API}${path}`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${key}` },
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(`Render ${res.status} ${path}: ${JSON.stringify(data)}`);
  return data;
}

async function fetchRenderSecrets() {
  if (!process.env.RENDER_API_KEY) {
    console.log('RENDER_API_KEY not set — skipping env migration from Render.');
    return [];
  }
  console.log('Fetching secrets from Render...');
  const rows = await renderApi(`/services/${RENDER_SERVICE_ID}/env-vars?limit=100`);
  const list = Array.isArray(rows) ? rows : [];
  const secrets = [];
  for (const row of list) {
    const ev = row.envVar || row;
    if (!ev?.key || ev.value == null || ev.value === '') continue;
    if (!RENDER_SECRET_KEYS.includes(ev.key)) continue;
    secrets.push({ key: ev.key, value: String(ev.value) });
    console.log(`  copied ${ev.key}`);
  }
  return secrets;
}

async function findExistingApp() {
  const { apps } = await doApi('/apps?per_page=50');
  return (apps || []).find((a) => a.spec?.name === APP_NAME || a.default_ingress?.includes(APP_NAME));
}

async function waitForDeployment(appId, deploymentId, maxMinutes = 20) {
  const deadline = Date.now() + maxMinutes * 60 * 1000;
  while (Date.now() < deadline) {
    const { deployment } = await doApi(`/apps/${appId}/deployments/${deploymentId}`);
    const phase = deployment?.phase;
    process.stdout.write(`\r  Deploy phase: ${phase || 'unknown'}   `);
    if (phase === 'ACTIVE') {
      console.log('\n  Deploy ACTIVE.');
      return deployment;
    }
    if (phase === 'ERROR' || phase === 'CANCELED') {
      throw new Error(`Deployment failed: ${phase} — ${deployment?.cause || 'see DO dashboard'}`);
    }
    await new Promise((r) => setTimeout(r, 15000));
  }
  throw new Error('Deployment timed out — check DigitalOcean dashboard.');
}

async function main() {
  console.log('Dream Mantra → DigitalOcean App Platform\n');

  const secretEnvs = await fetchRenderSecrets();
  const spec = buildAppSpec(secretEnvs);

  let app = await findExistingApp();
  let deployment;

  if (app) {
    console.log(`Updating existing app: ${app.id}`);
    const updated = await doApi(`/apps/${app.id}`, {
      method: 'PUT',
      body: JSON.stringify({ spec }),
    });
    app = updated.app;
    deployment = updated.deployment;
  } else {
    console.log('Creating new app...');
    const created = await doApi('/apps', {
      method: 'POST',
      body: JSON.stringify({ spec }),
    });
    app = created.app;
    deployment = created.deployment;
  }

  const liveUrl = app.live_url || app.default_ingress;
  console.log(`\nApp ID: ${app.id}`);
  console.log(`Live URL: ${liveUrl || '(building)'}`);
  console.log(`Dashboard: https://cloud.digitalocean.com/apps/${app.id}`);

  if (deployment?.id) {
    console.log(`\nWaiting for deployment ${deployment.id}...`);
    await waitForDeployment(app.id, deployment.id);
  }

  // Refresh app info for domain DNS instructions
  const fresh = await doApi(`/apps/${app.id}`);
  const domains = fresh.app?.spec?.domains || spec.domains || [];
  console.log('\n--- Next steps ---');
  console.log('1. Verify health:', `${liveUrl || 'https://dream-mantra-xxxxx.ondigitalocean.app'}/api/health`);
  console.log('2. Point GoDaddy DNS to DigitalOcean:');
  console.log('   node scripts/setup-godaddy-dns-digitalocean.js');
  console.log('   (needs GODADDY_API_KEY + GODADDY_API_SECRET + DO app ID in env)');
  console.log('3. After dreammantra.in works on DO, remove Render:');
  console.log('   $env:TEARDOWN_RENDER_CONFIRM = "yes"');
  console.log('   node scripts/teardown-render.js');
  if (domains.length) {
    console.log('\nCustom domains in spec:', domains.map((d) => d.domain).join(', '));
    console.log('Check DO dashboard → Settings → Domains for exact DNS records.');
  }
}

main().catch((err) => {
  console.error('\nDeploy failed:', err.message);
  if (String(err.message).includes('github')) {
    console.error('\nConnect GitHub first: https://cloud.digitalocean.com/apps → Create App → GitHub');
  }
  process.exit(1);
});
