# ARSC Print Worker (Unit C)

High-throughput, crash-resilient print worker implementation for ARSC Printing.
Conforms strictly to `docs/PRINT_JOB_CONTRACT.md` (Print job protocol v1).

## Architecture & Guarantees

1. **Protocol Alignment**:
   - Authenticates with `Authorization: Bearer <workerId>.<secret>` on all requests.
   - Claims jobs via `POST /api/worker/claim` with unique `requestId` and `printerKey`.
   - Sends heartbeats every 20s to maintain claim lease (`POST /api/worker/jobs/:id/events` type: `heartbeat`), incrementing and tracking server version numbers.
   - Requires document download authorization headers (`X-Claim-Token`, `X-Lease-Generation`).
   - Verifies document integrity (`<= 10MiB`, exact size match, SHA-256 hash match, and `%PDF-` signature) before touching the printer.

2. **Fsync Submit-Intent Before Printing**:
   - Before handing the document to the printer adapter, an atomic journal is persisted to disk and forced with `fsync`.
   - The worker reports a `submission_started` event to the backend and waits for acknowledgment.

3. **Stable Correlation & Idempotency**:
   - Uses the immutable job UUID as the backend correlation key.
   - The `FakePrinterAdapter` records receipts indexed by `receipt-<jobId>.json`.
   - Replayed submissions return existing receipts deterministically without creating duplicate physical prints.

4. **Fault Tolerance & Reconciliation**:
   - Network failure or dropped ACK after submission directs the job to `needs_reconciliation` (via `uncertain` event with error code `SUBMIT_UNKNOWN`), **never** resubmitting automatically.
   - Transport failures retry up to 3 times with exponential backoff.
   - HTTP 401 / 403 halts immediately with fatal exit, avoiding infinite retry loops on revoked tokens.
   - Startup recovery scans `.worker-state/` for interrupted journals and safely reconciles any job that crossed the submission boundary.

5. **Operational Security & Cleanliness**:
   - Strict log redaction: tokens and full URLs are sanitized before writing to logs.
   - Temporary downloaded PDFs are unlinked immediately in a `finally` block upon completion or failure.

## Files

- `worker/main.mjs`: Core worker implementation (`PrintWorker`).
- `worker/state.mjs`: Persistent journal and worker locking with atomic writes and `fsync`.
- `worker/fake-printer.mjs`: Mock printer adapter that persists receipts on disk with stable job correlation.
- `worker/worker.test.mjs`: Zero-dependency test suite using `node:test` covering all normal, error, and boundary paths.
- `worker/README.md`: This documentation.

## Running Tests

From the repository root (Node.js >= 22):

```powershell
node --test worker\worker.test.mjs
```
