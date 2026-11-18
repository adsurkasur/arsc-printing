// @ts-expect-error bun:test types are provided by bun runtime
import { test, expect } from 'bun:test';
import { fetchQueueCount, formatQueueStripText } from '../src/components/HomeQueueStrip';
import { COPY_LOADING, COPY_TOASTS } from '../src/lib/copy';

test('HomeQueueStrip shows real count on success', async () => {
  const mockFetch = (async () =>
    new Response(JSON.stringify({ count: 42, estimatedTime: 120 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })) as unknown as typeof fetch;

  const state = await fetchQueueCount(mockFetch);
  expect(state).toEqual({ status: 'ready', count: 42 });
  expect(formatQueueStripText(state)).toBe('42 pesanan dalam antrean');
});

test('HomeQueueStrip shows loading text while pending', () => {
  const text = formatQueueStripText({ status: 'loading' });
  expect(text).toBe(COPY_LOADING.list);
  expect(/\d/.test(text)).toBe(false);
});

test('HomeQueueStrip shows unavailable text with no digit on failure', async () => {
  const mockFetch = (async () => {
    throw new Error('network down');
  }) as unknown as typeof fetch;

  const state = await fetchQueueCount(mockFetch);
  expect(state).toEqual({ status: 'error' });
  const text = formatQueueStripText(state);
  expect(text).toBe(COPY_TOASTS.backendUnavailable);
  expect(/\d/.test(text)).toBe(false);
});
