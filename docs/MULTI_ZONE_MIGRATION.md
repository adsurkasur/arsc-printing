---
status: approved-not-started
last_verified: 2026-09-28
audience: maintainers-and-ai
sensitivity: internal
---

# Planned Change: Serve ARSC Printing at `/app/printing` (Next.js Multi-Zones)

## Why

The owner approved serving every ARSC app from **one domain**. A new repo, `adsurkasur/arsc-home`, is the ARSC company profile and the main zone. It rewrites `/app/printing/*` to this app's deployment. Printing keeps its own repo, Vercel project, and Supabase usage. It only needs `basePath: "/app/printing"` plus fixes for paths that bypass Next's basePath handling.

The canonical cross-repo runbook lives in arsc-home: `docs/MULTI_ZONES_RUNBOOK.md` and `docs/ECOSYSTEM.md`. The decisions are arsc-home DEC-009…DEC-011 and this repo's DEC-002.

**This change does not clear the production audit.** `MAINTAINER_GUIDE.md` (status `audit-required-before-production`) still applies in full: storage privacy, admin authorization, tracking minimization, and cleanup.

## Owner decisions that affect Printing

- Printing is recommended as the **first** app to migrate. It has no shared-identity coupling, so there are no auth or SSO effects. Its admin auth is independent.
- **Back link:** add a small `<a href="/">ARSC</a>` in the header. It is a plain anchor because this is a cross-zone hard navigation.
- **Old URL:** after the rewrite is proven, `arsc-printing.vercel.app/*` 308-redirects to `<domain>/app/printing/*` through a `has: host` rule in `vercel.json`. The rewrite targets a separate zone alias to avoid loops. Printed QR codes and posters that point to the old URL keep working through this redirect.

## Required code changes (audit 2026-09-28, commit `28845fc`)

Line numbers may drift, so re-grep before editing.

| # | Where | Change |
|---|---|---|
| 1 | new `src/lib/base-path.ts` | `export const BASE_PATH = "/app/printing"` and `withBase(path)`. This is the single source. |
| 2 | `next.config.ts` | `basePath: BASE_PATH` |
| 3 | 10× `fetch('/api/…')`: `src/app/order/page.tsx:107,182`, `src/app/admin/page.tsx:336,368`, `src/app/track/page.tsx:78`, `src/components/OrderSuccessClient.tsx:136,298`, `src/contexts/OrderContext.tsx:81,217,298` | `fetch(withBase('/api/…'))` |
| 4 | `src/app/order/page.tsx:217,883` | QRIS fallback `'/qris-placeholder.svg'`: prefix it, and prefix `NEXT_PUBLIC_QRIS_URL` when it is a relative path. Update `.env.local.example` (`/qris-arsc.jpeg`). |
| 5 | `src/app/layout.tsx:11-25` | Favicon icons and OG `images: ['/qris-arsc.jpeg']`: use `withBase()` and add `metadataBase`. This also fixes the build warning about the missing `metadataBase`. |
| 6 | Header | ARSC back link. |

The following need no change:
- `src/middleware.ts` redirects with `nextUrl.clone()`, which keeps basePath. The deprecated `middleware` → `proxy` rename is a separate task.
- `router.push` from `next/navigation` already gets basePath.
- `src/app/robots.txt` will be served at `/app/printing/robots.txt`, which crawlers ignore. arsc-home's robots applies. Make sure admin routes stay non-indexed through metadata if needed.

## Operator actions (owner, not an agent)

- Vercel: add a zone alias (e.g. `arsc-printing-zone.vercel.app`) and set arsc-home `ZONE_PRINTING_URL` to it.
- There are no Supabase Auth redirect URLs to change. Password login does not use email redirects.

## Verification

```powershell
bun install --frozen-lockfile
bun run lint
bun run build
```

This repo has no automated tests yet (PRT-02). On a preview, run these manually in demo mode with non-sensitive files:
- Order flow: upload, then order, then the QRIS image shows.
- Tracking lookup works.
- Admin login redirects to `/app/printing/admin/login`, and admin delete-file works.
- Favicon and OG image load.
- No 404s in the network tab.

## Rollback

Unset `ZONE_PRINTING_URL` in arsc-home and remove the 308. For a full rollback, revert the basePath PR.
