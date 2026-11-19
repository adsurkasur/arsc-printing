import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { randomUUID, randomBytes } from 'node:crypto';
import fs from 'node:fs';

const BASE_URL = 'http://127.0.0.1:3019';

async function run() {
  const supabaseUrl = process.env.ARSC_LOCAL_SUPABASE_URL;
  const serviceKey = process.env.ARSC_LOCAL_SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error('Missing Supabase env');

  const backend = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const email = `e2e-audit-${randomUUID()}@example.test`;
  const password = randomBytes(24).toString('hex');
  const created = await backend.auth.admin.createUser({ email, password, email_confirm: true });
  const userId = created.data.user.id;
  await backend.from('user_roles').insert({ user_id: userId, role: 'admin' });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const consoleErrors = [];
  const consoleWarnings = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`${page.url()}: ${msg.text()}`);
    if (msg.type() === 'warning') consoleWarnings.push(`${page.url()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(`${page.url()} [pageerror]: ${err.message}`);
  });

  try {
    // 1. Public pages console audit
    for (const route of ['/', '/order', '/order-success', '/track', '/queue', '/admin/login']) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
    }

    // 2. Keyboard Tab/focus check on /order
    await page.goto(`${BASE_URL}/order`, { waitUntil: 'networkidle' });
    const orderTabs = [];
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const r = el.getBoundingClientRect();
        return { tag: el.tagName, id: el.id || null, w: Math.round(r.width), h: Math.round(r.height) };
      });
      if (info) orderTabs.push(info);
    }
    console.log('TAB_AUDIT_ORDER:', JSON.stringify(orderTabs));

    // 3. Admin login + Tab/focus check on /admin
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin', { timeout: 15000 });
    await page.waitForTimeout(600);

    const adminTabs = [];
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const r = el.getBoundingClientRect();
        return { tag: el.tagName, id: el.id || null, w: Math.round(r.width), h: Math.round(r.height) };
      });
      if (info) adminTabs.push(info);
    }
    console.log('TAB_AUDIT_ADMIN:', JSON.stringify(adminTabs));

    // 4. Cancel flow e2e: cancel an active order on /admin
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const cancelBtn = page.locator('button:has-text("Batalkan")').first();
    await cancelBtn.click();
    await page.waitForTimeout(300);
    const confirmCancel = page.locator('[role="dialog"] button:has-text("Batalkan")').first();
    if (await confirmCancel.isVisible()) {
      await confirmCancel.click();
    }
    await page.waitForTimeout(800);
    const bodyText = await page.locator('body').innerText();
    if (!bodyText.includes('Dibatalkan')) {
      throw new Error('Cancel flow failed: Dibatalkan not found on /admin');
    }
    console.log('E2E_CANCEL_PASS: order cancelled -> Dibatalkan');

    console.log(`CONSOLE_ERRORS: ${consoleErrors.length}`);
    console.log(`CONSOLE_WARNINGS: ${consoleWarnings.length}`);
    if (consoleErrors.length > 0) {
      console.error('CONSOLE_ERROR_LIST:', consoleErrors);
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
    await backend.from('user_roles').delete().eq('user_id', userId);
    await backend.auth.admin.deleteUser(userId);
  }
}

run().catch((err) => {
  console.error('FINAL_RUN_AUDIT_FAILED:', err);
  process.exit(1);
});
