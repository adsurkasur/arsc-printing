// Run: bun run test:unit  (node --test with native TypeScript type stripping)
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeBasePath, withBase } from './base-path.ts'

test('empty base path keeps root-relative URLs unchanged (standalone production)', () => {
  assert.equal(normalizeBasePath(undefined), '')
  assert.equal(normalizeBasePath(''), '')
  assert.equal(withBase('/api/orders', ''), '/api/orders')
})

test('zone base path prefixes root-relative URLs only', () => {
  const base = normalizeBasePath('/app/printing/')
  assert.equal(base, '/app/printing')
  assert.equal(withBase('/api/orders?id=1', base), '/app/printing/api/orders?id=1')
  assert.equal(withBase('/qris-arsc.jpeg', base), '/app/printing/qris-arsc.jpeg')
  assert.equal(withBase('https://cdn.example/qris.png', base), 'https://cdn.example/qris.png')
  assert.equal(withBase('//cdn.example/x.png', base), '//cdn.example/x.png')
})

test('invalid base paths fail fast', () => {
  assert.throws(() => normalizeBasePath('app/printing'))
  assert.throws(() => normalizeBasePath('/app printing'))
})
