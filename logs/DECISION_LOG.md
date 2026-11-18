# Decision Log (Architecture Decision Records)

### [DEC-001] Adoption of Modular Logging Protocol
- **Date**: 2026-09-16
- **Status**: Accepted
- **Context**: Standardizing change tracking, observability, and auditability across all managed projects for AI agents and human contributors.
- **Decision**: Mandate logs/ACTIVITY_LOG.md, logs/DECISION_LOG.md, and logs/CHANGELOG.md updates across all repositories.
- **Consequences**: Consistent history, reduced context loss during multi-agent handoffs.

### [DEC-002] Separation of Order Lifecycle and Print Job State Model
- **Date**: 2026-11-18
- **Status**: Accepted
- **Context**: The existing snapshot conflated customer order status with physical print completion (completed badge).
- **Decision**: Decouple orders.status (pending_verification, approved, delivered, cancelled) from print_jobs.status (ready, claimed, submitted, backend_completed, failed, needs_reconciliation).
- **Consequences**: No order can auto-print without explicit admin approval. backend_completed reflects printer backend status only, while delivered requires physical handoff.

### [DEC-003] Pre-Submit Intent Journaling as Idempotency Boundary
- **Date**: 2026-11-18
- **Status**: Accepted
- **Context**: Network dropouts or worker crashes during or immediately following submission to a print backend can cause duplicate physical prints if retried blindly.
- **Decision**: Worker must write an atomic journal to disk with fsync and notify the backend (submission_started) BEFORE handing bytes to the printer adapter. Any ambiguous failure directs the job to needs_reconciliation, strictly prohibiting automated resubmission.
- **Consequences**: Completely eliminates accidental multiple physical prints from automated retry loops.

### [DEC-004] Zero-Dependency Fake Printer Adapter for Local-First Development
- **Date**: 2026-11-18
- **Status**: Accepted
- **Context**: Hardware print server (HP t530), CUPS, and physical printers are not attached to developer workstations.
- **Decision**: Provide a native Node.js ESM FakePrinterAdapter that records receipts on disk indexed by stable job UUID.
- **Consequences**: The full end-to-end lifecycle can be deterministically tested offline without hardware.

### [DEC-005] Fail-Closed Loopback Enforcement for Local Environment
- **Date**: 2026-11-18
- **Status**: Accepted
- **Context**: Risk of test operations or development runs accidentally pointing to production Supabase or Vercel databases.
- **Decision**: Require ARSC_LOCAL_MODE=true and enforce that ARSC_LOCAL_SUPABASE_URL resolves strictly to loopback (127.0.0.1, localhost, ::1). Reject non-loopback endpoints with HTTP 503 / process exit.
- **Consequences**: Zero accidental data leaks or remote database mutations during local development.

### [DEC-006] Prohibition of Automatic Legacy Order Enqueueing
- **Date**: 2026-11-18
- **Status**: Accepted
- **Context**: Existing database rows lack verifiable provenance or verified payment records.
- **Decision**: Migration marks legacy rows as legacy_review_required and explicitly omits backfill INSERT into print_jobs.
- **Consequences**: Prevents historical or stale orders from suddenly flooding print workers upon migration deployment.

### [DEC-007] Idempotency-Key as Secret Receipt (Unit A)
- **Date**: 2026-11-18
- **Status**: Accepted
- **Context**: Customer orders require deduplication against network retries without exposing authentication secrets or tracking tokens to log scrapers.
- **Decision**: The Idempotency-Key UUID serves as a secret receipt header; it must be strictly parsed and never recorded in server or application logs.
- **Consequences**: Safe request replay for clients without credential or receipt leakage.

### [DEC-008] Worker Thread and Budget Isolation for Document Parsing (Unit A)
- **Date**: 2026-11-18
- **Status**: Accepted
- **Context**: Parsing untrusted PDF and image files in Node.js can cause server hangs or memory exhaustion.
- **Decision**: Isolate document and image parsing within local worker threads with an explicit 5-second deadline and 128MiB V8 heap budget, completely avoiding shell execution or external CDN converters.
- **Consequences**: Defends backend API runtime against resource abuse, zip bombs, and corrupted file decompression attacks.

### [DEC-009] Referenced-Expired Only Storage Retention (Unit A)
- **Date**: 2026-11-18
- **Status**: Accepted
- **Context**: Automated background sweeps of storage buckets risk deleting active customer files if database and bucket states drift.
- **Decision**: Storage retention cleanup via POST /api/cleanup-orphans operates strictly on expired, terminal orders (delivered or cancelled) referenced in the database, with orphan root-bucket sweeping explicitly disabled (`orphanSweep=disabled`).
- **Consequences**: Completely avoids accidental file loss from unsynchronized bucket sweeps; manifest-based sweeps and abandoned drafts remain future proposals.

### [DEC-010] Proposed Status for API Rate Limiting and Draft Manifests (Unit A)
- **Date**: 2026-11-18
- **Status**: Accepted
- **Context**: Rate limiting and abandoned upload draft sweeps require distributed state (e.g. Redis or database tables) not yet provisioned in the local environment.
- **Decision**: Keep rate limiting and upload draft manifests in proposed status until infrastructure dependencies are formally established.
- **Consequences**: Prevents fragile or partially implemented in-memory rate limiters from giving a false sense of security.

### [DEC-011] Release Gate Dependency on Local Postgres / RLS Verification (Unit A / Unit D)
- **Date**: 2026-11-18
- **Status**: Accepted
- **Context**: All Unit A/B/C/D tests currently execute against local mocks, synthetic fixtures, and in-memory databases.
- **Decision**: Formally label database migrations, RLS security policies, and PostgreSQL SKIP LOCKED concurrency as unproven (`[U]`) release gates until Docker Desktop and Supabase CLI are authorized and provisioned for local testing.
- **Consequences**: Production deployment remains gated until real database integration and permission verification can be proven.

### [DEC-012] Persistent Supabase on Loopback Ports for Physical Test Harness (Atlas Phase 3b)
- **Date**: 2026-11-18
- **Status**: Accepted
- **Context**: Local testing required real PostgreSQL/PostgREST semantics without risking default port collisions or remote cloud communication.
- **Decision**: Deploy Supabase on local HP t530 storage using bound loopback ports 18480 (Kong/REST) and 18432 (PostgreSQL), and configure CSRF validation to accept both loopback Host and Origin headers.
- **Consequences**: Deterministic database testing with complete network isolation from remote networks.

### [DEC-013] Four-Character Non-Sequential Pickup Code (Atlas Phase 4b)
- **Date**: 2026-11-18
- **Status**: Accepted
- **Context**: Customers need an easy-to-read identifier for campus counter pickup without exposing sequential volume numbers or UUID complexities.
- **Decision**: Generate pickup codes conforming to `ARSC-[A-Z0-9]{4}` with exclusions for ambiguous characters (0/O, 1/I) and database uniqueness constraint.
- **Consequences**: Human-friendly pickup verification that prevents enumeration attacks.

### [DEC-014] Pre-Approval Customer Cancellation with Concurrency Lock (Atlas Phase 4b)
- **Date**: 2026-11-18
- **Status**: Accepted
- **Context**: Customers should be permitted to cancel accidental submissions prior to operator payment verification, but must not cancel after staff approval.
- **Decision**: Permit cancellation only when status is `pending_verification`, requiring client to submit `expectedVersion` and valid capability CSRF token.
- **Consequences**: Eliminates race conditions between administrative approval and customer cancellation.

### [DEC-015] Mobile-First Responsive Breakpoint Architecture (Kiro Phase 4a/5)
- **Date**: 2026-11-18
- **Status**: Accepted
- **Context**: Audit demonstrated horizontal layout overflow and badge clipping on narrow mobile viewports (375px).
- **Decision**: Enforce 1-column layout at 375px mobile viewport, transitioning to multi-column grids only at `sm` (640px) and `lg` (1024px) breakpoints. Shorten progress indicators to concise labels.
- **Consequences**: Zero horizontal scroll overflow across all public mobile and desktop screens.

### [DEC-016] Full Material 3 Expressive UI contract before implementation
- **Date**: 2026-11-18
- **Status**: User direction accepted; detailed specification pending Soren review.
- **Context**: The prototype needs a coherent design language and a precise handoff, without changing print protocol truth.
- **Decision**: docs/M3_SPEC.md freezes generated light/dark role colors, typography, shape/elevation, web-tuned springs, complete states, responsive page layouts and Indonesian copy. Use TonalSpot spec2025 to retain the ARSC green seed, independently of Expressive component/motion language. No runtime color utility. Framer Motion only, Phosphor duotone, sonner, existing Tailwind3/Radix.
- **Rationale**: Explicit values prevent creative drift. Operational UI prioritizes tasks; expressive moments are scoped. Customer progress never invents job data absent from the API, and fake-printer simulation must be labeled.
- **Affected**: Future UI/components/layout/copy registry only; API/database/worker contracts remain unchanged. Alternative generic theme rotation and a full framework migration were rejected.

### [DEC-017] Academic-blue brand with independent semantic status colors
- **Date**: 2026-11-18
- **Status**: Accepted user color choice; implementation pending Stage1.
- **Decision**: Replace seed #1B5E3C with #1E5AA8, keeping MCU0.4.0 TonalSpot2025 generation. Success uses explicit green roles, warning amber/yellow and error generated red. App mark tile uses new primaryContainer; existing logo artwork is not recolored.
- **Rationale**: Brand blue must not erase recognizable status meaning. Measured interaction composites require fixed per-pair alpha overrides and no stacked ripple/state layers to preserve contrast.
- **Affected**: M3_SPEC §0/1/2/2.1/2.2/3.1/5/6.3/8/10. No runtime code changed.

### [DEC-018] Fidelity supersedes TonalSpot for academic-blue brand
- **Date**: 2026-11-18
- **Status**: Accepted palette-review direction; pending Stage1 visual implementation.
- **Decision**: Use MCU0.4.0 SchemeFidelity with seed #1E5AA8. Request2025 but record official actual2021 fallback; Content also falls back. Retain independent success/warning tokens and fixed contrast-safe state overrides.
- **Rationale**: Fidelity preserves the seed exactly in primaryContainer, unlike TonalSpot's pastel container. Primary is deliberately darker for contrast, so its scalar CAM16 distance is not lower than TonalSpot; no false proximity claim. Content has identical primary/container but purple tertiary; Fidelity warm complementary tertiary selected.
- **Evidence**: Three-scheme comparison and450 state/pair measurements; Fidelity text4.54:1/control3.54:1 minimum. No runtime dependency or protocol changes.

## 2026-11-18 — M3 Expressive Redesign Decisions (Stages 0–5)
- **Palette**: Blue seed `#1E5AA8`; green reserved strictly for success status.
- **Honesty & Simulation**: Enabled workers are never labeled "Online"; `NEXT_PUBLIC_ARSC_SIMULATION=true` displays explicit simulation disclosure on admin actions, receipt, and customer status pages.
- **Technical Terms**: Raw event keys (`approve`, `claim`, `submission_started`, `submitted`, `backend_completed`) are mapped to human Indonesian labels via `COPY_RECEIPT_EVENTS` with `Pembaruan status` fallback.
- **E2E Execution**: Dev server + E2E scripts are executed in a single command to avoid background server termination on this host.
