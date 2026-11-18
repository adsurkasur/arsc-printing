import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * FakePrinterAdapter: Persistent, deterministic mock printer adapter.
 * Uses stable job UUID as correlation key to guarantee idempotency.
 */
export class FakePrinterAdapter {
  constructor(options = {}) {
    this.receiptsDir = options.receiptsDir || path.join(process.cwd(), 'worker-receipts');
    this.failSubmissions = options.failSubmissions || false;
    this.dropCallbacks = options.dropCallbacks || false;
    this.simulateLatencyMs = options.simulateLatencyMs || 10;
    this.printerKey = options.printerKey || 'fake-t530-laser';

    if (!fs.existsSync(this.receiptsDir)) {
      fs.mkdirSync(this.receiptsDir, { recursive: true });
    }
  }

  getReceiptPath(correlationJobId) {
    return path.join(this.receiptsDir, `receipt-${correlationJobId}.json`);
  }

  hasReceipt(correlationJobId) {
    return fs.existsSync(this.getReceiptPath(correlationJobId));
  }

  getReceipt(correlationJobId) {
    const p = this.getReceiptPath(correlationJobId);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  }

  async submitJob({ jobId, filePath, options = {} }) {
    if (this.simulateLatencyMs > 0) {
      await new Promise(r => setTimeout(r, this.simulateLatencyMs));
    }

    if (this.failSubmissions) {
      const err = new Error('Printer hardware fault: paper jam or offline');
      err.code = 'HARDWARE_FAULT';
      throw err;
    }

    // Check if receipt already exists (Idempotency by stable job UUID)
    const existing = this.getReceipt(jobId);
    if (existing) {
      return {
        ...existing,
        idempotentReplay: true
      };
    }

    // Verify file exists
    if (!fs.existsSync(filePath)) {
      const err = new Error(`File not found for printing: ${filePath}`);
      err.code = 'FILE_NOT_FOUND';
      throw err;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const backendJobId = `fake-backend-${crypto.randomUUID()}`;
    const receipt = {
      jobId,
      backendJobId,
      printerKey: this.printerKey,
      fileHash,
      fileSizeBytes: fileBuffer.length,
      options,
      status: 'accepted',
      createdAt: Date.now()
    };

    const targetPath = this.getReceiptPath(jobId);
    const tempPath = `${targetPath}.${crypto.randomUUID()}.tmp`;
    const fd = fs.openSync(tempPath, 'w');
    fs.writeFileSync(fd, JSON.stringify(receipt, null, 2), 'utf8');
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    fs.renameSync(tempPath, targetPath);

    return receipt;
  }
}
