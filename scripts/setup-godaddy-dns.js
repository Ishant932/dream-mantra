/**
 * Point dreammantra.in from Hostinger → Render via GoDaddy API.
 *
 * Prerequisites:
 *   1. Domain registered at GoDaddy
 *   2. API keys from https://developer.godaddy.com/keys (Production)
 *
 * Usage:
 *   $env:GODADDY_API_KEY = "your_key"
 *   $env:GODADDY_API_SECRET = "your_secret"
 *   node scripts/setup-godaddy-dns.js
 */
const DOMAIN = 'dreammantra.in';
const RENDER_A = '216.24.57.1';
const RENDER_CNAME = 'dream-mantra.onrender.com';
const API = 'https://api.godaddy.com/v1';

function authHeader() {
  const key = process.env.GODADDY_API_KEY;
  const secret = process.env.GODADDY_API_SECRET;
  if (!key || !secret) {
    console.error('\nMissing GoDaddy API credentials.');
    console.error('Create keys: https://developer.godaddy.com/keys');
    console.error('Then run:');
    console.error('  $env:GODADDY_API_KEY = "..."');
    console.error('  $env:GODADDY_API_SECRET = "..."');
    console.error('  node scripts/setup-godaddy-dns.js\n');
    process.exit(1);
  }
  return `sso-key ${key}:${secret}`;
}

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: authHeader(),
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${path}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function getDomain() {
  return api(`/domains/${DOMAIN}`);
}

async function getRecords() {
  return api(`/domains/${DOMAIN}/records`);
}

async function putRecords(type, name, records) {
  const encodedName = encodeURIComponent(name);
  return api(`/domains/${DOMAIN}/records/${type}/${encodedName}`, {
    method: 'PUT',
    body: JSON.stringify(records),
  });
}

async function deleteRecordType(type, name) {
  const encodedName = encodeURIComponent(name);
  try {
    await api(`/domains/${DOMAIN}/records/${type}/${encodedName}`, { method: 'DELETE' });
  } catch (err) {
    if (!String(err.message).includes('404')) throw err;
  }
}

async function setGoDaddyNameservers(domainInfo) {
  const current = domainInfo.nameServers || [];
  const isHostinger = current.some((ns) => /dns-parking|hostinger/i.test(ns));
  if (!isHostinger) {
    console.log('Nameservers already on GoDaddy (not Hostinger parking).');
    return current;
  }

  console.log('Current nameservers (Hostinger):', current.join(', '));
  console.log('Switching to GoDaddy default nameservers…');

  const defaults = domainInfo.nameServers?.length
    ? null
    : null;

  // Fetch assigned GoDaddy nameservers for this domain
  let targetNs = defaults;
  if (!targetNs) {
    try {
      const nsRes = await api(`/domains/${DOMAIN}/nameservers`);
      if (Array.isArray(nsRes) && nsRes.length) targetNs = nsRes;
    } catch {
      /* fall through */
    }
  }

  if (!targetNs || targetNs.some((ns) => /dns-parking|hostinger/i.test(ns))) {
    // Standard GoDaddy pair — API accepts domaincontrol.com defaults per account
    targetNs = ['ns71.domaincontrol.com', 'ns72.domaincontrol.com'];
  }

  await api(`/domains/${DOMAIN}/nameservers`, {
    method: 'PUT',
    body: JSON.stringify(targetNs),
  });

  console.log('Nameservers updated to:', targetNs.join(', '));
  console.log('Waiting 30s for nameserver change to register…');
  await new Promise((r) => setTimeout(r, 30000));
  return targetNs;
}

async function configureRenderDns(existingRecords) {
  const keepTypes = new Set(['MX', 'TXT', 'SRV', 'NS']);
  const kept = existingRecords.filter((r) => {
    if (keepTypes.has(r.type)) return true;
    if (r.type === 'CNAME' && r.name !== 'www') return true;
    return false;
  });

  console.log(`Keeping ${kept.length} non-web records (MX, TXT, etc.).`);

  // Remove web records that conflict
  for (const type of ['A', 'AAAA', 'CNAME']) {
    const names = [...new Set(existingRecords.filter((r) => r.type === type).map((r) => r.name))];
    for (const name of names) {
      if (type === 'CNAME' && name !== 'www') continue;
      if (type === 'A' && name !== '@' && name !== 'www') continue;
      if (type === 'AAAA') {
        await deleteRecordType(type, name);
        console.log(`Removed ${type} ${name}`);
      }
    }
  }

  await putRecords('A', '@', [{ data: RENDER_A, ttl: 600 }]);
  console.log(`Set A @ → ${RENDER_A}`);

  await putRecords('CNAME', 'www', [{ data: RENDER_CNAME, ttl: 600 }]);
  console.log(`Set CNAME www → ${RENDER_CNAME}`);

  // Remove any remaining AAAA on @ and www
  for (const name of ['@', 'www']) {
    await deleteRecordType('AAAA', name);
  }
}

async function verifyRenderDomain() {
  const key = process.env.RENDER_API_KEY;
  if (!key) {
    console.log('\nSet RENDER_API_KEY to auto-verify on Render after DNS propagates.');
    return;
  }
  const serviceId = process.env.RENDER_SERVICE_ID || 'srv-d8en4919rddc73chhqh0';
  const headers = {
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  for (const domainId of ['cdm-d8gm259kh4rs73arf2pg', 'cdm-d8gm259kh4rs73arf2qg']) {
    try {
      await fetch(`https://api.render.com/v1/services/${serviceId}/custom-domains/${domainId}/verify`, {
        method: 'POST',
        headers,
      });
      console.log(`Triggered Render verify for domain ${domainId}`);
    } catch (err) {
      console.log('Render verify skipped:', err.message);
    }
  }
}

async function main() {
  console.log(`\nGoDaddy DNS setup → Render for ${DOMAIN}\n`);

  const domainInfo = await getDomain();
  console.log('Domain status:', domainInfo.status);
  console.log('Registrar:', domainInfo.registrarCreatedAt ? 'GoDaddy' : 'unknown');

  await setGoDaddyNameservers(domainInfo);

  let records;
  try {
    records = await getRecords();
  } catch (err) {
    console.log('Could not read DNS yet (nameservers may still be propagating):', err.message);
    console.log('Retry this script in 15–30 minutes, or add records manually in GoDaddy DNS.');
    process.exit(1);
  }

  console.log(`Found ${records.length} DNS records.`);
  await configureRenderDns(records);

  console.log('\nDone! DNS pointed to Render.');
  console.log('Propagation: 10–60 minutes (sometimes up to 24h).');
  console.log('Then open: https://dreammantra.in\n');

  await verifyRenderDomain();
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  if (String(err.message).includes('403')) {
    console.error('\nGoDaddy API 403? Create keys at https://developer.godaddy.com/keys');
    console.error('Ensure API access is enabled for your account (1+ domain required).');
  }
  process.exit(1);
});
