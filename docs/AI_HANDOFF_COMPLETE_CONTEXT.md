---
status: active-development-pre-production
last_verified: 2026-11-25
active_branch: feat/redesign-v2
audience: maintainers-operators-and-ai
sensitivity: restricted-file-processing
---

# ARSC Printing — Complete Repository Context & AI Handoff

## 1. Product Identity & Current Status (TL;DR)

**ARSC Printing** is the campus document printing web service operated by **Agritech Research and Study Club (ARSC)**, **Fakultas Teknologi Agroindustri dan Biosistem (FTAB), Universitas Brawijaya** (`Sekretariat ARSC Gedung A FTAB UB`).

- **Active branch vs legacy `main`**:
  - All active engineering work from November 2026 (hardened upload/order APIs, SQL migrations `202611180001..0003`, crash-resilient local print worker, Material 3 Expressive academic-blue UI, motion spec, YAGNI audit, Vercel readiness documentation, and final E2E audit) lives on **`feat/redesign-v2`** (base commit `8cca678` prior to this handoff).
  - Branch `main` (`28845fc`, 2026-09-16) still holds the **legacy MVP**. It has **NOT** been merged into, and the redesigned system is **NOT** deployed to Vercel production yet.
  - The portfolio superproject (`E:\managed-projects-handoff`) pins `ARSC/arsc-printing` at `28845fc`. Do **not** merge to `main` or advance superproject submodule pointers without explicit user approval.
- **Confirmed public business & product facts** (from `src/lib/copy.ts`, `docs/COPY_MANIFEST.json`, and `src/lib/storage.ts`):
  - **Tariffs (server-computed via `computePrice` in `src/lib/storage.ts`)**: Black & White (`bw`) **Rp 500/halaman**; Color (`color`) **Rp 750/halaman**.
  - **Paper & print options**: `A4` and `F4`; `layout` (`1-up`, `2-up`, `4-up`); `scale_mode` (`fit`, `fill`, `100`); `orientation` (`portrait`, `landscape`); `user_note` (max 500 chars).
  - **Quantity & upload limits**: `copies` `1..100`, `pages` `1..500`, `copies * pages <= 1000`; document PDF `<= 10 MiB` (validated by `%PDF-` header and `pdf-lib` page count); payment proof PNG/JPEG `<= 5 MiB` (magic bytes validated, pixel area `<= 20,000,000` px).
  - **Service hours**: `"Jam layanan fleksibel. Pesanan akan diperiksa pada sesi berikutnya."` Never invent fixed opening hours or turnaround SLAs.
  - **Payments**: Manual QRIS (`public/qris-arsc.jpeg`) + payment proof upload + manual operator verification. Automated payment gateway integration (Midtrans) is deferred to a later phase.
  - **Pickup code**: Non-sequential `ARSC-XXXX` identifier (unique among active `pending_verification` / `approved` orders). Convenience desk label only — **never** an authentication credential.
  - **Operator contact**: Listed in `src/lib/copy.ts` (`COPY_PAGES.shared`) as **Arina** (`+62 878-8283-2706`, `tel:` and `https://wa.me/6287882832706`).

---

## 2. Git Branch, PR & ARSC Ecosystem Topology

### 2.1 Repository Branches & Pull Requests (`adsurkasur/arsc-printing`)

| Branch | Latest Commit | Remote Status | Role & Notes |
| --- | --- | --- | --- |
| `feat/redesign-v2` | `8cca678` (pre-handoff) | `origin/feat/redesign-v2` | **Active working branch**. Includes `feat/print-pipeline` + M3 Expressive UI Stages 0–5 + `DEPLOY_VERCEL.md`. |
| `feat/print-pipeline` | `ad027bf` | Local-only | Direct ancestor of `feat/redesign-v2` (`merge-base` = `ad027bf`). Contains backend security, SQL migrations, worker, and Phase 4a/4b/5. |
| `main` | `28845fc` | `origin/main` | Legacy MVP (2026-09-16) + superproject pin. Do not merge without approval. |
| `docs/multi-zone-handoff` | `596390c` | `origin/docs/multi-zone-handoff` (PR #2 OPEN) | Multi-Zones `/app/printing` migration plan written against legacy `main` (`28845fc`). |
| `feat/multi-zone-basepath` | `ade9c0e` | `origin/feat/multi-zone-basepath` (PR #3 OPEN) | Env-driven `NEXT_PUBLIC_BASE_PATH` (`/app/printing`) implementation branched from legacy `main`. Needs porting/reconciliation onto `feat/redesign-v2` later. |
| `agent/stable-handoff-2026-08` | `d10f7d3` | `origin/agent/stable-handoff-2026-08` (PR #1 MERGED) | August 2026 security-focused maintainer guide baseline. |
| `backup-before-revert-2280d94` | `ea41294` | `origin/backup-before-revert-2280d94` | Historical backup branch. |

### 2.2 ARSC Project Family Map & Host Storage Rule

ARSC Printing belongs to the ARSC project ecosystem at `E:\managed-projects-handoff\ARSC\`:
- `halo-psdm/`: Halo PSDM reports, chat, appointments, admin.
- `Rapor-ARSC-2025-2026/`: Member evaluation & accountless report portal.
- `arsc-leaderboard/`: Shared-auth competition, scoring, and participation app.
- `arsc-printing/`: This repository (no shared-identity SSO coupling with Halo/Leaderboard; independent admin auth, though sharing the same production Supabase Cloud project).
- `arsc-supabase-audit/`: Local database audit workspace.
- `Otomasi-SK-ARSC-2026/`: SK automation tooling.
- `E:\Projects\arsc-home`: Public ARSC company profile & single-domain Next.js Multi-Zones gateway (`/app/*`).

Cross-system family handoffs live in the parent `ARSC/` folder:
- [`../README.md`](../README.md)
- [`../ARSC_SYSTEM_MASTER_HANDOFF_2026-08-11.md`](../ARSC_SYSTEM_MASTER_HANDOFF_2026-08-11.md)
- [`../ARSC_SYSTEM_HANDOFF_ADDENDUM_2026-09-28.md`](../ARSC_SYSTEM_HANDOFF_ADDENDUM_2026-09-28.md)
- [`../WORKSTREAM_REGISTER.md`](../WORKSTREAM_REGISTER.md)
- [`../DATA_AND_OPERATIONS_GUIDE.md`](../DATA_AND_OPERATIONS_GUIDE.md)
- [`../EVIDENCE_INDEX.md`](../EVIDENCE_INDEX.md)

**Host Storage Rule**: Drive `C:` on this workstation is space-constrained (~15 GB free). Store temporary workdirs, recordings, browser profiles, caches, and evidence archives under `E:\OpenBot\` (`E:\OpenBot\tmp\`, `E:\OpenBot\recordings\`, `E:\OpenBot\Shared\`), never on `C:`.

---

## 3. Evidence Boundaries & Verification Status

Keep verified facts strictly separated from local simulation evidence and unproven production items (`[U]`).

### 3.1 Freshly Verified on `feat/redesign-v2` (2026-11-25, commit `8cca678`)

- `bun run typecheck` (`bun x --no-install tsc --noEmit`): **PASS** (exit `0`).
- `bun run lint` (`eslint .`): **PASS** (exit `0`).
- `bun run test` (`bun test tests/ && node --test worker/worker.test.mjs`): **PASS** (exit `0`).
  - Bun suite: **34 pass**, **3 skip**, **0 fail**, 42 `expect()` calls across 10 files. Skipped tests are `supabase/tests/db.integration.test.ts`, `supabase/tests/e2e.integration.test.ts`, and `supabase/tests/service.integration.test.ts` (require a live local Supabase/Postgres instance).
  - Node worker suite (`worker/worker.test.mjs`): **9/9 pass**, **0 fail**, **0 skipped**.
- `node scripts/check-copy.mjs`: **PASS** (exit `0`, copy registry matches `docs/COPY_MANIFEST.json`).
- `node scripts/check-tokens.mjs`: **PASS** (exit `0`, 49 M3 roles + 8 semantic roles, 23 aliases/theme, 88 alpha overrides match `docs/M3_SPEC.md`; no prohibited legacy green hexes in `src/`).
- `bun run build` (`next build`, Next.js `16.1.1` Turbopack): **PASS** (exit `0`, 21/21 static pages generated). Expected non-blocking warnings: deprecated `middleware` file convention (vs `proxy`), missing `metadataBase` resolving social images to `http://localhost:3000`, and stale `baseline-browser-mapping` / `caniuse-lite` data.

### 3.2 Previously Verified on Local Loopback Harness (2026-11-18–19, commit `8cca678`)

Not re-run during this documentation-only session; requires running the local loopback Supabase test stack (ports `18480`/`18432`):
- End-to-end Playwright customer & admin flows (`scripts/e2e-customer.mjs`, `scripts/e2e-admin.mjs`).
- Automated edge/margin audit across `375/768/1280/1440` (`scripts/edge-check.mjs`, reported 0 edge offenders).
- Final run console/hydration/keyboard/cancel audit (`scripts/final-run-audit.mjs`, reported 0 SSR hydration console errors).
- Visual artifacts saved under `E:\OpenBot\recordings\arsc-final-run.mp4`, `E:\OpenBot\recordings\arsc-redesign-full-flow.mp4`, and `E:\OpenBot\recordings\redesign\`.

### 3.3 Unverified / Not Proven in Production (`[U]`)

- **`[U]` Supabase Cloud shared-project migration & collision safety**: SQL migrations (`202611180001..0003`) and RLS/`SKIP LOCKED` concurrency have not been proven against the shared production Supabase Cloud project.
- **`[U]` Remote Vercel production runtime**: Current `src/lib/supabase/service.ts` and `src/lib/supabase/middleware.ts` enforce a strict loopback guard that blocks `https://` Supabase URLs on Vercel (`docs/DEPLOY_VERCEL.md`).
- **`[U]` Physical CUPS printer & HP t530 `systemd` worker**: Only `FakePrinterAdapter` has been exercised; real CUPS driver/hardware output is untested.
- **`[U]` Production scheduled cleanup & retention**: `POST /api/cleanup` and `POST /api/cleanup-orphans` have unit coverage only; no production cron schedule is provisioned or evidenced.
- **`[U]` Multi-Zones `/app/printing` integration**: Existing Multi-Zones PRs (#2, #3) target legacy `main`, not `feat/redesign-v2`.

> **Warning on stale root files**: Legacy files `build_output.txt`, `build_success.txt`, and `lint_output.txt` in the repo root come from early MVP commits (`b47517a`/`dfc7727`) and are **not** evidence for the current codebase.

---

## 4. System Architecture & File Map

### 4.1 Technology Stack

- **Framework & Runtime**: Next.js `16.1.1` (App Router, Turbopack dev/build), React `19.2.3`, TypeScript `5.8.3`, Bun (`1.3.10`, `bun.lockb`), Node.js `>= 22`.
- **Styling & UI**: Tailwind CSS `3.4.17` (do **not** migrate to Tailwind v4), Radix UI / shadcn primitives (`src/components/ui/`), `framer-motion` `12.23.26` (do **not** add GSAP or scroll-smoothing libraries), `sonner` toasts, `next-themes`.
- **Fonts & Icons**: `next/font/google` (`Bricolage_Grotesque` display, `Plus_Jakarta_Sans` body, `JetBrains_Mono` code) and static Phosphor duotone SVGs (`src/components/icons/`, preserving `src/components/icons/LICENSE`).
- **Document & Backend Libraries**: `pdf-lib` `1.17.1`, `pdfjs-dist` `5.5.207`, `react-pdf` `10.4.1`, `zod` `3.25.76`, `@supabase/ssr` `0.8.0`, `@supabase/supabase-js` `2.89.0`.

### 4.2 Routes & API Endpoints

**Pages**:
- `/` (`src/app/page.tsx`): Landing page, tariffs, live aggregate queue strip, 3-step workflow, service hours note.
- `/order` (`src/app/order/page.tsx`): 3-step order wizard (1: Document & print specs + live PDF preview, 2: QRIS & proof upload, 3: Review & submit) + sticky summary card.
- `/order-success` (`src/app/order-success/page.tsx`): Order receipt, pickup code `ARSC-XXXX`, 5-step status timeline, self-cancellation modal, simulation disclosure.
- `/track` (`src/app/track/page.tsx`): Order lookup via existing capability session / pickup confirmation (never bypasses capability authorization).
- `/queue` (`src/app/queue/page.tsx`): Aggregate queue counter view (no PII).
- `/admin/login` (`src/app/admin/login/page.tsx`): Operator authentication via Supabase Auth.
- `/admin` (`src/app/admin/page.tsx`): Protected operator desk (`Meja layanan`, daily Jakarta summary, search/status filters, `verify_payment`, `reject_payment`, `approve`, `deliver`, `cancel`, `reconcile`, `reprint`, `review_legacy`, receipt modal, worker list).
- `/dev/tokens` (`src/app/dev/tokens/page.tsx`): Dev-only M3 token & state matrix fixture; returns `notFound()` (404) when `NODE_ENV === 'production'` and is unlinked in navigation.

**API Routes**:
- Customer: `GET/POST /api/orders`, `POST /api/orders/[id]/cancel`, `POST /api/upload`, `GET /api/queue`.
- Admin: `GET /api/admin/orders`, `POST /api/admin/orders/[id]/action`, `GET /api/admin/orders/[id]/document`, `GET /api/admin/orders/[id]/receipt`, `GET /api/admin/summary`, `GET /api/admin/workers`, `POST /api/delete-file`.
- Worker: `POST /api/worker/claim`, `POST /api/worker/jobs/[id]/events`, `GET /api/worker/jobs/[id]/document`.
- Cron / Retention: `POST /api/cleanup`, `POST /api/cleanup-orphans`.

**Core Libraries (`src/lib/`)**:
- `api-security.ts`: `adminAuth`, `workerAuth`, `customerAuth`, `assertOrigin`, `capabilityToken`/`capabilityCookie`, `csrfFor`, `readBoundedBody`, `readJson`, `parseOrder`, `requireCron`.
- `storage.ts`: `computePrice`, worker-thread `validateFile`, `readUpload`, `canonicalPath`, `deleteStoredFile`, `cleanupExpired`.
- `print-jobs.ts`: state transitions, lease expiry, fencing, RPC wrappers (`claimJob`, `reportEvent`, `jobDocument`, `adminAction`).
- `admin-api.ts`: strict date/search/summary parameter validation.
- `copy.ts`: single source of truth for UI copy and `COPY_RECEIPT_EVENTS`.
- `motion.ts`: M3 Expressive spring/tween tokens.
- `supabase/{client,server,service,middleware}.ts`: Supabase clients and current fail-closed loopback boundary.

**Print Worker (`worker/`)**:
- `worker/main.mjs`: `PrintWorker` polling/claim/heartbeat/download/verify/submit/recovery loop.
- `worker/state.mjs`: atomic disk locks and `fsync` submit-intent journal (`.worker-state/`).
- `worker/fake-printer.mjs`: `FakePrinterAdapter` persisting deterministic receipts to `worker-receipts/receipt-<jobId>.json`.
- `worker/worker.test.mjs` & `worker/README.md`.

**Frozen Contracts**:
- [`docs/PRINT_JOB_CONTRACT.md`](PRINT_JOB_CONTRACT.md) (Print job protocol v1)
- [`docs/ADMIN_API.md`](ADMIN_API.md) (Service & Admin API v1)

---

## 5. Database Migrations & Shared Supabase Cloud Safety Boundary

### 5.1 Migration Files (`supabase/migrations/`)

1. `202611180001_local_baseline.sql`: Creates `pgcrypto`, `public.orders`, `public.user_roles`, enables RLS, and provisions private storage bucket `documents` (`public = false`).
2. `202611180002_private_print_jobs.sql`:
   - Extends `public.orders` (`legacy_status`, `legacy_review_required`, `orders_status_check`, `orders_paper_size_check`, `version`, `revision`, `capability_hash`, `creation_key`, `request_hash`, `payment_status`, `amount_due`, `file_sha256`, `file_size`, `file_mime`, `verified_by`, `verified_at`, `approved_by`, `approved_at`, `delivered_at`, `cancelled_at`, `orders_limits`, `orders_options`).
   - Creates `public.print_workers`, `public.print_jobs` (with partial index `print_jobs_ready`), and `public.print_job_events` with RLS enabled.
   - Defines `public.is_admin()`, `print_job_response`, `claim_print_job`, `report_print_event`, `print_job_document`, `admin_print_action`.
   - Drops broad legacy policies on `public.*` and `storage.objects`, creating `admin_orders_read` and `admin_jobs_read`.
3. `202611180003_service_features.sql`: Adds `pickup_code` (`^ARSC-[0-9]{4}$`), partial unique index `orders_active_pickup`, trigger `assign_pickup` (`assign_pickup_code()`), and RPCs `customer_cancel_order`, `admin_order_search`, and `admin_daily_summary`.

### 5.2 Mandatory Shared Supabase Cloud Collision Audit

Production uses **Supabase Cloud (Option A)** — **not** the local HP t530 stack. One Supabase Cloud project is intentionally shared across all ARSC applications (`halo-psdm`, `Rapor-ARSC-2025-2026`, `arsc-leaderboard`, and `arsc-printing`).

**HARD SAFETY GATE**: Before applying **any** SQL migration to Supabase Cloud:
1. Perform a read-only collision audit against the active cloud schema and sibling repos (`halo-psdm`, `Rapor-ARSC-2025-2026`, `arsc-leaderboard`, `arsc-supabase-audit`) for:
   - Table names: `orders`, `user_roles`, `print_workers`, `print_jobs`, `print_job_events`.
   - Function names: `public.is_admin()` (critical — Halo/Leaderboard also check admin roles!).
   - Storage bucket `documents` and `DROP POLICY` statements on `storage.objects` or `public.*` in `202611180002_private_print_jobs.sql` (a naive `DROP POLICY` or `CREATE OR REPLACE FUNCTION public.is_admin()` could break sibling ARSC apps!).
2. Keep this audit sequenced after initial Vercel project setup as approved by the owner (`DEC-019`).

---

## 6. Material 3 Expressive Design, Layout & Copy Rules

- **Design Authority**: [`docs/M3_SPEC.md`](M3_SPEC.md) (v1.2, 18 Nov 2026) supersedes the earlier Phase 4a emerald palette in [`docs/DESIGN_DIRECTION.md`](DESIGN_DIRECTION.md). Supporting contracts: [`docs/COPY_MANIFEST.json`](COPY_MANIFEST.json), [`docs/STAGE1B_WORKORDER.md`](STAGE1B_WORKORDER.md), [`docs/YAGNI_AUDIT.md`](YAGNI_AUDIT.md).
- **Color Tokens**: MCU 0.4.0 `SchemeFidelity` with academic-blue seed **`#1E5AA8`** (preserved exact in `primaryContainer`; actual MCU fallback spec 2021 documented honestly in `M3_SPEC.md §10`). Green is strictly reserved for success status; amber for warning; generated red for error. Prohibited legacy hexes: `#90d5a8`, `#1b5e3c`, `#121412` (enforced by `scripts/check-tokens.mjs`).
- **Layout & Spacing Rules**:
  - *"No blank space"* does **not** mean cramped. Maintain clear M3 spacing rhythm (48/32 between sections, 16 within groups, 24 card padding) and page margins: **16px mobile** (`375`), **24px tablet** (`768`), **32px desktop** (`1280/1440`).
  - Nothing may touch the window edge or the admin navigation rail (admin rail clearance `88 + 32px` at `>= 1200px`). Verify with `scripts/edge-check.mjs` across `375/768/1280/1440`.
  - Mobile bottom clearance `104px + env(safe-area-inset-bottom)`; `CreateOrderFab` anchored bottom-right (`!left-auto !right-4 md:!right-8`).
- **Product Truth & Honesty Invariants**:
  - Enabled workers are **never** labeled `"Online"`.
  - `backend_completed` means adapter completion only, **never** physical print verification or customer pickup (`backendCompletionIsPhysicalProof: false`).
  - Keep visible simulation disclosure when `NEXT_PUBLIC_ARSC_SIMULATION=true`.
  - Map raw receipt event keys through `COPY_RECEIPT_EVENTS` in `src/lib/copy.ts` with `Pembaruan status` fallback — never leak raw internal keys (`submission_started`, `backend_completed`) to users.
  - All UI copy comes from `src/lib/copy.ts` and must match `docs/COPY_MANIFEST.json` (`scripts/check-copy.mjs`).

---

## 7. Security, Privacy & Operational Non-Negotiables

1. **Private Storage & Short-Lived URLs**: Bucket `documents` must remain private (`public = false`). Never expose public object URLs; admin/worker signed URLs expire in **60 seconds**.
2. **Customer Access & Request Integrity**: Orders use a per-order 256-bit `HttpOnly` capability cookie + `X-CSRF-Token` + exact `Origin` match + non-logged `Idempotency-Key` UUID. `/api/queue` returns aggregate counts only (zero raw orders realtime or anonymous lists).
3. **Worker-Thread Document Parsing**: PDF/image validation runs inside an isolated `node:worker_threads` sandbox with a **5-second deadline** and **128 MiB V8 heap limit** (`[DEC-008]`), enforcing magic bytes, file sizes, SHA-256 checksums, and server-counted pages.
4. **Print Worker Fencing & Idempotency**: Workers authenticate with `Bearer <workerId>.<secret>` (hashed in `print_workers`), never receive DB or Storage keys, use `X-Claim-Token` and `X-Lease-Generation`, persist an `fsync` submit-intent journal in `.worker-state/` before submitting, unlink temp PDFs in `finally`, and redact tokens/URLs in logs. Lost ACKs after `submission_started` transition to `needs_reconciliation`, never automatic reprint.
5. **Cleanup & No Silent Demo Fallback**: `POST /api/cleanup-orphans` uses `mode: 'referenced_expired_only'` with `orphanSweep: 'disabled'` (`[DEC-009]`). Never allow misconfigured production environments to fall back silently to mock/demo mode.
6. **Secrets & Test Data Hygiene**: Never commit `.env*`, `.audit/`, `.worker-state/`, `.worker-tmp/`, `worker-receipts/`, or `.test-worker-env/`. Never test with real student academic, identity, or payment files; use synthetic fixtures (`tests/fixtures/minimal.pdf`, `tests/fixtures/proof.png`).

---

## 8. Environment Variables (Names Only)

Never commit real values.

### Web App / Vercel (`docs/DEPLOY_VERCEL.md` & `.env.local.example`)
- `ARSC_LOCAL_MODE` (currently required `'true'` by loopback guard until production refactor)
- `ARSC_LOCAL_SUPABASE_URL`
- `ARSC_LOCAL_SUPABASE_ANON_KEY`
- `ARSC_LOCAL_SUPABASE_SERVICE_ROLE_KEY`
- `ARSC_LOCAL_CAPABILITY_SECRET` (32+ char HMAC secret for capability cookies)
- `ARSC_LOCAL_CRON_SECRET` (Bearer secret for `/api/cleanup` and `/api/cleanup-orphans`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ARSC_SIMULATION` (`'true'` for fake-printer simulation, `'false'` for physical production)
- Legacy / TTL / display vars in `.env.local.example`: `SUPABASE_SERVICE_ROLE_KEY`, `PAYMENT_PROOF_TTL_HOURS`, `DELIVERED_FILE_TTL_HOURS`, `DELIVERED_PAYMENT_PROOF_TTL_HOURS`, `NEXT_PUBLIC_QRIS_URL`, `NEXT_PUBLIC_BASE_PATH` (used on `feat/multi-zone-basepath`)

### Local Test & Worker Variables
- `ARSC_DB_TEST_URL`, `E2E_BASE_URL`
- `WORKER_ID`, `WORKER_SECRET`, `PRINTER_KEY`, `API_BASE_URL`

---

## 9. Commands, Verification Gates & Local Runbook

### Standard Static, Unit & Build Gates
```powershell
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run test
node scripts/check-copy.mjs
node scripts/check-tokens.mjs
bun run build
```

### Local Loopback Dev & Fake Worker
```powershell
node scripts/local-dev.mjs   # validates loopback ARSC_LOCAL_SUPABASE_URL, starts Next dev
bun run worker:fake          # runs node worker/main.mjs against API_BASE_URL
```

### E2E, Edge & DB Integration (Requires Local Loopback Supabase on 18480/18432)
> **Windows execution note**: Run dev/prod server + Playwright script in a **single chained shell command** so background servers are not terminated between calls.

```powershell
node scripts/e2e-customer.mjs
node scripts/e2e-admin.mjs
node scripts/edge-check.mjs
node scripts/final-run-audit.mjs
bun test supabase/tests/
```

See [`docs/LOCAL_PRINTING_RUNBOOK.md`](LOCAL_PRINTING_RUNBOOK.md) for crash-recovery procedures and status lifecycle tables.

---

## 10. Production Deployment Blockers & Prioritized Next Steps

1. **Refactor Loopback Guard for Production HTTPS (`docs/DEPLOY_VERCEL.md`)**:
   - Update `src/lib/supabase/service.ts`, `src/lib/supabase/middleware.ts`, and `src/lib/supabase/server.ts` so production builds accept explicit HTTPS Supabase Cloud configuration while staying strictly **fail-closed** (never silently falling back to demo mode or unauthenticated defaults) and preserving local loopback enforcement for `ARSC_LOCAL_MODE=true`.
   - Also address `next build` warnings when ready: set `metadataBase` in `src/app/layout.tsx` and review Next 16 `middleware` → `proxy` migration.
2. **Vercel Project Setup & Preview Deployment**:
   - Owner configures Vercel project (`bun install`, `bun run build`), sets production/preview env vars (including `NEXT_PUBLIC_ARSC_SIMULATION=true` initially until CUPS printer is live), and verifies preview deployment before any `main` merge.
3. **Shared Supabase Cloud Collision Audit & Migration**:
   - Audit active cloud tables, `is_admin()`, `user_roles`, `orders`, `documents` bucket, and `storage.objects` policies across `halo-psdm`, `Rapor-ARSC-2025-2026`, `arsc-leaderboard`, and `arsc-supabase-audit`.
   - Refactor/namespace any colliding SQL objects or policies, apply migrations safely, and verify real Postgres RLS + `SKIP LOCKED` concurrency (`supabase/tests/`).
4. **Retention Cron & Operational Policy Sign-Off (`docs/MAINTAINER_GUIDE.md`)**:
   - Wire scheduled `POST /api/cleanup` and `POST /api/cleanup-orphans` execution with `Authorization: Bearer <secret>`, verify deletion evidence, and finalize owner policy sign-off (privacy notice, physical copy destruction, breach contact).
5. **Physical CUPS Printer & HP t530 Worker Rollout**:
   - Verify `ssh t530-ai` (`openbot`), implement real CUPS printer adapter alongside `FakePrinterAdapter`, run worker under `systemd`, test end-to-end with synthetic PDFs, then set `NEXT_PUBLIC_ARSC_SIMULATION=false`.
6. **Multi-Zones `/app/printing` Integration**:
   - Reconcile `docs/multi-zone-handoff` (PR #2) and `feat/multi-zone-basepath` (PR #3) onto the post-redesign codebase (`feat/redesign-v2` / `main`) so `arsc-home` can serve `/app/printing`.
7. **Later Phases & Cleanup**:
   - Midtrans payment integration (replacing/augmenting manual QRIS verification).
   - Distributed API rate limiting & abandoned upload draft manifests (`[DEC-010]`).
   - Remove stale root `build_output.txt`, `build_success.txt`, `lint_output.txt` and retire `feat/print-pipeline` once `feat/redesign-v2` merges cleanly.

---

## 11. Recommended Read Order & Suggested Skills for Next AI Agent

### Read Order
1. **This document**: `docs/AI_HANDOFF_COMPLETE_CONTEXT.md`
2. **Repo governance & recent logs**: `AGENTS.md`, `logs/DECISION_LOG.md`, `logs/ACTIVITY_LOG.md`
3. **By workstream**:
   - *Deployment / Supabase Cloud*: `docs/DEPLOY_VERCEL.md`, `docs/MAINTAINER_GUIDE.md`, `src/lib/supabase/{service,middleware,server}.ts`, `supabase/migrations/*`, plus `../README.md` and `../WORKSTREAM_REGISTER.md`
   - *Backend / API / Security*: `docs/PRINT_JOB_CONTRACT.md`, `docs/ADMIN_API.md`, `src/lib/api-security.ts`, `src/lib/storage.ts`, `src/lib/print-jobs.ts`
   - *UI / M3 Expressive / Copy*: `docs/M3_SPEC.md`, `docs/COPY_MANIFEST.json`, `docs/YAGNI_AUDIT.md`, `src/lib/copy.ts`, `src/lib/motion.ts`
   - *Local Worker / CUPS*: `docs/LOCAL_PRINTING_RUNBOOK.md`, `worker/README.md`, `worker/main.mjs`, `worker/state.mjs`

### Suggested Skills (Invoke Before Editing Matching Areas)
- `project-logger` — modular `logs/` and submodule hygiene
- `verification-before-completion` — run and inspect gates before claiming success
- `hallmark` & `impeccable` — UI redesign, contrast, spacing, and anti-slop discipline
- `framer-motion` — M3 Expressive motion edits
- `playwright` — E2E and edge-check verification
- `deploy-to-vercel` & `vercel-react-best-practices` — Vercel rollout & Next.js performance
- `systematic-debugging` — root-cause diagnosis on failures
- `accidental-data-loss-prevention` — mandatory safety before any SQL migration or data deletion

---

## 12. Modular Logging & Handoff Maintenance Protocol

Per `AGENTS.md`, every session that changes code, schema, config, docs, or assets **must** update `logs/ACTIVITY_LOG.md`, record architectural/strategic changes as `[DEC-xxx]` in `logs/DECISION_LOG.md`, update `logs/CHANGELOG.md`, and stage/commit those log files alongside the primary changes. Keep `docs/AI_HANDOFF_COMPLETE_CONTEXT.md` updated at major milestones (such as production Supabase migration, Vercel launch, CUPS rollout, or `main` merge).
