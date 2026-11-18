import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { randomUUID, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3019';
const outDir = 'E:/OpenBot/recordings/redesign/spacing';
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { width: 375, height: 812, pad: 16 },
  { width: 768, height: 1024, pad: 24 },
  { width: 1280, height: 800, pad: 32 },
  { width: 1440, height: 900, pad: 32 },
];

async function checkEdges(page, route, vp, isAdmin = false) {
  const offenders = await page.evaluate(
    ({ vpWidth, pad, isAdmin }) => {
      const main = document.querySelector('main');
      if (!main) return ['No <main> element found'];
      const minLeft = isAdmin && vpWidth >= 1200 ? 88 + 32 : pad;
      const maxRight = vpWidth - pad;
      const bad = [];
      for (const el of main.querySelectorAll('h1,h2,h3,p,section,button,input,select,a,[role="status"]')) {
        if (el.closest('aside,nav,header,footer')) continue;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.left < minLeft - 1 || r.right > maxRight + 1) {
          bad.push(`${el.tagName.toLowerCase()}#${el.id || '.' + (el.className?.toString().split(' ')[0] || '')}: left=${Math.round(r.left)} (min ${minLeft}), right=${Math.round(r.right)} (max ${maxRight})`);
        }
      }
      return bad.slice(0, 10);
    },
    { vpWidth: vp.width, pad: vp.pad, isAdmin }
  );
  if (offenders.length > 0) {
    console.error(`EDGE_OFFENDERS [${route} @ ${vp.width}]:`, offenders);
  } else {
    console.log(`EDGE_OK [${route} @ ${vp.width}]`);
  }
  return offenders.length;
}

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.ARSC_LOCAL_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.ARSC_LOCAL_SUPABASE_SERVICE_ROLE_KEY;
  const backend = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const email = `e2e-edge-${randomUUID()}@example.test`;
  const password = randomBytes(24).toString('hex');
  const created = await backend.auth.admin.createUser({ email, password, email_confirm: true });
  await backend.from('user_roles').insert({ user_id: created.data.user.id, role: 'admin' });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  let totalOffenders = 0;

  // Public routes
  for (const [name, route] of [
    ['home', '/'],
    ['order-step1', '/order'],
    ['track', '/track'],
  ]) {
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      totalOffenders += await checkEdges(page, route, vp, false);
      if (vp.width === 375 || vp.width === 1280) {
        await page.screenshot({ path: path.join(outDir, `${name}-${vp.width}.png`) });
      }
    }
  }

  // Admin login + /admin
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${baseUrl}/admin/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600);

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(300);
    totalOffenders += await checkEdges(page, '/admin', vp, true);
    if (vp.width === 375 || vp.width === 1280) {
      await page.screenshot({ path: path.join(outDir, `admin-list-${vp.width}.png`) });
    }
  }

  await browser.close();
  console.log('EDGE_CHECK_TOTAL_OFFENDERS:', totalOffenders);
  if (totalOffenders > 0) process.exit(1);
}

run().catch((err) => {
  console.error('EDGE_CHECK_FAILED:', err);
  process.exit(1);
});
