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

  // 1. /order Step 1 empty
  await page.goto(`${baseUrl}/order`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outDir, 'order-empty.png') });

  // 2. Step 1 validation error
  await page.click('button:has-text("Lanjut ke pembayaran")');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(outDir, 'order-validation-error.png') });

  // 3. Step 1 filled + PDF parsed
  await page.fill('#customer_name', 'Budi Santoso');
  await page.fill('#contact', '081234567890');
  await page.locator('input[type="file"][accept*="pdf"]').first().setInputFiles(path.resolve('tests/fixtures/minimal.pdf'));
  await page.waitForSelector('text=minimal.pdf (1 halaman)', { timeout: 10000 });
  await page.screenshot({ path: path.join(outDir, 'order-step1-filled.png') });

  // 4. Advance to Step 2 Pembayaran
  await page.click('button:has-text("Lanjut ke pembayaran")');
  await page.waitForSelector('text=Estimasi biaya:', { timeout: 5000 });
  await page.locator('input[type="file"][accept*="image"]').first().setInputFiles(path.resolve('tests/fixtures/proof.png'));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'order-step2.png') });

  // 5. Advance to Step 3 Kirim
  await page.click('button:has-text("Periksa pesanan")');
  await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
  await page.screenshot({ path: path.join(outDir, 'order-step3.png') });

  // 6. Check agreement & submit
  await page.locator('input[type="checkbox"]').first().check();
  const navPromise = page.waitForURL('**/order-success?orderId=*', { timeout: 25000 });
  await page.click('button[type="submit"]');
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(outDir, 'order-submitting.png') });

  await navPromise;
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const successUrl = page.url();
  const orderId = new URL(successUrl).searchParams.get('orderId');
  const successMainText = await page.locator('main').innerText();
  console.log('E2E_ORDER_ID:', orderId);
  console.log('E2E_SUCCESS_TEXT:', successMainText.replace(/\s+/g, ' ').trim());
  await page.screenshot({ path: path.join(outDir, 'success.png') });

  // 7. /track
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
