---
status: audit-required-before-production
last_verified: 2026-08-15
audience: maintainers-operators-and-ai
sensitivity: restricted-file-processing
---

# ARSC Printing Maintainer Guide

## Product boundary

This application accepts documents and print preferences, creates orders, exposes limited tracking, and provides an admin workflow. Because users may upload academic, identity, financial, or otherwise private documents, file handling is the primary security boundary—not a secondary operational detail.

The current package has lint and build scripts but no automated test script. Historical build/lint output files are not proof for the current commit.

## Architecture orientation

- `src/app/order/`: customer order flow.
- `src/app/track/`: public tracking surface.
- `src/app/admin/`: admin UI and login.
- `src/app/api/upload/route.ts`: upload boundary.
- Other `src/app/api/` routes: order query/mutation and cleanup behavior; inspect current source before relying on README examples.
- `src/lib/supabase/`: client/server/middleware setup.
- `src/types/order.ts`: application data contract.
- `supabase-schema.sql`: schema/setup reference, not remote-deployment proof.
- `src/contexts/OrderContext.tsx`: demo/client behavior.

## Mandatory production review

| Area | Questions to prove |
| --- | --- |
| Admin authorization | Is every list/update/download route server-authorized by an approved role, not only hidden in UI? |
| Public tracking | Does a tracking lookup expose only the minimum status fields and resist enumeration/rate abuse? |
| Storage | Is the bucket private; are URLs signed/short-lived; can one customer retrieve another order's file? |
| Upload validation | Are size, MIME, extension, content, filename, path, and malformed-file cases handled server-side? |
| Retention | Is cleanup actually scheduled and verified for documents and payment proofs; what happens on failure? |
| Order data | Are name/contact/notes protected by RLS and omitted from public responses/logs? |
| Demo mode | Can production ever fall back silently to mock behavior because of a misconfigured environment? |
| Payment/QR | Who owns the displayed payment identity and approves changes? |

Configured TTL variables are intent, not deletion evidence. Preserve a dated cleanup execution result and verify that database references do not leave files reachable.

## Local verification

```powershell
bun install --frozen-lockfile
bun run lint
bun run build
```

Then manually exercise demo mode without private files. Before production, add automated coverage for validation, unauthorized admin access, tracking minimization, order creation/update, storage failures, and cleanup.

## Operational policy required

The owner must define accepted file types/content, maximum size, pricing, order cancellation, payment proof handling, staff access, printing-device handling, retention/deletion, customer support, breach response, and whether completed physical/temporary copies are destroyed. Show an accurate privacy notice before upload.

## Release stop conditions

Do not release if the bucket is public, admin enforcement is only client-side, tracking IDs disclose private fields, cleanup has no execution path, demo mode can activate silently in production, real user files are used in tests, or no owner is accountable for uploaded documents.

## Local verification note (2026-08-15)

Frozen Bun installation, lint, and production build passed. Build warnings flagged the deprecated Next middleware convention, stale browser compatibility data, and missing `metadataBase`. No test script exists, and no upload, authentication, storage-policy, or cleanup behavior was exercised.
