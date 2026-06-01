import { IMAGES, PORTRAITS } from '../src/data/content.js';

const urls = [
  ...Object.values(IMAGES),
  ...Object.values(PORTRAITS),
];

const unique = [...new Set(urls)];

async function check(url) {
  try {
    const r = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return { url, status: r.status, ok: r.ok };
  } catch {
    return { url, status: 'ERR', ok: false };
  }
}

const results = await Promise.all(unique.map(check));
const bad = results.filter((r) => !r.ok);
console.log(`Total: ${unique.length}, Bad: ${bad.length}`);
bad.forEach((r) => console.log(r.status, r.url));
console.log('\nAll results:');
results.forEach((r) => console.log(r.ok ? 'OK' : r.status, r.url.slice(-50)));
