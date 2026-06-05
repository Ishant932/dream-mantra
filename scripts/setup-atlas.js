/**
 * Full MongoDB Atlas setup for Dream Mantra (project, M0 cluster, user, IP, Render link).
 *
 * Usage:
 *   $env:ATLAS_PUBLIC_KEY = "abcd1234"
 *   $env:ATLAS_PRIVATE_KEY = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
 *   $env:RENDER_API_KEY = "rnd_..."   # optional
 *   node scripts/setup-atlas.js
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import DigestFetch from 'digest-fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ATLAS = 'https://cloud.mongodb.com/api/atlas/v2';
const API_VERSION = '2024-10-23';
const PROJECT_NAME = 'Dream Mantra';
const CLUSTER_NAME = 'dream-mantra-cluster';
const DB_NAME = 'dreammantra';
const DB_USER = 'dreammantra';
const RENDER_SERVICE = 'dream-mantra';

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(`\nMissing ${name}.`);
    console.error('Get keys: cloud.mongodb.com → Organization → Access Manager → API Keys\n');
    process.exit(1);
  }
  return v;
}

function createAtlasClient(publicKey, privateKey) {
  return new DigestFetch(publicKey, privateKey);
}

async function atlasJson(client, method, pathSuffix, body) {
  const url = `${ATLAS}${pathSuffix}`;
  const headers = {
    Accept: `application/vnd.atlas.${API_VERSION}+json`,
    ...(body ? { 'Content-Type': `application/vnd.atlas.${API_VERSION}+json` } : {}),
  };
  const res = await client.fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) throw new Error(`${res.status} ${method} ${pathSuffix}: ${JSON.stringify(data)}`);
  return data;
}

async function renderApi(pathSuffix, options = {}) {
  const key = process.env.RENDER_API_KEY?.trim();
  if (!key) return null;
  const res = await fetch(`https://api.render.com/v1${pathSuffix}`, {
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
  if (!res.ok) throw new Error(`Render ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

function generatePassword() {
  return crypto.randomBytes(18).toString('base64url');
}

function readExistingDbPassword() {
  const envPath = path.join(ROOT, 'backend/.env');
  if (!fs.existsSync(envPath)) return null;
  const match = fs.readFileSync(envPath, 'utf8').match(/^MONGODB_URI=mongodb\+srv:\/\/dreammantra:([^@]+)@/m);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function buildUri(user, pass, host) {
  return `mongodb+srv://${user}:${encodeURIComponent(pass)}@${host}/${DB_NAME}?retryWrites=true&w=majority`;
}

async function findOrCreateProject(client) {
  const orgs = await atlasJson(client, 'GET', '/orgs');
  const org = (orgs.results || orgs)[0];
  if (!org?.id) throw new Error('No Atlas organization found.');

  const projects = await atlasJson(client, 'GET', `/groups?orgId=${org.id}`);
  const list = projects.results || projects;
  let project = list.find((p) => p.name === PROJECT_NAME);
  if (project) {
    console.log(`Project exists: ${project.name}`);
    return project;
  }

  project = await atlasJson(client, 'POST', '/groups', { orgId: org.id, name: PROJECT_NAME });
  console.log(`Created project: ${project.name}`);
  return project;
}

async function ensureCluster(client, groupId) {
  const clusters = await atlasJson(client, 'GET', `/groups/${groupId}/clusters`);
  const list = clusters.results || clusters;
  const existing = list.find((c) => c.name === CLUSTER_NAME);
  if (existing) {
    console.log(`Cluster exists: ${existing.name} (${existing.stateName || 'unknown'})`);
    return existing;
  }

  const cluster = await atlasJson(client, 'POST', `/groups/${groupId}/clusters`, {
    name: CLUSTER_NAME,
    clusterType: 'REPLICASET',
    replicationSpecs: [
      {
        zoneName: 'Zone 1',
        regionConfigs: [
          {
            providerName: 'TENANT',
            backingProviderName: 'AWS',
            regionName: 'AP_SOUTH_1',
            priority: 7,
            electableSpecs: { instanceSize: 'M0', nodeCount: 3 },
          },
        ],
      },
    ],
  });
  console.log(`Creating cluster: ${cluster.name}`);
  return cluster;
}

async function waitForCluster(client, groupId) {
  for (let i = 0; i < 60; i++) {
    const c = await atlasJson(client, 'GET', `/groups/${groupId}/clusters/${CLUSTER_NAME}`);
    const state = c.stateName || c.state;
    process.stdout.write(`\r  Cluster state: ${state}   `);
    if (state === 'IDLE') {
      console.log('\n  Cluster ready.');
      return c;
    }
    await new Promise((r) => setTimeout(r, 10000));
  }
  throw new Error('Cluster did not become IDLE in time.');
}

async function ensureNetworkAccess(client, groupId) {
  const entries = await atlasJson(client, 'GET', `/groups/${groupId}/accessList`);
  const list = entries.results || entries;
  if (list.some((e) => e.cidrBlock === '0.0.0.0/0')) {
    console.log('Network access: 0.0.0.0/0 already allowed');
    return;
  }
  await atlasJson(client, 'POST', `/groups/${groupId}/accessList`, [
    { cidrBlock: '0.0.0.0/0', comment: 'Render + dev' },
  ]);
  console.log('Network access: allowed 0.0.0.0/0');
}

async function ensureDbUser(client, groupId, password) {
  const users = await atlasJson(client, 'GET', `/groups/${groupId}/databaseUsers`);
  const list = users.results || users;
  const pathSuffix = `/groups/${groupId}/databaseUsers/admin/${DB_USER}`;
  if (list.some((u) => u.username === DB_USER)) {
    await atlasJson(client, 'PATCH', pathSuffix, { password });
    console.log(`Database user updated: ${DB_USER}`);
    return;
  }
  await atlasJson(client, 'POST', `/groups/${groupId}/databaseUsers`, {
    databaseName: 'admin',
    username: DB_USER,
    password,
    roles: [{ roleName: 'readWriteAnyDatabase', databaseName: 'admin' }],
  });
  console.log(`Database user created: ${DB_USER}`);
}

function saveLocalEnv(uri) {
  const envPath = path.join(ROOT, 'backend/.env');
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  if (/^MONGODB_URI=/m.test(content)) {
    content = content.replace(/^MONGODB_URI=.*$/m, `MONGODB_URI=${uri}`);
  } else {
    content = `${content.trim()}\n\nMONGODB_URI=${uri}\n`;
  }
  fs.writeFileSync(envPath, content);
  console.log('Saved MONGODB_URI to backend/.env');
}

async function linkRender(uri) {
  if (!process.env.RENDER_API_KEY?.trim()) {
    console.log('RENDER_API_KEY not set — add MONGODB_URI in Render dashboard manually.');
    return false;
  }
  try {
    const services = await renderApi('/services?limit=50');
    const list = Array.isArray(services) ? services : services?.data || [];
    const service = list.find(
      (s) => s.service?.name === RENDER_SERVICE || s.service?.slug === RENDER_SERVICE
    )?.service;
    if (!service?.id) throw new Error('Render service dream-mantra not found');

    const envs = await renderApi(`/services/${service.id}/env-vars?limit=100`);
    const envList = Array.isArray(envs) ? envs : envs?.data || [];
    const found = envList.find((e) => e.envVar?.key === 'MONGODB_URI')?.envVar;

    await renderApi(`/services/${service.id}/env-vars/MONGODB_URI`, {
      method: 'PUT',
      body: JSON.stringify({ value: uri }),
    });
    console.log('MONGODB_URI set on Render.');
    try {
      await renderApi(`/services/${service.id}/deploys`, {
        method: 'POST',
        body: JSON.stringify({ clearCache: 'clear' }),
      });
      console.log('Render redeploy triggered.');
    } catch (err) {
      console.log('Env saved; redeploy from Render dashboard if needed.');
    }
    return true;
  } catch (err) {
    console.log(`Render link skipped: ${err.message}`);
    return false;
  }
}

async function main() {
  const publicKey = requireEnv('ATLAS_PUBLIC_KEY');
  const privateKey = requireEnv('ATLAS_PRIVATE_KEY');
  const password =
    process.env.ATLAS_DB_PASSWORD?.trim() || readExistingDbPassword() || generatePassword();
  const client = createAtlasClient(publicKey, privateKey);

  console.log('\nDream Mantra → MongoDB Atlas automated setup\n');

  const project = await findOrCreateProject(client);
  await ensureCluster(client, project.id);
  await waitForCluster(client, project.id);
  await ensureNetworkAccess(client, project.id);
  await ensureDbUser(client, project.id, password);

  const cluster = await atlasJson(client, 'GET', `/groups/${project.id}/clusters/${CLUSTER_NAME}`);
  const srv = cluster.connectionStrings?.standardSrv || '';
  const host = srv.replace('mongodb+srv://', '').replace(/\/$/, '').split('/')[0];
  if (!host) throw new Error('Could not read cluster SRV host.');
  const uri = buildUri(DB_USER, password, host);

  saveLocalEnv(uri);
  await linkRender(uri);

  console.log('\nDone. Verify: https://dreammantra.in/api/health → db.mode = mongodb\n');
  console.log(`Database password (save this): ${password}\n`);
}

main().catch((err) => {
  console.error('\nSetup failed:', err.message);
  process.exit(1);
});
