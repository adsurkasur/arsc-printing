# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
### Changed
- M3 specification v1.2 chooses Fidelity over TonalSpot: exact academic-blue seed in primaryContainer, measured state overrides and honest MCU2021 fallback provenance; no UI implementation change.
- M3 specification v1.1 switches the brand to academic blue #1E5AA8, preserves distinct semantic status colors and freezes measured interaction-state contrast overrides. UI implementation remains pending.

### Added
- Stage0 redesign specification in docs/M3_SPEC.md: generated M3 light/dark tokens, complete component state contracts, responsive page wireframes, motion and final Indonesian copy. This is a review document; the redesign is not implemented yet.
- Phase 4b & 5 Features: Human-friendly 4-character pickup codes (`ARSC-XXXX`), customer self-cancellation with concurrency version locking, administrative search (`q`), status filtering, Asia/Jakarta daily summary metrics, worker management list, and print receipt viewer dialog.
- Phase 4a Visual Redesign: Authentic campus print-service aesthetic adhering to `docs/DESIGN_DIRECTION.md`, WCAG AA contrast compliance, live pricing estimator, and mobile-first responsive 1-column layouts at 375px.
- Local Supabase test stack support on dedicated loopback ports (18480/18432) enforcing 8 relational database invariants.
- Frozen Print Job Protocol v1 (docs/PRINT_JOB_CONTRACT.md) establishing state transitions, claim leases, and fencing.
- Crash-resilient local print worker engine in worker/ (state.mjs, fake-printer.mjs, main.mjs, worker.test.mjs, README.md).
- SQL migrations in supabase/migrations/ for private print jobs, separated worker credentials, and transactional admin actions.
- Hardened worker API routes (/api/worker/claim, /events, /document) and admin actions (/api/admin/orders/[id]/action).
- Security boundary implementation (src/lib/api-security.ts) with 256-bit order capability cookies, CSRF tokens, strict schemas, and worker thread document validation.
- Operational runbook in docs/LOCAL_PRINTING_RUNBOOK.md detailing local execution and crash recovery.
- Fail-closed loopback launcher scripts/local-dev.mjs.
- Test scripts (test, typecheck, worker:fake) in package.json and synthetic fixtures (minimal.pdf, proof.png).
- Gitignore protections for .worker-state/, .worker-tmp/, and worker-receipts/.

### Changed
- Decoupled orders status model from print_jobs antrean status to eliminate ambiguous auto-printing.
- Restricted public order queue (/api/queue) to aggregate totals only, eliminating raw realtime PII leaks.
- Annotated roadmap/unbuilt aspirations in README.md and WHITEPAPER.md.
- Modular logging protocol (logs/ directory with activity, decision, and changelog files).
- Mandatory AGENTS.md guidelines for AI agents and contributors.
