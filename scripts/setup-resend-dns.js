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

/** Append records (does not remove existing records on other names). */
async function patchRecords(records) {
  return godaddyApi(`/domains/${DOMAIN}/records`, {
    method: 'PATCH',
    body: JSON.stringify(records),
  });
}

async function getResendDomainId() {
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
  return domain.id;
}

/** List endpoint omits records — must fetch by id. */
async function getResendDomainRecords(domainId) {
  const key = process.env.RESEND_API_KEY?.trim();
  const res = await fetch(`https://api.resend.com/domains/${domainId}`, {
    headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Resend get domain: ${JSON.stringify(body)}`);
  return { id: body.id, status: body.status, records: body.records || [] };
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

async function getResendDomainStatus(id) {
  const key = process.env.RESEND_API_KEY?.trim();
  const res = await fetch(`https://api.resend.com/domains/${id}`, {
    headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
  });
  const body = await res.json();
  return body.status;
}

function toGodaddyRecords(records) {
  const out = [];
  for (const rec of records) {
    const name = rec.name === '@' ? '@' : rec.name;
    if (rec.type === 'TXT') {
      out.push({ type: 'TXT', name, data: rec.value, ttl: 600 });
    }
    if (rec.type === 'MX') {
      out.push({
        type: 'MX',
        name,
        data: rec.value,
        priority: rec.priority || 10,
        ttl: 600,
      });
    }
  }
  return out;
}

async function main() {
  console.log(`\nResend DNS setup for ${DOMAIN}\n`);

  const domainId = await getResendDomainId();
  const { status, records } = await getResendDomainRecords(domainId);
  console.log(`Resend domain id: ${domainId} status: ${status}`);
  console.log(`Records to publish: ${records.length}`);

  if (!records.length) {
    throw new Error('No DNS records returned from Resend — check dashboard.');
  }

  const godaddyRecords = toGodaddyRecords(records);
  for (const rec of godaddyRecords) {
    console.log(`  ${rec.type} ${rec.name} → ${rec.data.slice(0, 60)}${rec.data.length > 60 ? '…' : ''}`);
  }

  await patchRecords(godaddyRecords);
  console.log('\nGoDaddy DNS records added (PATCH).');

  console.log('\nWaiting 45s for DNS propagation…');
  await new Promise((r) => setTimeout(r, 45000));

  await verifyResendDomain(domainId);
  const newStatus = await getResendDomainStatus(domainId);
  console.log(`Resend domain status after verify: ${newStatus}`);

  if (newStatus === 'verified') {
    console.log('\nDomain verified! Set on Render:');
    console.log('  RESEND_FROM=Dream Mantra <noreply@dreammantra.in>\n');
  } else {
    console.log('\nStill pending — DNS can take 5–30 minutes. Re-run verify or check GoDaddy DNS.');
    console.log('Manual records: see RESEND_DNS.md\n');
  }
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
