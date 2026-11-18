import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3019';
const outDir = process.env.E2E_OUT_DIR || 'E:/OpenBot/recordings/redesign/stage4';
fs.mkdirSync(outDir, { recursive: true });

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // 1. Create synthetic customer order
  await page.goto(`${baseUrl}/order`, { waitUntil: 'networkidle' });
  await page.fill('#customer_name', 'Admin E2E Customer');
  await page.fill('#contact', '081234567890');
  await page.locator('input[type="file"][accept*="pdf"]').first().setInputFiles(path.resolve('tests/fixtures/minimal.pdf'));
  await page.waitForSelector('text=minimal.pdf (1 halaman)', { timeout: 10000 });
  await page.click('button:has-text("Lanjut ke pembayaran")');
  await page.waitForSelector('text=Estimasi biaya:', { timeout: 5000 });
  await page.locator('input[type="file"][accept*="image"]').first().setInputFiles(path.resolve('tests/fixtures/proof.png'));
  await page.waitForTimeout(300);
  await page.click('button:has-text("Periksa pesanan")');
  await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
  await page.locator('input[type="checkbox"]').first().check();

  const navPromise = page.waitForURL('**/order-success?orderId=*', { timeout: 25000 });
  await page.click('button[type="submit"]');
  await navPromise;
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const orderId = new URL(page.url()).searchParams.get('orderId');
  const successText = await page.locator('main').innerText();
  const codeMatch = successText.match(/ARSC-\d{4}/);
  const pickupCode = codeMatch ? codeMatch[0] : '';
  console.log('E2E_ADMIN_ORDER:', { orderId, pickupCode });

  // 2. Admin login
  await page.goto(`${baseUrl}/admin/login`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outDir, 'admin-login-1280.png') });

  const adminEmail = process.env.E2E_ADMIN_EMAIL || 'admin@arsc-printing.com';
  const adminPassword = process.env.E2E_ADMIN_PASSWORD || 'arsc-sim-admin';
  await page.fill('input[type="email"]', adminEmail);
  await page.fill('input[type="password"]', adminPassword);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  console.log('E2E_ADMIN_POST_LOGIN_URL:', page.url());
  await page.screenshot({ path: path.join(outDir, 'admin-dashboard-1280.png') });

  await browser.close();
}

run().catch((err) => {
  console.error('E2E_ADMIN_FAILED:', err);
  process.exit(1);
});
