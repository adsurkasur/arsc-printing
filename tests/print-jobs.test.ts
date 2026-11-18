import { test } from 'node:test'
import assert from 'node:assert/strict'
import { transition, expiryStatus, assertFence, validateEvent, JobError, localDb, readJson, jobFailure, workerAuth } from '../src/lib/print-jobs'

test('submit requires durable submission boundary; completion requires receipt', () => {
  assert.throws(() => transition('claimed', 'submitted', false), /INVALID_TRANSITION/)
  assert.equal(transition('claimed', 'submission_started', false), 'claimed')
  assert.equal(transition('claimed', 'submitted', true), 'submitted')
  assert.equal(transition('submitted', 'backend_completed', true), 'backend_completed')
  assert.throws(() => transition('ready', 'backend_completed', false), JobError)
})
test('terminal states cannot be overwritten and uncertain results cannot become ready', () => {
  for (const s of ['failed', 'backend_completed', 'needs_reconciliation'] as const) {
    assert.throws(() => transition(s, 'heartbeat', true), /INVALID_TRANSITION/)
  }
  assert.equal(transition('claimed', 'uncertain', true), 'needs_reconciliation')
  assert.throws(() => transition('claimed', 'failed', true), /INVALID_TRANSITION/)
})
test('only pre-submit leases can return to ready, with a bounded attempt count', () => {
  assert.equal(expiryStatus('claimed', false, 1), 'ready')
  assert.equal(expiryStatus('claimed', false, 3), 'failed')
  assert.equal(expiryStatus('claimed', true, 1), 'needs_reconciliation')
  assert.equal(expiryStatus('submitted', true, 1), 'needs_reconciliation')
})
test('fence rejects other workers, stale tokens/generations/versions and expired leases', () => {
  const fence = { workerId: 'a', tokenHash: 'hash', generation: 2, version: 4, leaseUntil: 2000 }
  const request = { workerId: 'a', tokenHash: 'hash', generation: 2, version: 4 }
  assert.doesNotThrow(() => assertFence(fence, request, 1000))
  for (const patch of [{workerId:'b'}, {tokenHash:'bad'}, {generation:1}, {version:3}]) {
    assert.throws(() => assertFence(fence, {...request, ...patch}, 1000), JobError)
  }
  assert.throws(() => assertFence(fence, request, 2000), /STALE_CLAIM/)
})
test('event boundary rejects arbitrary states, absent receipt, and arbitrary error text', () => {
  const base = {eventId:'b969ec26-e046-4dbb-864f-2176237341f4',type:'heartbeat',version:0,generation:1,claimToken:'a'.repeat(64)}
  assert.equal(validateEvent(base).type, 'heartbeat')
  assert.throws(() => validateEvent({...base,type:'ready'}), /INVALID_INPUT/)
  assert.throws(() => validateEvent({...base,type:'submitted'}), /INVALID_INPUT/)
  assert.throws(() => validateEvent({...base,type:'failed',errorCode:'private document text'}), /INVALID_INPUT/)
})
test('local backend fails closed for missing config and remote URLs without connecting', () => {
  const names = ['ARSC_LOCAL_MODE','ARSC_LOCAL_SUPABASE_URL','ARSC_LOCAL_SUPABASE_SERVICE_ROLE_KEY'] as const
  const previous = names.map(name => process.env[name])
  try {
    for (const name of names) delete process.env[name]
    assert.throws(localDb, /LOCAL_BACKEND_UNAVAILABLE/)
    process.env.ARSC_LOCAL_MODE='true'
    process.env.ARSC_LOCAL_SUPABASE_URL='https://example.invalid'
    process.env.ARSC_LOCAL_SUPABASE_SERVICE_ROLE_KEY='synthetic-not-a-real-key'
    assert.throws(localDb, /LOCAL_BACKEND_UNAVAILABLE/)
  } finally {
    names.forEach((name,index) => {if(previous[index]===undefined)delete process.env[name];else process.env[name]=previous[index]})
  }
})
test('unauthenticated worker is rejected before any database access', async () => {
  await assert.rejects(workerAuth(new Request('http://localhost/api/worker/claim')), /UNAUTHENTICATED/)
})
test('bounded JSON rejects invalid or oversized input; errors never echo diagnostics', async () => {
  await assert.rejects(readJson(new Request('http://localhost',{method:'POST',body:'invalid'})),/INVALID_INPUT/)
  await assert.rejects(readJson(new Request('http://localhost',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({value:'x'.repeat(9000)})})),/INVALID_INPUT/)
  const response=jobFailure(new Error('private bearer credential'))
  assert.equal(response.status,500)
  assert.equal(response.headers.get('cache-control'),'no-store')
  assert.equal((await response.text()).includes('credential'),false)
})
