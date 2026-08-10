import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(2000);

await page.evaluate(() => document.querySelector('.page-next-step [data-guidance-open]').click());
await page.waitForSelector('.guidance-modal__panel', { timeout: 5000 });
console.log('1. Home hero CTA:', await page.isVisible('.guidance-modal__title'));

await page.click('.guidance-modal__close');
await page.waitForTimeout(400);

await page.evaluate(() => document.querySelector('footer a[href*="guidance"]').click());
await page.waitForSelector('.guidance-modal__panel', { timeout: 5000 });
console.log('2. Footer link:', await page.isVisible('.guidance-modal__panel'));

await page.click('.guidance-modal__close');
await page.goto('http://localhost:5174/counselling', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);
await page.evaluate(() => document.querySelector('[data-guidance-open]').click());
await page.waitForSelector('.guidance-modal__panel', { timeout: 5000 });
console.log('3. Counselling page:', await page.isVisible('.guidance-modal__panel'));

console.log('ALL_TESTS_PASS');
await browser.close();
