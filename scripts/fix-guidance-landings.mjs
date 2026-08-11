import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landingRoot = path.join(__dirname, '..', 'Landing Pages');

const FOLDERS = [
  'Counselling Guidance',
  'Brain Mapping Guidance',
  'Skill Mapping Guidance',
  'Brain Skill Mapping Guidance',
];

const TAIL = `  <link rel="stylesheet" href="/studio/shared/guidance-modal.css">
  <script src="script.js"></script>
  <script src="/studio/shared/guidance-modal.js"></script>
</body>
</html>`;

for (const folder of FOLDERS) {
  const file = path.join(landingRoot, folder, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const modalStart = html.indexOf('<div id="guidance-modal-overlay"');
  if (modalStart === -1) {
    console.error('No guidance modal in', folder);
    continue;
  }
  const modalEnd = html.indexOf('</div>', html.lastIndexOf('id="guidance-form-msg"'));
  const end = html.indexOf('</div>', modalEnd + 6) + 6;
  html = `${html.slice(0, end)}\n\n${TAIL}`;
  fs.writeFileSync(file, html, 'utf8');
  console.log('Fixed', folder);
}
