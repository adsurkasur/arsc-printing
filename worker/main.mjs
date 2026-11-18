import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { WorkerState } from './state.mjs';
import { FakePrinterAdapter } from './fake-printer.mjs';

/**
 * PrintWorker implements the robust, fault-tolerant Unit C worker protocol.
 * Aligned with docs/PRINT_JOB_CONTRACT.md (Print job protocol v1):
 * - Authorization: Bearer <worker-id>.<random-secret>
 * - Claim with requestId & printerKey -> { id, orderId, status, version, generation, claimToken, leaseUntil, printerKey, document: { sha256, size }, options }
 * - GET /api/worker/jobs/:id/document with X-Claim-Token, X-Lease-Generation -> { url, expiresIn, sha256, size }
 * - POST /api/worker/jobs/:id/events -> types: heartbeat, submission_started, submitted, backend_completed, failed, uncertain
 * - Heartbeat every 20s, increments version
 * - Fsync submit-intent journal BEFORE touching printer adapter
 * - POST submission_started BEFORE touching printer adapter
 * - Submit to fake printer adapter with stable job UUID as correlation key
 * - Persist receipt before reporting submitted
 * - Dropped ACK / uncertain outcome -> report 'uncertain' / needs_reconciliation, NEVER resubmit
 * - Max 3 transport retries with backoff; NO retry on 401/403/409
 * - Strict secret/URL/header redaction in logs
 */
export class PrintWorker {
  constructor(config = {}) {
    this.workerId = config.workerId || `worker-${crypto.randomUUID()}`;
    this.workerSecret = config.workerSecret || crypto.randomBytes(16).toString('hex');
    this.printerKey = config.printerKey || 'fake';
    this.apiBaseUrl = (config.apiBaseUrl || 'http://127.0.0.1:3000').replace(/\/$/, '');
    this.stateDir = config.stateDir || path.join(process.cwd(), '.worker-state');
    this.tempDir = config.tempDir || path.join(process.cwd(), '.worker-tmp');
    this.printer = config.printer || new FakePrinterAdapter({ printerKey: this.printerKey });
    
    this.state = new WorkerState(this.stateDir);
    this.heartbeatIntervalMs = config.heartbeatIntervalMs || 20000;
    this.maxTransportRetries = config.maxTransportRetries ?? 3;
    this.maxFileSizeBytes = config.maxFileSizeBytes || 10 * 1024 * 1024; // 10MiB cap per contract
    this.allowedOrigins = config.allowedOrigins || ['http://127.0.0.1', 'http://localhost'];

    this.isRunning = false;
    this.activeJob = null;
    this.heartbeatTimer = null;

    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    this.logs = [];
    this.onLog = config.onLog || null;
  }

  getBearerToken() {
    return `${this.workerId}.${this.workerSecret}`;
  }

  log(level, message, meta = {}) {
    const sanitizedMeta = { ...meta };
    for (const k of Object.keys(sanitizedMeta)) {
      if (typeof sanitizedMeta[k] === 'string') {
        sanitizedMeta[k] = this.sanitizeString(sanitizedMeta[k]);
      }
    }
    const cleanMsg = this.sanitizeString(message);
    const entry = {
      level,
      msg: cleanMsg,
      meta: sanitizedMeta,
      time: new Date().toISOString()
    };
    this.logs.push(entry);
    if (this.onLog) {
      this.onLog(entry);
    }
  }

  sanitizeString(str) {
    if (!str) return str;
    let s = String(str);
    const token = this.getBearerToken();
    if (token) s = s.replaceAll(token, '[REDACTED_TOKEN]');
    if (this.workerSecret) s = s.replaceAll(this.workerSecret, '[REDACTED_SECRET]');
    s = s.replace(/https?:\/\/[^\s"'<>]+/gi, '[REDACTED_URL]');
    return s;
  }

  async fetchWithRetry(url, options = {}, { maxRetries = this.maxTransportRetries, allow404 = false } = {}) {
    let attempt = 0;
    while (attempt <= maxRetries) {
      attempt++;
      try {
        const headers = {
          'Authorization': `Bearer ${this.getBearerToken()}`,
          ...(options.headers || {})
        };

        const res = await fetch(url, { ...options, headers });

        if (res.status === 401 || res.status === 403) {
          this.log('error', `Authentication error status ${res.status}. Halting retry.`);
          const err = new Error(`Auth failed with status ${res.status}`);
          err.status = res.status;
          err.fatal = true;
          throw err;
        }

        if (res.status === 400 || res.status === 409 || res.status === 410) {
          const errBody = await res.json().catch(() => ({}));
          const code = errBody?.error?.code || `HTTP_${res.status}`;
          const err = new Error(`Client/Conflict error ${res.status} (${code}): ${errBody?.error?.message || ''}`);
          err.status = res.status;
          err.code = code;
          err.fatal = true; // No retry on validation/conflict per contract
          throw err;
        }

        if (allow404 && res.status === 404) {
          return null;
        }

        if (!res.ok && res.status >= 500) {
          throw new Error(`Server error ${res.status}: ${res.statusText}`);
        }

        return res;
      } catch (err) {
        if (err.fatal) throw err;
        if (attempt > maxRetries) {
          this.log('error', `Max retries exceeded for request. Error: ${err.message}`);
          throw err;
        }
        const backoff = Math.min(100 * Math.pow(2, attempt), 2000);
        this.log('warn', `Transport attempt ${attempt} failed, retrying in ${backoff}ms...`);
        await new Promise(r => setTimeout(r, backoff));
      }
    }
  }

  async claimJob(requestId = crypto.randomUUID()) {
    const claimUrl = `${this.apiBaseUrl}/api/worker/claim`;
    const res = await this.fetchWithRetry(claimUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId,
        printerKey: this.printerKey
      })
    });

    if (!res || !res.ok) {
      return null;
    }

    const data = await res.json();
    if (!data || !data.job) {
      return null;
    }
    // job matches contract:
    // { id, orderId, status, version, generation, claimToken, leaseUntil, printerKey, document: { sha256, size }, options }
    return data.job;
  }

  async sendEvent(job, eventType, payload = {}) {
    const eventUrl = `${this.apiBaseUrl}/api/worker/jobs/${job.id}/events`;
    const eventId = crypto.randomUUID();
    // Only protocol v1 fields cross HTTP; receipts and diagnostics stay local.
    const wirePayload = Object.fromEntries(
      ["backendJobId", "backendInstanceId", "errorCode"]
        .filter(key => payload[key] !== undefined).map(key => [key, payload[key]])
    );
    const res = await this.fetchWithRetry(eventUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId,
        type: eventType,
        version: job.version,
        generation: job.generation,
        claimToken: job.claimToken,
        ...wirePayload
      })
    });

    if (res && res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data && data.job) {
        // Update local version tracking as returned by server
        job.version = data.job.version;
        job.leaseUntil = data.job.leaseUntil;
      }
      return data;
    }
    return null;
  }

  startHeartbeat(job) {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(async () => {
      try {
        await this.sendEvent(job, 'heartbeat');
        this.log('info', `Heartbeat sent for job ${job.id}, version updated to ${job.version}`);
      } catch (err) {
        this.log('warn', `Failed to send heartbeat: ${err.message}`);
      }
    }, this.heartbeatIntervalMs);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  async downloadAndVerifyDocument(job) {
    const docMetaUrl = `${this.apiBaseUrl}/api/worker/jobs/${job.id}/document`;
    const metaRes = await this.fetchWithRetry(docMetaUrl, {
      method: 'GET',
      headers: {
        'X-Claim-Token': job.claimToken,
        'X-Lease-Generation': String(job.generation)
      }
    });

    if (!metaRes || !metaRes.ok) {
      const err = new Error(`Failed to request document URL: HTTP ${metaRes?.status}`);
      err.code = 'DOWNLOAD_FAILED';
      throw err;
    }

    const docMeta = await metaRes.json();
    const targetDownloadUrl = docMeta.url;

    // Security check: worker pins configured storage origin & rejects redirects
    try {
      const parsedUrl = new URL(targetDownloadUrl);
      const isAllowed = this.allowedOrigins.some(origin => parsedUrl.origin.startsWith(origin));
      if (!isAllowed) {
        const err = new Error(`Untrusted storage download origin: ${parsedUrl.origin}`);
        err.code = 'DOWNLOAD_FAILED';
        throw err;
      }
    } catch (e) {
      const err = new Error(`Invalid download URL: ${e.message}`);
      err.code = 'DOWNLOAD_FAILED';
      throw err;
    }

    const downloadRes = await fetch(targetDownloadUrl, { redirect: 'error' });
    if (!downloadRes.ok) {
      const err = new Error(`Storage download failed with HTTP ${downloadRes.status}`);
      err.code = 'DOWNLOAD_FAILED';
      throw err;
    }

    const localFilePath = path.join(this.tempDir, `doc-${job.id}.pdf`);
    const arrayBuffer = await downloadRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Size checks (<= 10MiB cap per contract)
    if (buffer.length > this.maxFileSizeBytes) {
      const err = new Error(`File size ${buffer.length} exceeds limit ${this.maxFileSizeBytes}`);
      err.code = 'FILE_INVALID';
      throw err;
    }

    const expectedSize = job.document?.size || docMeta.size;
    if (expectedSize && buffer.length !== expectedSize) {
      const err = new Error(`File size ${buffer.length} does not match expected size ${expectedSize}`);
      err.code = 'FILE_INVALID';
      throw err;
    }

    // SHA-256 Hash check
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const expectedHash = job.document?.sha256 || docMeta.sha256;
    if (expectedHash && hash.toLowerCase() !== expectedHash.toLowerCase()) {
      const err = new Error(`Hash mismatch: got ${hash}, expected ${expectedHash}`);
      err.code = 'FILE_INVALID';
      throw err;
    }

    // PDF signature check
    if (buffer.length < 5 || buffer.toString('utf8', 0, 5) !== '%PDF-') {
      const err = new Error('Invalid file format: missing %PDF- header');
      err.code = 'FILE_INVALID';
      throw err;
    }

    fs.writeFileSync(localFilePath, buffer);
    return { localFilePath, hash, sizeBytes: buffer.length };
  }

  async processJob(job) {
    this.activeJob = job;
    let localFilePath = null;

    try {
      this.log('info', `Processing claimed job ${job.id}`);
      this.startHeartbeat(job);

      // Phase 1: Journal Claimed state
      this.state.writeJournalAtomic(job.id, {
        jobId: job.id,
        stage: 'claimed',
        version: job.version,
        generation: job.generation,
        claimToken: job.claimToken,
        options: job.options || {}
      });

      // Phase 2: Download & Validate File
      let docInfo;
      try {
        docInfo = await this.downloadAndVerifyDocument(job);
        localFilePath = docInfo.localFilePath;
      } catch (valErr) {
        this.log('error', `Document validation failed for job ${job.id}: ${valErr.message}`);
        await this.sendEvent(job, 'failed', {
          errorCode: valErr.code || 'FILE_INVALID',
          errorMessage: valErr.message
        }).catch(() => {});
        this.state.removeJournal(job.id);
        return { success: false, status: 'failed', error: valErr.message };
      }

      // Phase 3: FSYNC SUBMIT INTENT BEFORE TOUCHING PRINTER
      this.log('info', `Fsyncing submit-intent journal for job ${job.id}`);
      this.state.writeJournalAtomic(job.id, {
        jobId: job.id,
        stage: 'submit_intent',
        version: job.version,
        generation: job.generation,
        claimToken: job.claimToken,
        filePath: localFilePath,
        fileHash: docInfo.hash,
        options: job.options || {},
        submittedAt: Date.now()
      });

      // Phase 3b: Send submission_started event to server and await ACK
      try {
        await this.sendEvent(job, 'submission_started');
      } catch (subStartErr) {
        this.log('error', `Failed to send submission_started event: ${subStartErr.message}`);
        // If server rejected with 409 or network down, do not submit to printer!
        this.state.removeJournal(job.id);
        return { success: false, status: 'failed', error: subStartErr.message };
      }

      // Phase 4: Submit to printer adapter with stable job.id
      let receipt;
      try {
        receipt = await this.printer.submitJob({
          jobId: job.id,
          filePath: localFilePath,
          options: job.options || {}
        });
      } catch (submitErr) {
        this.log('error', `Printer submission rejected for job ${job.id}: ${submitErr.message}`);
        await this.sendEvent(job, 'failed', {
          errorCode: 'BACKEND_FAILED',
          errorMessage: submitErr.message
        }).catch(() => {});
        this.state.removeJournal(job.id);
        return { success: false, status: 'failed', error: submitErr.message };
      }

      // Phase 5: Journal Submitted state with receipt
      this.state.writeJournalAtomic(job.id, {
        jobId: job.id,
        stage: 'submitted',
        version: job.version,
        generation: job.generation,
        claimToken: job.claimToken,
        receipt
      });

      // Phase 6: Report Submitted to backend
      try {
        await this.sendEvent(job, 'submitted', {
          backendJobId: receipt.backendJobId,
          backendInstanceId: this.printer.printerKey,
          receipt
        });
      } catch (ackErr) {
        // Dropped ACK / network timeout after submit!
        // DO NOT RESUBMIT! Route to uncertain -> needs_reconciliation
        this.log('error', `Dropped ACK after submission for job ${job.id}. Flagging uncertain.`);
        await this.sendEvent(job, 'uncertain', {
          errorCode: 'SUBMIT_UNKNOWN',
          backendJobId: receipt.backendJobId,
          receipt
        }).catch(() => {});
        return { success: false, status: 'needs_reconciliation', error: 'DROPPED_ACK_AFTER_SUBMIT' };
      }

      // Phase 7: Backend completed callback
      try {
        await this.sendEvent(job, 'backend_completed', {
          backendJobId: receipt.backendJobId
        });
      } catch (cbErr) {
        this.log('warn', `Callback failure after submit: ${cbErr.message}. Marking uncertain.`);
        await this.sendEvent(job, 'uncertain', {
          errorCode: 'BACKEND_FAILED',
          backendJobId: receipt.backendJobId,
          receipt
        }).catch(() => {});
        return { success: true, status: 'needs_reconciliation', error: 'CALLBACK_FAILED' };
      }

      // Cleanup on successful completion
      this.state.removeJournal(job.id);
      return { success: true, status: 'backend_completed', receipt };

    } catch (unhandledErr) {
      this.log('error', `Unhandled job processing error: ${unhandledErr.message}`);
      await this.sendEvent(job, 'uncertain', {
        errorCode: 'SUBMIT_UNKNOWN',
        errorMessage: unhandledErr.message
      }).catch(() => {});
      return { success: false, status: 'needs_reconciliation', error: unhandledErr.message };
    } finally {
      this.stopHeartbeat();
      this.activeJob = null;
      if (localFilePath && fs.existsSync(localFilePath)) {
        try {
          fs.unlinkSync(localFilePath);
        } catch (e) {
          // ignore
        }
      }
    }
  }

  async recoverOnStartup() {
    this.log('info', 'Executing startup crash recovery scan...');
    const unfinished = this.state.listUnfinishedJournals();
    const recoveryResults = [];

    for (const record of unfinished) {
      this.log('warn', `Found unfinished journal for job ${record.jobId} at stage ${record.stage}`);
      
      if (record.stage === 'claimed') {
        // Before submission_started was executed, safe to release
        this.state.removeJournal(record.jobId);
        recoveryResults.push({ jobId: record.jobId, action: 'discarded_claim' });
      } else if (record.stage === 'submit_intent' || record.stage === 'submitted') {
        // Touched boundary! Check if receipt exists
        const hasReceipt = this.printer.hasReceipt(record.jobId);
        if (hasReceipt) {
          const receipt = this.printer.getReceipt(record.jobId);
          await this.sendEvent(record, 'uncertain', {
            errorCode: 'WORKER_RESTART',
            backendJobId: receipt.backendJobId,
            receipt
          }).catch(() => {});
        } else {
          await this.sendEvent(record, 'uncertain', {
            errorCode: 'WORKER_RESTART'
          }).catch(() => {});
        }
        this.state.removeJournal(record.jobId);
        recoveryResults.push({ jobId: record.jobId, action: 'reconciled' });
      }
    }
    return recoveryResults;
  }
}
