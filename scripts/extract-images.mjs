import fs from 'fs';

const html = fs.readFileSync('e:/Dreams Mantra/dreamz-about.html', 'utf8');
const re = /https:\/\/lh3\.googleusercontent\.com\/sitesv\/[^"'\s\\<>]+/g;
const urls = [...new Set(html.match(re) || [])];
urls.forEach((u) => console.log(u));
console.log('TOTAL', urls.length);
