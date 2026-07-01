/**
 * Add Resend DNS records for dreammantra.in on GoDaddy, then verify domain on Resend.
 *
 * Usage:
 *   $env:GODADDY_API_KEY = "..."
 *   $env:GODADDY_API_SECRET = "..."
 *   $env:RESEND_API_KEY = "re_..."
 *   node scripts/setup-resend-dns.js
 */
const DOMAIN = 'dreammantra.in';
const GODADDY = 'https://api.godaddy.com/v1';

function godaddyAuth() {
  const key = process.env.GODADDY_API_KEY?.trim();
  const secret = process.env.GODADDY_API_SECRET?.trim();
  if (!key || !secret) {
    console.error('\nMissing GODADDY_API_KEY / GODADDY_API_SECRET');
    console.error('Create keys: https://developer.godaddy.com/keys\n');
    process.exit(1);
  }
  return `sso-key ${key}:${secret}`;
}

async function godaddyApi(path, options = {}) {
  const res = await fetch(`${GODADDY}${path}`, {
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
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) throw new Error(`${res.status} ${path}: ${JSON.stringify(data)}`);
  return data;
}

async function putRecord(type, name, records) {
  const encoded = encodeURIComponent(name);
  return godaddyApi(`/domains/${DOMAIN}/records/${type}/${encoded}`, {
    method: 'PUT',
    body: JSON.stringify(records),
  });
}

async function getResendDomain() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.error('\nMissing RESEND_API_KEY\n');
    process.exit(1);
  }
  const res = await fetch('https://api.resend.com/domains', {
    headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Resend list domains: ${JSON.stringify(body)}`);
  const domain = body.data?.find((d) => d.name === DOMAIN);
  if (!domain) throw new Error(`Domain ${DOMAIN} not found on Resend — add it in Resend dashboard first.`);
  return domain;
}

async function verifyResendDomain(id) {
  const key = process.env.RESEND_API_KEY?.trim();
  const res = await fetch(`https://api.resend.com/domains/${id}/verify`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Resend verify: ${JSON.stringify(body)}`);
  return body;
}

async function main() {
  console.log(`\nResend DNS setup for ${DOMAIN}\n`);

  const domain = await getResendDomain();
  const records = domain.records || [];
  console.log(`Resend domain id: ${domain.id} status: ${domain.status}`);

  for (const rec of records) {
    const host = rec.name === '@' ? '@' : rec.name;
    if (rec.type === 'TXT') {
      await putRecord('TXT', host, [{ data: rec.value, ttl: 600 }]);
      console.log(`TXT ${host} → set`);
    }
    if (rec.type === 'MX') {
      await putRecord('MX', host, [{ data: rec.value, priority: rec.priority || 10, ttl: 600 }]);
      console.log(`MX ${host} → ${rec.value}`);
    }
  }

  console.log('\nWaiting 30s for DNS propagation…');
  await new Promise((r) => setTimeout(r, 30000));

  await verifyResendDomain(domain.id);
  console.log('Resend verify requested. Check status in Resend dashboard.');
  console.log('\nThen set on Render:');
  console.log('  RESEND_FROM=Dream Mantra <noreply@dreammantra.in>\n');
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
