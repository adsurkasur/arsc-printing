import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * WorkerState manages atomic journals and durability for print jobs.
 * Fsyncs before submission to guarantee intent is persisted before touching the adapter.
 */
export class WorkerState {
  constructor(stateDir) {
    this.stateDir = stateDir;
    if (!fs.existsSync(this.stateDir)) {
      fs.mkdirSync(this.stateDir, { recursive: true });
    }
  }

  getJobJournalPath(jobId) {
    return path.join(this.stateDir, `job-${jobId}.json`);
  }

  getLockPath() {
    return path.join(this.stateDir, 'worker.lock');
  }

  acquireLock(workerId) {
    const lockFile = this.getLockPath();
    const pid = process.pid;
    const content = JSON.stringify({ workerId, pid, timestamp: Date.now() });

    try {
      const fd = fs.openSync(lockFile, 'wx');
      fs.writeFileSync(fd, content, 'utf8');
      fs.fsyncSync(fd);
      fs.closeSync(fd);
      return true;
    } catch (err) {
      if (err.code === 'EEXIST') {
        return false;
      }
      throw err;
    }
  }

  releaseLock() {
    const lockFile = this.getLockPath();
    if (fs.existsSync(lockFile)) {
      try {
        fs.unlinkSync(lockFile);
      } catch (e) {
        // ignore
      }
    }
  }

  writeJournalAtomic(jobId, data) {
    const targetPath = this.getJobJournalPath(jobId);
    const tempPath = `${targetPath}.${crypto.randomUUID()}.tmp`;

    const payload = JSON.stringify({
      ...data,
      updatedAt: Date.now()
    }, null, 2);

    const fd = fs.openSync(tempPath, 'w');
    fs.writeFileSync(fd, payload, 'utf8');
    fs.fsyncSync(fd);
    fs.closeSync(fd);

    fs.renameSync(tempPath, targetPath);

    // Also fsync containing directory if possible
    try {
      const dirFd = fs.openSync(this.stateDir, 'r');
      fs.fsyncSync(dirFd);
      fs.closeSync(dirFd);
    } catch (e) {
      // dir fsync on Windows can be noop or unsupported, safe to proceed
    }
  }

  readJournal(jobId) {
    const targetPath = this.getJobJournalPath(jobId);
    if (!fs.existsSync(targetPath)) {
      return null;
    }
    const raw = fs.readFileSync(targetPath, 'utf8');
    return JSON.parse(raw);
  }

  removeJournal(jobId) {
    const targetPath = this.getJobJournalPath(jobId);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
  }

  listUnfinishedJournals() {
    if (!fs.existsSync(this.stateDir)) return [];
    const files = fs.readdirSync(this.stateDir);
    const journals = [];
    for (const f of files) {
      if (f.startsWith('job-') && f.endsWith('.json')) {
        const full = path.join(this.stateDir, f);
        try {
          const content = JSON.parse(fs.readFileSync(full, 'utf8'));
          journals.push(content);
        } catch (e) {
          // ignore corrupted/partial
        }
      }
    }
    return journals;
  }
}
