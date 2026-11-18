import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { PrintWorker } from './main.mjs';
import { WorkerState } from './state.mjs';
import { FakePrinterAdapter } from './fake-printer.mjs';

function createMockServer(routes = {}) {
  const requests = [];
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let parsedBody = null;
      try { parsedBody = JSON.parse(body); } catch (e) {}

      const record = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: parsedBody,
        rawBody: body
      };
      requests.push(record);

      const handler = routes[req.url] || routes[`${req.method} ${req.url}`] || routes['default'];
      if (handler) {
        handler(req, res, record);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'not found' } }));
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({
        server,
        port,
        baseUrl: `http://127.0.0.1:${port}`,
        requests,
        close: () => new Promise(r => server.close(r))
      });
    });
  });
}

const TEST_DIR = path.join(process.cwd(), '.test-worker-env');

function setupTestEnv() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });
  const stateDir = path.join(TEST_DIR, 'state');
  const tempDir = path.join(TEST_DIR, 'tmp');
  const receiptsDir = path.join(TEST_DIR, 'receipts');
  return { stateDir, tempDir, receiptsDir };
}

function cleanupTestEnv() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

const VALID_PDF = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
const VALID_PDF_HASH = crypto.createHash('sha256').update(VALID_PDF).digest('hex');

test('1. Normal execution path completes backend_completed with receipt', async () => {
  const env = setupTestEnv();
  const jobId = crypto.randomUUID();

  let storageDownloadPort = null;
  const storageServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/pdf' });
    res.end(VALID_PDF);
  });
  await new Promise(r => storageServer.listen(0, '127.0.0.1', r));
  storageDownloadPort = storageServer.address().port;

  const mock = await createMockServer({
    'POST /api/worker/claim': (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        job: {
          id: jobId,
          orderId: 'order-123',
          status: 'claimed',
          version: 1,
          generation: 1,
          claimToken: 'token-abc-123',
          leaseUntil: '2026-11-18T00:01:00Z',
          printerKey: 'fake',
          document: {
            sha256: VALID_PDF_HASH,
            size: VALID_PDF.length
          },
          options: { copies: 1, paperSize: 'A4' }
        }
      }));
    },
    [`GET /api/worker/jobs/${jobId}/document`]: (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        url: `http://127.0.0.1:${storageDownloadPort}/storage/v1/object/signed/test.pdf`,
        expiresIn: 60,
        sha256: VALID_PDF_HASH,
        size: VALID_PDF.length
      }));
    },
    [`POST /api/worker/jobs/${jobId}/events`]: (req, res, record) => {
      const curVer = record.body.version || 1;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        job: {
          id: jobId,
          status: record.body.type === 'backend_completed' ? 'backend_completed' : 'claimed',
          version: curVer + 1,
          generation: 1,
          leaseUntil: '2026-11-18T00:02:00Z'
        }
      }));
    }
  });

  try {
    const printer = new FakePrinterAdapter({ receiptsDir: env.receiptsDir });
    const worker = new PrintWorker({
      apiBaseUrl: mock.baseUrl,
      stateDir: env.stateDir,
      tempDir: env.tempDir,
      printer
    });

    const job = await worker.claimJob();
    assert.ok(job);
    assert.equal(job.id, jobId);
    assert.equal(job.version, 1);

    const result = await worker.processJob(job);
    assert.equal(result.success, true);
    assert.equal(result.status, 'backend_completed');
    assert.ok(result.receipt);
    assert.equal(result.receipt.fileHash, VALID_PDF_HASH);

    // Verify receipt persisted on disk
    assert.ok(printer.hasReceipt(jobId));

    // Verify temp file cleaned up
    const tempFiles = fs.readdirSync(env.tempDir);
    assert.equal(tempFiles.length, 0);

    // Verify journal cleared on success
    const journals = worker.state.listUnfinishedJournals();
    assert.equal(journals.length, 0);
  } finally {
    storageServer.close();
    await mock.close();
    cleanupTestEnv();
  }
});

test('2. Two workers claim at the same time and only one wins', async () => {
  const env = setupTestEnv();
  const singleJobId = crypto.randomUUID();
  let claimCount = 0;

  const mock = await createMockServer({
    'POST /api/worker/claim': (req, res) => {
      claimCount++;
      if (claimCount === 1) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          job: {
            id: singleJobId,
            status: 'claimed',
            version: 1,
            generation: 1,
            claimToken: 'token-winner'
          }
        }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ job: null }));
      }
    }
  });

  try {
    const workerA = new PrintWorker({ apiBaseUrl: mock.baseUrl, stateDir: path.join(env.stateDir, 'a'), tempDir: env.tempDir });
    const workerB = new PrintWorker({ apiBaseUrl: mock.baseUrl, stateDir: path.join(env.stateDir, 'b'), tempDir: env.tempDir });

    const [jobA, jobB] = await Promise.all([
      workerA.claimJob('req-1'),
      workerB.claimJob('req-2')
    ]);

    const winnerCount = (jobA ? 1 : 0) + (jobB ? 1 : 0);
    assert.equal(winnerCount, 1);
    if (jobA) assert.equal(jobB, null);
    if (jobB) assert.equal(jobA, null);
  } finally {
    await mock.close();
    cleanupTestEnv();
  }
});

test('3. Dropped ACK after submit leads to needs_reconciliation, not a resubmit', async () => {
  const env = setupTestEnv();
  const jobId = crypto.randomUUID();
  let submitEventCalls = 0;

  let storagePort = null;
  const storageServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/pdf' });
    res.end(VALID_PDF);
  });
  await new Promise(r => storageServer.listen(0, '127.0.0.1', r));
  storagePort = storageServer.address().port;

  const mock = await createMockServer({
    [`GET /api/worker/jobs/${jobId}/document`]: (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        url: `http://127.0.0.1:${storagePort}/storage/test.pdf`,
        sha256: VALID_PDF_HASH,
        size: VALID_PDF.length
      }));
    },
    [`POST /api/worker/jobs/${jobId}/events`]: (req, res, record) => {
      if (record.body.type === 'submitted') {
        submitEventCalls++;
        // Drop network / abort connection abruptly
        res.destroy();
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ job: { id: jobId, version: (record.body.version || 1) + 1 } }));
    }
  });

  try {
    const printer = new FakePrinterAdapter({ receiptsDir: env.receiptsDir });
    const worker = new PrintWorker({
      apiBaseUrl: mock.baseUrl,
      stateDir: env.stateDir,
      tempDir: env.tempDir,
      printer,
      maxTransportRetries: 1
    });

    const job = {
      id: jobId,
      version: 1,
      generation: 1,
      claimToken: 'fence-3',
      document: { sha256: VALID_PDF_HASH, size: VALID_PDF.length }
    };
    const result = await worker.processJob(job);

    assert.equal(result.success, false);
    assert.equal(result.status, 'needs_reconciliation');
    assert.equal(result.error, 'DROPPED_ACK_AFTER_SUBMIT');

    // Confirm receipt exists on disk (it was actually submitted)
    assert.ok(printer.hasReceipt(jobId));

    // Confirm retried transport for submitted event
    assert.equal(submitEventCalls, 2);
  } finally {
    storageServer.close();
    await mock.close();
    cleanupTestEnv();
  }
});

test('4. Crash restart recovery at each boundary', async () => {
  const env = setupTestEnv();
  const state = new WorkerState(env.stateDir);
  const printer = new FakePrinterAdapter({ receiptsDir: env.receiptsDir });

  // Boundary A: Crash during claimed stage (before submit intent)
  const jobA = 'crash-job-a';
  state.writeJournalAtomic(jobA, { jobId: jobA, stage: 'claimed' });

  // Boundary B: Crash during submit_intent with receipt exists
  const jobB = 'crash-job-b';
  state.writeJournalAtomic(jobB, { jobId: jobB, stage: 'submit_intent', version: 2, generation: 1, claimToken: 'token-b' });
  fs.writeFileSync(printer.getReceiptPath(jobB), JSON.stringify({ jobId: jobB, backendJobId: 'bk-b', status: 'accepted' }));

  // Boundary C: Crash during submit_intent without receipt
  const jobC = 'crash-job-c';
  state.writeJournalAtomic(jobC, { jobId: jobC, stage: 'submit_intent', version: 3, generation: 1, claimToken: 'token-c' });

  const mock = await createMockServer({
    'default': (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    }
  });

  try {
    const worker = new PrintWorker({
      apiBaseUrl: mock.baseUrl,
      stateDir: env.stateDir,
      tempDir: env.tempDir,
      printer
    });

    const recoveries = await worker.recoverOnStartup();
    assert.equal(recoveries.length, 3);

    const recA = recoveries.find(r => r.jobId === jobA);
    const recB = recoveries.find(r => r.jobId === jobB);
    const recC = recoveries.find(r => r.jobId === jobC);

    assert.equal(recA.action, 'discarded_claim');
    assert.equal(recB.action, 'reconciled');
    assert.equal(recC.action, 'reconciled');

    // Journals are cleared
    assert.equal(state.listUnfinishedJournals().length, 0);
  } finally {
    await mock.close();
    cleanupTestEnv();
  }
});

test('5. Corrupt, oversized file, and hash mismatch are rejected', async () => {
  const env = setupTestEnv();
  const jobIdOversized = 'job-oversized';
  const jobIdHashMismatch = 'job-mismatch';
  const jobIdCorrupt = 'job-corrupt';

  let storagePort = null;
  const storageServer = http.createServer((req, res) => {
    if (req.url.includes(jobIdOversized)) {
      res.writeHead(200);
      res.end(Buffer.alloc(2000, 0x41)); // exceeds cap=1000
    } else if (req.url.includes(jobIdHashMismatch)) {
      res.writeHead(200);
      res.end(VALID_PDF);
    } else {
      res.writeHead(200);
      res.end(Buffer.from('NOT-A-PDF-CONTENT'));
    }
  });
  await new Promise(r => storageServer.listen(0, '127.0.0.1', r));
  storagePort = storageServer.address().port;

  const mock = await createMockServer({
    [`GET /api/worker/jobs/${jobIdOversized}/document`]: (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ url: `http://127.0.0.1:${storagePort}/${jobIdOversized}`, size: 2000 }));
    },
    [`GET /api/worker/jobs/${jobIdHashMismatch}/document`]: (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ url: `http://127.0.0.1:${storagePort}/${jobIdHashMismatch}`, sha256: '0000000000000000000000000000000000000000000000000000000000000000' }));
    },
    [`GET /api/worker/jobs/${jobIdCorrupt}/document`]: (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ url: `http://127.0.0.1:${storagePort}/${jobIdCorrupt}` }));
    },
    'default': (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    }
  });

  try {
    const printer = new FakePrinterAdapter({ receiptsDir: env.receiptsDir });
    const worker = new PrintWorker({
      apiBaseUrl: mock.baseUrl,
      stateDir: env.stateDir,
      tempDir: env.tempDir,
      printer,
      maxFileSizeBytes: 1000 // test cap
    });

    // Test Oversized
    const resOver = await worker.processJob({ id: jobIdOversized, version: 1, generation: 1, claimToken: 'f1' });
    assert.equal(resOver.success, false);
    assert.match(resOver.error, /exceeds limit/);

    // Test Hash mismatch
    const resHash = await worker.processJob({
      id: jobIdHashMismatch,
      version: 1,
      generation: 1,
      claimToken: 'f2',
      document: { sha256: '0000000000000000000000000000000000000000000000000000000000000000' }
    });
    assert.equal(resHash.success, false);
    assert.match(resHash.error, /Hash mismatch/);

    // Test Corrupt Header
    const resCorrupt = await worker.processJob({ id: jobIdCorrupt, version: 1, generation: 1, claimToken: 'f3' });
    assert.equal(resCorrupt.success, false);
    assert.match(resCorrupt.error, /missing %PDF- header/);

    // Printer must NEVER have been called
    assert.equal(printer.hasReceipt(jobIdOversized), false);
    assert.equal(printer.hasReceipt(jobIdHashMismatch), false);
    assert.equal(printer.hasReceipt(jobIdCorrupt), false);
  } finally {
    storageServer.close();
    await mock.close();
    cleanupTestEnv();
  }
});

test('6. Transport timeouts and retries work; 401 stops worker immediately', async () => {
  const env = setupTestEnv();
  let retryCounts = 0;

  const mock = await createMockServer({
    'POST /api/worker/claim': (req, res) => {
      retryCounts++;
      if (retryCounts <= 2) {
        res.writeHead(503);
        res.end(JSON.stringify({ error: 'Server busy' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ job: null }));
      }
    },
    'POST /api/worker/auth-fail': (req, res) => {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: { code: 'UNAUTHENTICATED' } }));
    }
  });

  try {
    const worker = new PrintWorker({
      apiBaseUrl: mock.baseUrl,
      stateDir: env.stateDir,
      tempDir: env.tempDir,
      maxTransportRetries: 3
    });

    // Test retry succeeds on 3rd attempt
    const job = await worker.claimJob();
    assert.equal(job, null);
    assert.equal(retryCounts, 3);

    // Test 401 halts immediately without retries
    await assert.rejects(
      () => worker.fetchWithRetry(`${mock.baseUrl}/api/worker/auth-fail`, { method: 'POST' }),
      (err) => {
        assert.equal(err.status, 401);
        assert.equal(err.fatal, true);
        return true;
      }
    );
  } finally {
    await mock.close();
    cleanupTestEnv();
  }
});

test('7. Callback failure after fake submit triggers needs_reconciliation', async () => {
  const env = setupTestEnv();
  const jobId = crypto.randomUUID();

  let storagePort = null;
  const storageServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/pdf' });
    res.end(VALID_PDF);
  });
  await new Promise(r => storageServer.listen(0, '127.0.0.1', r));
  storagePort = storageServer.address().port;

  const mock = await createMockServer({
    [`GET /api/worker/jobs/${jobId}/document`]: (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ url: `http://127.0.0.1:${storagePort}/test.pdf`, sha256: VALID_PDF_HASH, size: VALID_PDF.length }));
    },
    [`POST /api/worker/jobs/${jobId}/events`]: (req, res, record) => {
      if (record.body.type === 'backend_completed') {
        // Backend internal error on callback
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'DB transaction failed' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ job: { id: jobId, version: (record.body.version || 1) + 1 } }));
    }
  });

  try {
    const printer = new FakePrinterAdapter({ receiptsDir: env.receiptsDir });
    const worker = new PrintWorker({
      apiBaseUrl: mock.baseUrl,
      stateDir: env.stateDir,
      tempDir: env.tempDir,
      printer,
      maxTransportRetries: 1
    });

    const job = {
      id: jobId,
      version: 1,
      generation: 1,
      claimToken: 'fence-7',
      document: { sha256: VALID_PDF_HASH, size: VALID_PDF.length }
    };
    const res = await worker.processJob(job);

    assert.equal(res.status, 'needs_reconciliation');
    assert.equal(res.error, 'CALLBACK_FAILED');
    assert.ok(printer.hasReceipt(jobId));
  } finally {
    storageServer.close();
    await mock.close();
    cleanupTestEnv();
  }
});

test('8. Secret and URL redaction: no tokens or URLs appear in logs', async () => {
  const env = setupTestEnv();
  const secretToken = 'super-secret-worker-token-xyz-987';
  const privateUrl = 'http://secret-domain.local/internal/v1/jobs';

  const worker = new PrintWorker({
    stateDir: env.stateDir,
    tempDir: env.tempDir,
    workerSecret: secretToken
  });

  worker.log('info', `Connecting to ${privateUrl} with bearer ${worker.getBearerToken()}`, {
    url: privateUrl,
    token: worker.getBearerToken()
  });

  const logged = worker.logs[0];
  assert.ok(!logged.msg.includes(secretToken));
  assert.ok(!logged.msg.includes(privateUrl));
  assert.ok(logged.msg.includes('[REDACTED_TOKEN]'));
  assert.ok(logged.msg.includes('[REDACTED_URL]'));
  assert.equal(logged.meta.token, '[REDACTED_TOKEN]');
  assert.equal(logged.meta.url, '[REDACTED_URL]');

  cleanupTestEnv();
});


test('9. Every event uses UUID and only protocol v1 fields', async () => {
  const env = setupTestEnv();
  const worker = new PrintWorker({stateDir: env.stateDir, tempDir: env.tempDir});
  const bodies = [];
  worker.fetchWithRetry = async (_url, options) => {
    bodies.push(JSON.parse(options.body));
    return {ok: true, json: async () => ({})};
  };
  const job = {id: crypto.randomUUID(), version: 1, generation: 1, claimToken: 'a'.repeat(64)};
  for (const type of ['heartbeat', 'submission_started', 'submitted', 'backend_completed', 'failed', 'uncertain']) {
    await worker.sendEvent(job, type, {backendJobId: 'fake-job', backendInstanceId: 'fake',
      errorCode: 'BACKEND_FAILED', receipt: {local: true}, errorMessage: 'private diagnostic'});
  }
  const allowed = new Set(['eventId', 'type', 'version', 'generation', 'claimToken', 'backendJobId', 'backendInstanceId', 'errorCode']);
  assert.equal(bodies.length, 6);
  for (const body of bodies) {
    assert.match(body.eventId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    assert.ok(Object.keys(body).every(key => allowed.has(key)));
    assert.equal(body.receipt, undefined);
    assert.equal(body.errorMessage, undefined);
  }
});
