/**
 * Download real certificate photos from Dreamz Google Sites.
 * Source: https://sites.google.com/view/dreamz-roadmap/home
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../client/public/certifications');

/** Images in OUR CERTIFICATIONS section (order matches content.js ids 1–7) */
const certUrls = [
  'https://lh3.googleusercontent.com/sitesv/AA5AbUAEJXO2nKCP9IkBFPs-Cs9DOE53Ytc-oVYph8Liq28tLy58k-voqfdBn5Ff9KCX4FMXfDk1xdXRCITEXq7YvVaopouY7yJMRc0YI6zczCtVk7xYYYc4-Np-iVn91TKnDIk7ftuJjc6me3EZ768mSDdOHi436DJLkfmrzJLgNuZIWE0GxVr8PxRO19Q=w1280',
  'https://lh3.googleusercontent.com/sitesv/AA5AbUD-Rl9npLryw3sIcpJkJ0baoeMCbr6nSA2f2RceTLE_X0JRwo29zlQ9t5GM0OGC5jjndHY8l27SDipS35N5XOtWNV92xkTaexwOQHRnJ7v9xQbMjIfrb5NVU0qQTVVHyiBAs1VCBoeTE9qp2eiP-7RQEUeoPLB-46vbh4ppRuHrzELD2XCTMHlupOU=w1280',
  'https://lh3.googleusercontent.com/sitesv/AA5AbUC7sNFZBA76jIajVIUjPpupVoA8bDaU2ffhgXHiFZuQNOaBRe0ratSydsVmV-8pvky6mthMbDQ52fsrQQdLdXHZ-2Z4Ey2A4oWHKxtEiyAq6JvmxrFC0oK6q0WCe-z4irnCmnr5JbmVxjXnVCBxbbAONnNsI25xhZlTazsdMsOXQhOhnA4x53O7hwI=w1280',
  'https://lh3.googleusercontent.com/sitesv/AA5AbUCOBE531kM5Mb0gL4LHM8RVRZGoag26MBePJwfwRacnVLk4UCLC72JbXSDPJnoopBQkzaS5ORRtzgtpq1YOEyImA1ELe4bV2R7JWPuLK4ImWXQyXVEHUtQ90s5HvPqoEV-7LaWNDlmYylg5eiHWE5DgFpn-vQrsX0uH6IbCgJ98d0QpZJj-RcbceNA=w1280',
  'https://lh3.googleusercontent.com/sitesv/AA5AbUA1FKRaKtD2Qlvm4aj4daP3AmlAKuxEMji-KGYQwV3CsAu_h8PTgdz64H2-yH53kByY5cCtlftQT0tqLekw3hJcYTx0n9D8ODtTCH_oOfG-QHmd4cw5tt0V9skmhtPwO_CfoEeXPw0YONZTmkqiPZvt5qIAXMZ6mJ9rDJOA4lB8z2rOVkA59Ap2-Qo=w1280',
  'https://lh3.googleusercontent.com/sitesv/AA5AbUCK4PJwHvX8yrZtxglujTBM7bLJJkCIF_AAOfJrE_TgmFBtW_x4XLzb6J3uzHLGpjmabioz5kcLAbsFI85NkobwVo_HP6LP5W8wlV-LFyRjxSBJ2uxhgRAeZ8GtfiNTi1ybJjqBbME3PhHOMtIBv3ndDjTJLJ2G6NHDv4DK8G7zjAuNgZlvmuEM9r0=w1280',
  'https://lh3.googleusercontent.com/sitesv/AA5AbUCs0jKlnhUwRnuU0cRg6o9Cl_Z0Khw3hT4YAS2iazOeD-3tC4P2HyXlWYIKJQ_mTVs735thldJHhEs7hzqAlWxOUm-yPDCX9im85B5GCnTFco_id6zv6xfkP7nGsnaBT2oOhq3Lz2l_U4QZSsiRHR8ULRgBSDI2F8jb7PEZLVi5luyKRf_Ezx8HVTU=w1280',
];

fs.mkdirSync(outDir, { recursive: true });

for (let i = 0; i < certUrls.length; i++) {
  const res = await fetch(certUrls[i], {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DreamMantra/1.0)' },
  });
  if (!res.ok) {
    console.error(`Failed cert-${i + 1}: HTTP ${res.status}`);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 5000) {
    console.warn(`cert-${i + 1} suspiciously small (${buf.length} bytes) — may be an error page`);
  }
  const file = path.join(outDir, `cert-${i + 1}.jpg`);
  fs.writeFileSync(file, buf);
  console.log(`Saved ${file} (${buf.length} bytes)`);
}

console.log('Done — real certificates downloaded from Google Sites.');
