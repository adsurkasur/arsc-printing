# Print job protocol v1 (frozen, local simulation)

Owner: Unit B. Worker: Node >=22, fake backend only. No physical print adapter.
All timestamps are UTC ISO8601; IDs are UUIDs. JSON responses use `Cache-Control: no-store`.
No automatic printing before explicit admin approval. No exactly-once printing guarantee.

## Authentication

Worker sends `Authorization: Bearer <worker-id>.<random-secret>` on every request.
Only SHA-256(secret) is stored in print_workers. Worker is enabled and bound to a
printer_key. Never use an admin session or Supabase service key as a worker token.
Server-local Supabase configuration only; absent/non-loopback configuration returns 503.
Admin session/role validation, capability cookies and CSRF are Unit A integration concerns.
Until those helpers are integrated, Unit B checks admin user+role and same-origin mutations
itself; no customer capability implementation is introduced here.

## Worker endpoints

### POST /api/worker/claim

Request: `{ "requestId": "uuid", "printerKey": "fake" }`.
Response 200: `{ "job": null }` or:

```json
{
  "job": {
    "id": "uuid", "orderId": "uuid", "status": "claimed",
    "version": 1, "generation": 1, "claimToken": "opaque",
    "leaseUntil": "2026-11-18T00:01:00Z",
    "printerKey": "fake", "document": {"sha256": "64 hex", "size": 123},
    "options": {"copies": 1, "paperSize": "A4", "colorMode": "bw", "layout": "1-up", "scaleMode": "fit", "orientation": "portrait"}
  }
}
```

Lease is 60s. Heartbeat every 20s. Reuse requestId after a lost response; it returns
the same current claim/token. Do not reuse it for a different job. Atomic DB claim
uses FOR UPDATE SKIP LOCKED. Only ready jobs targeted to this worker/printer qualify.

### GET /api/worker/jobs/:id/document

Headers: `X-Claim-Token: opaque`, `X-Lease-Generation: 1`.
Response: `{ "url": "http://127.0.0.1:54321/storage/...signed...", "expiresIn": 60, "sha256": "64 hex", "size": 123 }`.
Only current unexpired claimed jobs may download. URL is a temporary bearer, not one-time.
Worker pins its configured storage origin, rejects redirects, streams <=10MiB and
verifies exact size and SHA-256 before submission. Never log URL/token/content.

### POST /api/worker/jobs/:id/events

Request:
```json
{"eventId":"uuid","type":"heartbeat","version":1,"generation":1,"claimToken":"opaque"}
```
Allowed types: heartbeat, submission_started, submitted, backend_completed, failed, uncertain.
submitted requires `backendJobId` (1..128 safe characters) and `backendInstanceId`.
failed/uncertain require `errorCode` from FILE_INVALID, DOWNLOAD_FAILED, BACKEND_REJECTED,
BACKEND_FAILED, SUBMIT_UNKNOWN, WORKER_RESTART. Do not send free-form document/error text.
Response: `{ "job": { "id":"uuid", "status":"claimed", "version":2, "generation":1, "leaseUntil":"...", "submissionStartedAt":null, "backendJobId":null } }`.
Every successful event increments version, including heartbeat; use returned version.
Same eventId + identical request is replayed without mutation (even after lease expiry);
same eventId with changed payload is 409 IDEMPOTENCY_CONFLICT.

## States and transitions

| Entity/state | Meaning | Allowed next action/state |
|---|---|---|
| order pending_verification | payment awaiting review | verify/reject payment, approve, cancel |
| order approved | admin approved; job created transactionally | deliver after backend_completed; cancel before claim |
| job ready | eligible for its worker | claimed |
| job claimed | leased, not necessarily submitted | heartbeat; submission_started marker; submitted; failed; needs_reconciliation |
| job submitted | backend receipt recorded | heartbeat; backend_completed; failed; needs_reconciliation |
| job backend_completed | complete according to backend only | admin delivers order after physical check |
| job failed | known failure, no automatic reprint | explicit admin reprint revision |
| job needs_reconciliation | outcome uncertain | admin reconcile complete, or explicit risk-acknowledged reprint |
| order delivered | human handoff recorded | terminal |

Order cancelled is an additional terminal state. Cancellation of an active claim/submit
is rejected; resolve with operator first. payment_status is pending/verified/rejected,
independent of order/job status. Legacy pending/printing/completed rows are marked
legacy_review_required and never approved/enqueued until an explicit review action.

## Submission boundary and recovery

1. Download+verify; fsync local submit-intent journal.
2. Send submission_started, await ACK before calling fake backend. It keeps claimed
   status but stores submissionStartedAt. This event is permitted only once per claim.
3. Submit with stable idempotency key = job.id. Persist backend receipt before callback.
4. Send submitted; then poll backend and report backend_completed/failed.
5. Lost callback: replay same eventId/body; never repeat submission just for lost ACK.

Expired claimed lease BEFORE submissionStartedAt: ready again (max 3 claims, backoff).
Expired lease AFTER submissionStartedAt, or expired submitted: needs_reconciliation,
never automatically ready. Recovery finds a persisted backend receipt by job.id. If
outcome cannot be proven, report uncertain or let lease expire for operator review.
Late stale-fence events are rejected, not allowed to overwrite newer state.
Physical backend completion is not physical verification/handoff.

## Fencing / errors

All mutations lock row and compare worker identity, claimToken, generation, version,
lease deadline using DB clock. Tokens are derived server-side from claim request and
worker secret for replay, stored hashed in DB. No database/storage credentials reach worker.

Error body: `{ "error": { "code": "STALE_VERSION", "message": "Request rejected" } }`.
400 INVALID_INPUT; 401 UNAUTHENTICATED; 403 FORBIDDEN; 404 NOT_FOUND;
409 STALE_VERSION, STALE_CLAIM, INVALID_TRANSITION, IDEMPOTENCY_CONFLICT,
PAYMENT_NOT_VERIFIED, DOCUMENT_NOT_READY, LEGACY_REVIEW_REQUIRED;
410 DOCUMENT_DELETED; 429 RATE_LIMITED (Unit A); 503 LOCAL_BACKEND_UNAVAILABLE;
500 INTERNAL_ERROR. No raw DB diagnostics. No retries for auth/validation/conflict.
Bound network retry to 3 with backoff for safe requests only, preserve exact body/eventId.

## Admin action / browser integration

POST /api/admin/orders/:id/action: `{action, expectedVersion, ...}`.
actions: verify_payment, reject_payment, approve, cancel, deliver, review_legacy,
reconcile, reprint. approve needs workerId and printerKey. reconcile needs
resolution="backend_completed", reasonCode="OPERATOR_VERIFIED" and backendJobId.
reprint needs acknowledgeDuplicateRisk=true, workerId, printerKey; creates new revision.
review_legacy only clears review flag, never enqueues. Response `{order,job}`.
Requests use the admin bearer session plus exact Origin; Unit A will unify CSRF/auth.
Admin list requires jobs included as `print_jobs` in /api/orders; customer lookup never
gets job credentials. Public /api/queue only returns `{count, estimatedTime}`.
No browser raw orders realtime or anonymous order list. Customer upload/capability flow
is Unit A's responsibility; unavailable paths must fail closed, not use fake success.

## Verification boundary

Pure transition tests do NOT prove SQL, RLS, concurrent claim or Storage behavior.
These require isolated local Supabase/Postgres; blocked until that environment exists.
