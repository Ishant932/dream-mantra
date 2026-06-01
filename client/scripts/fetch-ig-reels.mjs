const url = 'https://www.instagram.com/dream.mantra/';
const res = await fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    Accept: 'text/html',
  },
});
const html = await res.text();
const shortcodes = [...html.matchAll(/"shortcode":"([A-Za-z0-9_-]+)"/g)].map((m) => m[1]);
const reels = [...new Set(shortcodes)].slice(0, 8);
console.log('status', res.status);
console.log('reels', reels);
