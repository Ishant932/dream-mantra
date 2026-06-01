import fs from 'fs';
import path from 'path';

const outDir = 'e:/Dreams Mantra/client/public/team';
fs.mkdirSync(outDir, { recursive: true });

const founders = [
  {
    file: 'esha-lohiya.jpg',
    url: 'https://lh3.googleusercontent.com/sitesv/AA5AbUC-plozOsZkeCtHM__pKrKr18vINThK8MBJjpJfJOUxAQ9LvT9a5C2wJz120f_EGI81lbMmfW7uzazTcbawk_-FC23NB7HTqmEyihSwUD-r7_Qcb9E7vaGwTI0M13qW8UE3LuifJb28FG7u0h-gZb4oFeI7XLwka05vS8JfL-Y00EN0XBbyRNGqwTkiVN9VkYz_u-7W57XjJAFQ_g_B9ZyrfjWokp80z-VFI8g=w1280',
  },
  {
    file: 'shivam-lohiya.jpg',
    url: 'https://lh3.googleusercontent.com/sitesv/AA5AbUBPQZnlDxk_CeqKB94XE-cNbPd7odtfqbdT6NLVWJWlDJWC204iVxy73E0-FQXsDyNmdp6vKaRtrTvj8oNHoxUnyjBBrPojzrvcLeFuxaedyGt_NTSbqQwqJnAvMH4sVE1ct3m6WQOK5r-519-Pb6uuxLYsdsFy7tKnPEDJVXFzZUBqK1Fps0KftHRB0fqAmRCl2U_tB7M1l-Zt0tQGnt4S-H6ytXqD_XmiI2g=w1280',
  },
];

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://sites.google.com/view/dreamz-roadmap/about-us',
  Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
};

for (const { file, url } of founders) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.error(`Failed ${file}: ${res.status} ${res.statusText}`);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const dest = path.join(outDir, file);
  fs.writeFileSync(dest, buf);
  console.log(`Saved ${file} (${buf.length} bytes)`);
}
