import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { PrintWorker } from '../worker/main.mjs';
import { FakePrinterAdapter } from '../worker/fake-printer.mjs';

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3019';
const stage4Dir = 'E:/OpenBot/recordings/redesign/stage4';
const framesDir = 'E:/OpenBot/recordings/redesign/final-run-frames';
const castDir = 'E:/OpenBot/tmp/stage5-cast';
const videoPath = 'E:/OpenBot/recordings/arsc-final-run.mp4';
const logPath = 'E:/OpenBot/recordings/arsc-final-run-steps.txt';

for (const d of [stage4Dir, framesDir, castDir]) {
  fs.mkdirSync(d, { recursive: true });
}
for (const f of fs.readdirSync(castDir)) {
  fs.unlinkSync(path.join(castDir, f));
}

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.ARSC_LOCAL_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.ARSC_LOCAL_SUPABASE_SERVICE_ROLE_KEY;
  const backend = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const email = `e2e-admin-${randomUUID()}@example.test`;
  const password = randomBytes(24).toString('hex');
  const created = await backend.auth.admin.createUser({ email, password, email_confirm: true });
  await backend.from('user_roles').insert({ user_id: created.data.user.id, role: 'admin' });

  const workerId = randomUUID();
  const workerSecret = randomBytes(24).toString('hex');
  await backend.from('print_workers').insert({
    id: workerId,
    credential_hash: createHash('sha256').update(workerSecret).digest('hex'),
    printer_key: 'fake',
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Start CDP screencast
  const client = await context.newCDPSession(page);
  let frameIdx = 0;
  const startTime = Date.now();
  const stepLogs = [];
  client.on('Page.screencastFrame', async ({ data, sessionId }) => {
    const idx = String(frameIdx++).padStart(5, '0');
    fs.writeFileSync(path.join(castDir, `frame-${idx}.jpg`), Buffer.from(data, 'base64'));
    await client.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await client.send('Page.startScreencast', { format: 'jpeg', quality: 85, everyNthFrame: 1 });

  const markStep = async (num, name) => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const line = `[${elapsed}s] Step ${String(num).padStart(2, '0')}: ${name}`;
    stepLogs.push(line);
    console.log(line);
    await page.waitForTimeout(2200);
    await page.screenshot({ path: path.join(framesDir, `step-${String(num).padStart(2, '0')}-${name}.png`) });
  };

  // Step 1: Customer /order step 1
  await page.goto(`${baseUrl}/order`, { waitUntil: 'networkidle' });
  await page.setInputFiles('input[type="file"]', 'E:/managed-projects-handoff/ARSC/arsc-printing/tests/fixtures/minimal.pdf');
  await page.waitForTimeout(800);
  await page.fill('#customer_name', 'Stage5 Customer');
  await page.fill('#contact', '081234567890');
  await markStep(1, 'order-step1');

  // Step 2: Customer /order step 2
  await page.click('button:has-text("Lanjut ke pembayaran")');
  await page.waitForTimeout(800);
  await page.locator('input[type="file"][accept*="image"]').first().setInputFiles('E:/managed-projects-handoff/ARSC/arsc-printing/tests/fixtures/proof.png');
  await page.waitForTimeout(500);
  await markStep(2, 'order-step2-qris');

  // Step 3: Customer /order step 3
  await page.click('button:has-text("Periksa pesanan")');
  await page.waitForTimeout(500);
  await page.locator('input[type="checkbox"]').first().check();
  await markStep(3, 'order-step3-submit');

  await page.click('button[type="submit"]');
  await page.waitForURL('**/order-success*', { timeout: 25000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const orderId = new URL(page.url()).searchParams.get('orderId');
  const pickupCode = (await page.locator('main').innerText()).match(/ARSC-\d{4}/)?.[0] || '';
  await markStep(4, 'order-success');

  // Step 5: Admin login (1280 light + 375 light + 1280 dark)
  await page.goto(`${baseUrl}/admin/login`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(stage4Dir, 'login-light-1280.png') });
  await markStep(5, 'admin-login');

  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(stage4Dir, 'login-light-375.png') });
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Step 6: Admin search
  const searchInput = page.locator('#admin-search-input');
  await searchInput.fill(pickupCode);
  await searchInput.press('Enter');
  await page.locator(`text=${pickupCode}`).first().waitFor({ state: 'visible', timeout: 15000 });
  await page.screenshot({ path: path.join(stage4Dir, 'list-light-1280.png') });
  await page.locator('#summary').screenshot({ path: path.join(stage4Dir, 'summary-light-1280.png') });
  await markStep(6, 'admin-search');

  // Step 7: Verify payment
  await page.locator('button:has-text("Verifikasi pembayaran")').first().click();
  await page.locator('[role="dialog"] button:has-text("Verifikasi pembayaran")').first().click();
  await page.waitForTimeout(1500);
  await markStep(7, 'admin-verify');

  // Step 8: Approve print
  await page.locator('#worker-select').selectOption(workerId);
  await page.locator('button:has-text("Setujui cetak")').first().click();
  await page.locator('[role="dialog"] button:has-text("Setujui cetak")').first().click();
  await page.waitForTimeout(1500);
  await markStep(8, 'admin-approve');

  // Step 9: Fake worker
  const stateDir = fs.mkdtempSync('E:/OpenBot/tmp/e2e-worker-');
  const worker = new PrintWorker({
    apiBaseUrl: baseUrl,
    workerId,
    workerSecret,
    printerKey: 'fake',
    stateDir,
    adapter: new FakePrinterAdapter({ latencyMs: 50 }),
  });
  let job = null;
  for (let i = 0; i < 5; i++) {
    job = await worker.claimJob();
    if (job) break;
    await page.waitForTimeout(1000);
  }
  await worker.processJob(job);
  await page.reload({ waitUntil: 'networkidle' });
  await searchInput.fill(pickupCode);
  await searchInput.press('Enter');
  await page.locator(`text=${pickupCode}`).first().waitFor({ state: 'visible', timeout: 15000 });
  await markStep(9, 'worker-completed');

  // Step 10: Receipt dialog
  await page.locator('button:has-text("Lihat rincian")').first().click();
  await page.locator('[role="dialog"]').waitFor({ state: 'visible', timeout: 5000 });
  await page.screenshot({ path: path.join(stage4Dir, 'receipt-light-1280.png') });
  await markStep(10, 'admin-receipt');
  await page.locator('[role="dialog"] button:has-text("Tutup")').click();

  // Step 11: Deliver
  await page.locator('button:has-text("Konfirmasi penyerahan")').first().click();
  await page.locator('[role="dialog"] input[type="checkbox"]').first().check();
  await page.locator('[role="dialog"] button:has-text("Sudah diserahkan")').click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(stage4Dir, 'delivered-light-1280.png') });
  await markStep(11, 'admin-delivered');

  // Stage 4 extra screenshots: dark 1280 & drawer 375
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(stage4Dir, 'list-dark-1280.png') });
  await page.evaluate(() => document.documentElement.classList.remove('dark'));

  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(400);
  const menuBtn = page.locator('button[aria-label*="Menu"], button[aria-label*="menu"], header button').first();
  if ((await menuBtn.count()) > 0) {
    await menuBtn.click();
    await page.waitForTimeout(400);
  }
  await page.screenshot({ path: path.join(stage4Dir, 'drawer-light-375.png') });
  await page.setViewportSize({ width: 1280, height: 800 });

  // Step 12: Customer /track shows Sudah diserahkan
  await page.goto(`${baseUrl}/track`, { waitUntil: 'networkidle' });
  await page.fill('#tracking-id', orderId);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);
  await markStep(12, 'track-delivered');

  await client.send('Page.stopScreencast');
  await browser.close();

  fs.writeFileSync(logPath, stepLogs.join('\n') + '\n');
  execSync(`ffmpeg -y -framerate 2 -i "${castDir}/frame-%05d.jpg" -c:v libx264 -pix_fmt yuv420p -vf "scale=1280:800" "${videoPath}"`, { stdio: 'inherit' });
  console.log('STAGE5_COMPLETE:', { videoPath, logPath, frames: frameIdx });
}

run().catch((err) => {
  console.error('STAGE5_FAILED:', err);
  process.exit(1);
});
