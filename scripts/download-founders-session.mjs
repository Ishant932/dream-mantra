import fs from 'fs';

const pageUrl = 'https://sites.google.com/view/dreamz-roadmap/about-us';
const res = await fetch(pageUrl, {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml',
  },
  redirect: 'follow',
});

const html = await res.text();
const setCookie = res.headers.getSetCookie?.() || [];
console.log('Page status:', res.status, 'cookies:', setCookie.length);

const mgmt = html.indexOf('Meet The Management Team');
const slice = html.slice(mgmt, mgmt + 80000);
const urls = [...slice.matchAll(/https:\/\/lh3\.googleusercontent\.com\/sitesv\/[^"'\s\\<>;)]+=w1280/g)]
  .map((m) => m[0].replace(/[);,]+$/, ''))
  .slice(0, 2);

console.log('Found URLs:', urls.length);
for (const u of urls) console.log(u.slice(0, 100) + '...');

const cookie = setCookie.map((c) => c.split(';')[0]).join('; ');

for (const [i, url] of urls.entries()) {
  const imgRes = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: pageUrl,
      Cookie: cookie,
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    },
  });
  const ct = imgRes.headers.get('content-type');
  console.log(`Image ${i}: ${imgRes.status} ${ct}`);
  if (imgRes.ok) {
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const name = i === 0 ? 'esha-lohiya.jpg' : 'shivam-lohiya.jpg';
    fs.mkdirSync('e:/Dreams Mantra/client/public/team', { recursive: true });
    fs.writeFileSync(`e:/Dreams Mantra/client/public/team/${name}`, buf);
    console.log(`Saved ${name} (${buf.length} bytes)`);
  }
}
