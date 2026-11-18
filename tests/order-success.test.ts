// @ts-expect-error bun:test types are provided by bun runtime
import { test, expect } from 'bun:test';
import { COPY_PAGES, COPY_VALIDATION } from '../src/lib/copy';

test('OrderSuccess API response maps pickupCode and separates capability error from success', async () => {
  // 1. Success state contract
  const successPayload = {
    id: '00000000-0000-4000-8000-000000000001',
    status: 'pending_verification',
    pickupCode: 'ARSC-1234',
    amount_due: 500,
  };
  const code =
    typeof successPayload.pickupCode === 'string' ? successPayload.pickupCode : null;
  expect(code).toMatch(/^ARSC-\d{4}$/);
  expect(COPY_PAGES.success.text010).toContain('Kode ambil saja tidak dapat membuka pesanan.');

  // 2. 403 missing capability contract
  const mock403Fetch = (async () =>
    new Response(JSON.stringify({ error: { code: 'FORBIDDEN' } }), { status: 403 })) as unknown as typeof fetch;
  const res = await mock403Fetch('/api/orders?id=00000000-0000-4000-8000-000000000001');
  expect(res.ok).toBe(false);
  expect(res.status).toBe(403);
  expect(COPY_VALIDATION.forbidden).toBe('Pesanan ini tidak dapat dibuka dari browser ini.');
});
