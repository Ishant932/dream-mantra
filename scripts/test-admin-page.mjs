import { chromium } from 'playwright';

const base = process.env.BASE_URL || 'http://localhost:5000';

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`PAGE: ${e.message}`));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`CONSOLE: ${msg.text()}`);
});

try {
  await page.goto(`${base}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.locator('input[autocomplete="username"]').fill('admin@dreamsmantra.com');
  await page.locator('input[type="password"]').fill('Admin@123');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin/, { timeout: 20000 });
  await page.waitForTimeout(8000);
  console.log('URL:', page.url());
  const text = await page.locator('body').innerText();
  console.log('Has Admin Dashboard:', text.includes('Admin Dashboard') || text.includes('Admin Panel'));
  console.log('Has loading:', text.includes('Loading admin panel'));
  console.log('Has error boundary:', text.includes('Something went wrong'));
  console.log('Errors:', errors.length ? errors.join('\n') : 'none');
} catch (e) {
  console.error('FAIL:', e.message);
  console.log('Errors so far:', errors.join('\n') || 'none');
  process.exitCode = 1;
} finally {
  await browser.close();
}
