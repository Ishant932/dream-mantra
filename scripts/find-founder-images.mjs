import fs from 'fs';

const html = fs.readFileSync('e:/Dreams Mantra/dreamz-about.html', 'utf8');
const re = /https:\/\/lh3\.googleusercontent\.com\/sitesv\/[^"'\s\\<>;)]+/g;

function clean(url) {
  return url.replace(/[);]+$/, '').split('=')[0] ? url.replace(/[);,]+$/, '') : url;
}

for (const name of ['Esha Lohiya', 'Shivam Lohiya', 'Meet The Management']) {
  const idx = html.indexOf(name);
  if (idx === -1) {
    console.log('NOT FOUND', name);
    continue;
  }
  const slice = html.slice(Math.max(0, idx - 4000), idx + 4000);
  const urls = [...slice.matchAll(re)].map((m) => m[0].replace(/[);,]+$/, ''));
  console.log('\n===', name, '===');
  [...new Set(urls)].forEach((u) => console.log(u));
}

// Also dump w1280 portrait candidates in order of appearance after "Management Team"
const mgmt = html.indexOf('Meet The Management Team');
if (mgmt !== -1) {
  const after = html.slice(mgmt, mgmt + 150000);
  const portraits = [...after.matchAll(/https:\/\/lh3\.googleusercontent\.com\/sitesv\/[^"'\s\\<>;)]+=w1280/g)]
    .map((m) => m[0].replace(/[);,]+$/, ''))
    .slice(0, 6);
  console.log('\n=== First w1280 after Management Team ===');
  portraits.forEach((u, i) => console.log(i + 1, u));
}
