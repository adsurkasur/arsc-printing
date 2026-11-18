import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3019';
const outDir = process.env.E2E_OUT_DIR || 'E:/OpenBot/recordings/redesign/stage3/e2e';
fs.mkdirSync(outDir, { recursive: true });

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // 1. /order
  await page.goto(`${baseUrl}/order`, { waitUntil: 'networkidle' });
  await page.fill('#customer_name', 'Budi Santoso');
  await page.fill('#contact', '081234567890');

  const pdfInput = page.locator('input[type="file"][accept*="pdf"]').first();
  await pdfInput.setInputFiles(path.resolve('tests/fixtures/minimal.pdf'));
  await page.waitForTimeout(400);

  const proofInput = page.locator('input[type="file"][accept*="image"]').first();
  await proofInput.setInputFiles(path.resolve('tests/fixtures/proof.png'));
  await page.waitForTimeout(400);

  const agreement = page.locator('input[type="checkbox"]').first();
  if ((await agreement.count()) > 0 && !(await agreement.isChecked())) {
    await agreement.check();
  }

  const submitBtn = page.locator('button[type="submit"]').first();
  await submitBtn.waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForFunction(
    (btn) => btn && !btn.hasAttribute('disabled'),
    await submitBtn.elementHandle(),
    { timeout: 10000 },
  );

  await page.screenshot({ path: path.join(outDir, 'order-filled.png') });

  const navPromise = page.waitForURL('**/order-success?orderId=*', { timeout: 25000 });
  await submitBtn.click();
  await navPromise;

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const successUrl = page.url();
  const orderId = new URL(successUrl).searchParams.get('orderId');
  const successMainText = await page.locator('main').innerText();
  console.log('E2E_ORDER_ID:', orderId);
  console.log('E2E_SUCCESS_TEXT:', successMainText.replace(/\s+/g, ' ').trim());
  await page.screenshot({ path: path.join(outDir, 'success.png') });

  // 2. /track
  await page.goto(`${baseUrl}/track`, { waitUntil: 'networkidle' });
  await page.fill('#tracking-id', orderId);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1200);
  const trackMainText = await page.locator('main').innerText();
  console.log('E2E_TRACK_TEXT:', trackMainText.replace(/\s+/g, ' ').trim());
  await page.screenshot({ path: path.join(outDir, 'track.png') });

  await browser.close();
}

run().catch((err) => {
  console.error('E2E_FAILED:', err);
  process.exit(1);
});
