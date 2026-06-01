import fs from 'fs';

const html = fs.readFileSync('e:/Dreams Mantra/dreamz-about.html', 'utf8');
const mgmt = html.indexOf('Meet The Management Team');
const slice = html.slice(mgmt, mgmt + 120000);

// All image-like URLs in section
const patterns = [
  /https:\/\/lh3\.googleusercontent\.com\/[^"'\s\\<>;)]+/g,
  /src="([^"]+)"/g,
  /data-src="([^"]+)"/g,
  /background-image:\s*url\(['"]?([^'")]+)/g,
];

for (const [i, p] of patterns.entries()) {
  const matches = [...slice.matchAll(p)].map((m) => m[1] || m[0]).slice(0, 8);
  console.log(`\nPattern ${i}:`, matches.length, 'matches');
  matches.forEach((m) => console.log(' ', m.slice(0, 150)));
}

// Try alternate size params
const base1 =
  'https://lh3.googleusercontent.com/sitesv/AA5AbUC-plozOsZkeCtHM__pKrKr18vINThK8MBJjpJfJOUxAQ9LvT9a5C2wJz120f_EGI81lbMmfW7uzazTcbawk_-FC23NB7HTqmEyihSwUD-r7_Qcb9E7vaGwTI0M13qW8UE3LuifJb28FG7u0h-gZb4oFeI7XLwka05vS8JfL-Y00EN0XBbyRNGqwTkiVN9VkYz_u-7W57XjJAFQ_g_B9ZyrfjWokp80z-VFI8g';

const variants = [
  `${base1}=s0`,
  `${base1}=w800-h800`,
  `${base1}=w800`,
  base1.replace('=w1280', ''),
  `${base1}?authuser=0`,
];

console.log('\n--- Testing URL variants ---');
for (const url of variants) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      Referer: 'https://sites.google.com/',
    },
    redirect: 'follow',
  });
  console.log(res.status, res.headers.get('content-type'), url.slice(-30));
}
