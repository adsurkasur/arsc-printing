import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { PrintWorker } from '../worker/main.mjs';
import { FakePrinterAdapter } from '../worker/fake-printer.mjs';

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3019';
const outDir = process.env.E2E_OUT_DIR || 'E:/OpenBot/recordings/redesign/stage4';
fs.mkdirSync(outDir, { recursive: true });

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.ARSC_LOCAL_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.ARSC_LOCAL_SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase URL or service-role key in env');
  }

  const backend = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const email = `e2e-admin-${randomUUID()}@example.test`;
  const password = randomBytes(24).toString('hex');
  const created = await backend.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.error || !created.data.user) {
    throw new Error('Failed to create synthetic admin');
  }
  const grant = await backend.from('user_roles').insert({ user_id: created.data.user.id, role: 'admin' });
  if (grant.error) throw new Error('Failed to grant admin role');

  const workerId = randomUUID();
  const workerSecret = randomBytes(24).toString('hex');
  const reg = await backend.from('print_workers').insert({
    id: workerId,
    credential_hash: createHash('sha256').update(workerSecret).digest('hex'),
    printer_key: 'fake',
  });
  if (reg.error) throw new Error('Failed to register synthetic worker');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // 1. Create customer order
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
  const pickupCode = successText.match(/ARSC-\d{4}/)?.[0] || '';
  console.log('E2E_ADMIN_ORDER:', { orderId, pickupCode });

  // 2. Admin login
  page.on('response', async (res) => {
    if (res.url().includes('/api/admin/orders')) {
      const body = await res.text().catch(() => '');
      console.log('E2E_ADMIN_ORDERS_API:', res.request().method(), res.status(), body.slice(0, 300));
    }
  });
  await page.goto(`${baseUrl}/admin/login`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outDir, 'admin-login-1280.png') });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 3. Search pickup code
  const searchInput = page.locator('#admin-search-input');
  await searchInput.waitFor({ state: 'visible', timeout: 10000 });
  await searchInput.fill(pickupCode);
  await searchInput.press('Enter');
  await page.locator(`text=${pickupCode}`).first().waitFor({ state: 'visible', timeout: 15000 });
  console.log('E2E_ADMIN_SEARCH:', pickupCode, 'visible');
  await page.screenshot({ path: path.join(outDir, 'admin-list-1280.png') });

  // 4. Verify payment & Approve (with M3 confirmation dialogs)
  const verifyBtn = page.locator('button:has-text("Verifikasi pembayaran")').first();
  await verifyBtn.waitFor({ state: 'visible', timeout: 10000 });
  await verifyBtn.click();
  const verifyConfirmBtn = page.locator('[role="dialog"] button:has-text("Verifikasi pembayaran")').first();
  await verifyConfirmBtn.waitFor({ state: 'visible', timeout: 5000 });
  await verifyConfirmBtn.click();
  await page.waitForTimeout(1500);
  console.log('E2E_ADMIN_VERIFY: confirmed');

  // Select our synthetic worker in #worker-select
  const workerSelect = page.locator('#worker-select');
  await workerSelect.waitFor({ state: 'visible', timeout: 10000 });
  await workerSelect.selectOption(workerId);

  const approveBtn = page.locator('button:has-text("Setujui cetak")').first();
  await approveBtn.waitFor({ state: 'visible', timeout: 10000 });
  await approveBtn.click();
  const approveConfirmBtn = page.locator('[role="dialog"] button:has-text("Setujui cetak")').first();
  await approveConfirmBtn.waitFor({ state: 'visible', timeout: 5000 });
  await approveConfirmBtn.click();
  await page.waitForTimeout(2000);
  const { data: ordAfter } = await backend.from('orders').select('status').eq('id', orderId).single();
  const { data: jobsAfter } = await backend.from('print_jobs').select('id, status, worker_id').eq('order_id', orderId);
  console.log('E2E_ADMIN_APPROVE:', { orderStatus: ordAfter?.status, jobs: jobsAfter });

  // 5. Run fake worker once
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
  if (!job) {
    throw new Error('PrintWorker.claimJob() returned null after approve');
  }
  await worker.processJob(job);
  console.log('E2E_ADMIN_WORKER_JOB:', job.id);
  await page.waitForTimeout(1500);
  await page.reload({ waitUntil: 'networkidle' });
  await searchInput.fill(pickupCode);
  await searchInput.press('Enter');
  await page.locator(`text=${pickupCode}`).first().waitFor({ state: 'visible', timeout: 15000 });
  await page.screenshot({ path: path.join(outDir, 'admin-completed-1280.png') });

  // 6. Open receipt & Deliver
  const receiptBtn = page.locator('button:has-text("Lihat rincian")').first();
  await receiptBtn.waitFor({ state: 'visible', timeout: 10000 });
  await receiptBtn.click();
  await page.locator('[role="dialog"]').waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outDir, 'admin-receipt-1280.png') });
  await page.locator('[role="dialog"] button:has-text("Tutup")').click();
  await page.waitForTimeout(500);

  const deliverBtn = page.locator('button:has-text("Konfirmasi penyerahan")').first();
  await deliverBtn.waitFor({ state: 'visible', timeout: 10000 });
  await deliverBtn.click();
  const deliverCheck = page.locator('[role="dialog"] input[type="checkbox"]').first();
  await deliverCheck.waitFor({ state: 'visible', timeout: 5000 });
  await deliverCheck.check();
  await page.locator('[role="dialog"] button:has-text("Sudah diserahkan")').click();
  await page.waitForTimeout(1500);
  console.log('E2E_ADMIN_DELIVER: confirmed');
  await page.screenshot({ path: path.join(outDir, 'admin-delivered-1280.png') });

  // 7. Customer track check
  await page.goto(`${baseUrl}/track`, { waitUntil: 'networkidle' });
  await page.fill('#tracking-id', orderId);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);
  const trackText = await page.locator('main').innerText();
  console.log('E2E_ADMIN_FINAL_TRACK:', trackText.replace(/\s+/g, ' ').trim().slice(0, 300));
  if (!/Sudah diserahkan/i.test(trackText)) {
    throw new Error(`Expected "Sudah diserahkan" on /track, got: ${trackText.slice(0, 200)}`);
  }

  await browser.close();
}

run().catch((err) => {
  console.error('E2E_ADMIN_FAILED:', err);
  process.exit(1);
});
