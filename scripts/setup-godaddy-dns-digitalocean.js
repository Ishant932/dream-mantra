/**
 * Point dreammantra.in from Render → DigitalOcean App Platform via GoDaddy API.
 *
 * Prerequisites:
 *   1. App deployed on DigitalOcean (node scripts/deploy-digitalocean.js)
 *   2. Custom domains added in DO dashboard (from .do/app.yaml)
 *   3. GoDaddy API keys from https://developer.godaddy.com/keys
 *
 * Usage:
 *   $env:GODADDY_API_KEY = "..."
 *   $env:GODADDY_API_SECRET = "..."
 *   $env:DIGITALOCEAN_ACCESS_TOKEN = "dop_v1_..."
 *   $env:DO_APP_ID = "..."   # optional — auto-detected
 *   node scripts/setup-godaddy-dns-digitalocean.js
 */
const DOMAIN = 'dreammantra.in';
const API = 'https://api.godaddy.com/v1';
const DO_API = 'https://api.digitalocean.com/v2';

function godaddyAuth() {
  const key = process.env.GODADDY_API_KEY;
  const secret = process.env.GODADDY_API_SECRET;
  if (!key || !secret) {
    console.error('\nMissing GoDaddy API credentials.');
    console.error('Create keys: https://developer.godaddy.com/keys\n');
    process.exit(1);
  }
  return `sso-key ${key}:${secret}`;
}

async function godaddyApi(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: godaddyAuth(),
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(`${res.status} ${path}: ${JSON.stringify(data)}`);
  return data;
}

async function doApi(path) {
  const token = process.env.DIGITALOCEAN_ACCESS_TOKEN || process.env.DO_API_TOKEN;
  if (!token) throw new Error('Missing DIGITALOCEAN_ACCESS_TOKEN');
  const res = await fetch(`${DO_API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${path}: ${JSON.stringify(data)}`);
  return data;
}

async function getDoDnsTargets() {
  const appId = process.env.DO_APP_ID;
  let app;
  if (appId) {
    ({ app } = await doApi(`/apps/${appId}`));
  } else {
    const { apps } = await doApi('/apps?per_page=50');
    app = (apps || []).find((a) => a.spec?.name === 'dream-mantra');
    if (!app) throw new Error('dream-mantra app not found on DigitalOcean. Set DO_APP_ID.');
  }

  const liveUrl = app.live_url || app.default_ingress || '';
  const cnameTarget = liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!cnameTarget) {
    throw new Error('Could not determine DigitalOcean app URL. Check DO dashboard.');
  }

  // DO App Platform apex: use CNAME to the default ingress hostname
  // www: CNAME to same target
  return { cnameTarget, appId: app.id };
}

async function putRecords(type, name, records) {
  const encodedName = encodeURIComponent(name);
  return godaddyApi(`/domains/${DOMAIN}/records/${type}/${encodedName}`, {
    method: 'PUT',
    body: JSON.stringify(records),
  });
}

async function deleteRecordType(type, name) {
  const encodedName = encodeURIComponent(name);
  try {
    await godaddyApi(`/domains/${DOMAIN}/records/${type}/${encodedName}`, { method: 'DELETE' });
  } catch (err) {
    if (!String(err.message).includes('404')) throw err;
  }
}

async function configureDns(cnameTarget) {
  const records = await godaddyApi(`/domains/${DOMAIN}/records`);

  // Remove old Render A record and conflicting web records
  for (const type of ['A', 'AAAA']) {
    const names = [...new Set(records.filter((r) => r.type === type).map((r) => r.name))];
    for (const name of names) {
      if (name === '@' || name === 'www') {
        await deleteRecordType(type, name);
        console.log(`Removed ${type} ${name}`);
      }
    }
  }

  // Apex @ — CNAME to DO (GoDaddy supports CNAME flattening on @ for some setups)
  // Fallback: use A record if DO provides one in dashboard
  await putRecords('CNAME', '@', [{ data: cnameTarget, ttl: 600 }]);
  console.log(`Set CNAME @ → ${cnameTarget}`);

  await putRecords('CNAME', 'www', [{ data: cnameTarget, ttl: 600 }]);
  console.log(`Set CNAME www → ${cnameTarget}`);
}

async function main() {
  console.log(`\nGoDaddy DNS setup → DigitalOcean for ${DOMAIN}\n`);

  const { cnameTarget, appId } = await getDoDnsTargets();
  console.log(`DO app: ${appId}`);
  console.log(`Target: ${cnameTarget}\n`);

  await configureDns(cnameTarget);

  console.log('\nDone! DNS pointed to DigitalOcean.');
  console.log('Propagation: 10–60 minutes.');
  console.log(`Verify domains: https://cloud.digitalocean.com/apps/${appId}/settings`);
  console.log('Then open: https://dreammantra.in\n');
  console.log('Note: If GoDaddy rejects CNAME on @, use the A record from DO dashboard → Domains.');
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
