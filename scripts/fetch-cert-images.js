import fs from 'fs';

const url = 'https://sites.google.com/view/dreamz-roadmap/home';

const html = await fetch(url).then((r) => r.text());

// Find certification section context
const certIdx = html.search(/OUR CERTIFICATIONS|Our Certifications|certifications/i);
console.log('Cert section index:', certIdx);

if (certIdx >= 0) {
  const snippet = html.slice(Math.max(0, certIdx - 500), certIdx + 8000);
  const urls = [...snippet.matchAll(/https:\/\/lh3\.googleusercontent\.com\/sitesv\/[^"'\s)]+/g)].map((m) =>
    m[0].replace(/[);].*$/, '').replace(/\\u003d/g, '=')
  );
  console.log('\nImages near cert section:', urls.length);
  urls.forEach((u, i) => console.log(`${i + 1}. ${u}`));
}

// Also find all w1280 images (likely cert photos)
const all = [...html.matchAll(/https:\/\/lh3\.googleusercontent\.com\/sitesv\/[^"'\s)]+=w1280/g)].map((m) => m[0]);
console.log('\nAll w1280 images:', all.length);
all.forEach((u, i) => console.log(`${i + 1}. ${u}`));
