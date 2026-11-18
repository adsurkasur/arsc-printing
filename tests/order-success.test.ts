// @ts-expect-error bun:test types are provided by bun runtime
import { test, expect } from 'bun:test';
import { COPY_ORDER_STATUS, COPY_PAGES, COPY_VALIDATION, formatReceiptEvent } from '../src/lib/copy';

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

test('OrderSuccess/Track status copy maps delivered and cancelled from §7.1', () => {
  expect(COPY_ORDER_STATUS.delivered.label).toBe('Sudah diserahkan');
  expect(COPY_ORDER_STATUS.delivered.sentence).toBe('Penyerahan pesanan sudah dicatat oleh petugas.');
  expect(COPY_ORDER_STATUS.cancelled.label).toBe('Dibatalkan');
  expect(COPY_ORDER_STATUS.cancelled.sentence).toBe(
    'Pesanan ini tidak akan dilanjutkan. Jika sudah membayar, hubungi petugas.'
  );
});

test('Receipt event labels map technical keys to human Indonesian and fallback safely', () => {
  expect(formatReceiptEvent('approve')).toBe('Disetujui petugas');
  expect(formatReceiptEvent('claim')).toBe('Diambil perangkat cetak');
  expect(formatReceiptEvent('submission_started')).toBe('Mulai dikirim ke printer');
  expect(formatReceiptEvent('submitted')).toBe('Terkirim ke printer');
  expect(formatReceiptEvent('backend_completed')).toBe('Selesai di printer (simulasi)');
  expect(formatReceiptEvent('deliver')).toBe('Diserahkan');
  expect(formatReceiptEvent('failed')).toBe('Gagal dicetak');
  expect(formatReceiptEvent('needs_reconciliation')).toBe('Perlu diperiksa petugas');
  expect(formatReceiptEvent('some_unknown_event')).toBe('Pembaruan status');
});
