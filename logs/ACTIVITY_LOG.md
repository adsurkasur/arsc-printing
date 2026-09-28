# Activity Log

### [2026-09-28] [Claude Code / Multi-Zones basePath]
- **Goal**: Make Printing servable at `/app/printing` on the shared ARSC domain **without changing current production**.
- **Actions**:
  - Added `src/lib/base-path.ts`. `BASE_PATH` comes from `NEXT_PUBLIC_BASE_PATH`: empty by default, validated, with a fail-fast error on malformed values.
  - Wired `basePath` in `next.config.ts`.
  - Routed all 10 client `fetch('/api/…')` calls, the QRIS fallback asset, and the favicon/OG metadata through `withBase()`.
  - Added a `← ARSC` back link in the Navbar that renders only when `BASE_PATH` is set.
  - Added `bun run test:unit` (`node --test`, no new dependency) and enabled `allowImportingTsExtensions`.
- **Files**: src/lib/base-path{,.test}.ts, next.config.ts, src/app/{layout,order/page,admin/page,track/page}.tsx, src/components/{Navbar,OrderSuccessClient}.tsx, src/contexts/OrderContext.tsx, package.json, tsconfig.json, docs/MULTI_ZONE_MIGRATION.md, logs/*.
- **Verification**:
  - `bun run test:unit`: 3/3. `bun run lint`: clean.
  - Standalone build (env unset): `/`, `/order`, `/queue`, `/track`, `/admin/login`, `/favicon.ico`, `/qris-placeholder.svg`, `/api/orders` all 200; back link absent.
  - Zone build (`NEXT_PUBLIC_BASE_PATH=/app/printing`) served through arsc-home with `ZONE_PRINTING_URL=http://localhost:4202`. In a browser (Playwright + in-app browser):
    - The Layanan card opened `/app/printing`, with assets loaded from `/app/printing/_next/…`.
    - `/order`, `/queue`, `/track`, `/admin/login` all rendered.
    - The API returned 200 through the domain.
    - `← ARSC` returned to `/id`.
    - No failed requests or console errors, apart from Vercel Analytics, noted below.
- **Notes**:
  - `@vercel/analytics` always requests `/_vercel/insights` at the domain root. Under the zone, analytics therefore belongs to the arsc-home project, which must have Web Analytics enabled.
  - Git Bash on Windows rewrites `/app/printing` into a filesystem path. Use `MSYS_NO_PATHCONV=1`; the validator catches this.

### [2026-09-28] [Claude Code / Planning + Documentation]
- **Goal**: Document the approved plan to serve ARSC Printing at `/app/printing` under one ARSC domain (Next.js Multi-Zones, main zone = new repo `arsc-home`), for handoff.
- **Actions**: Read-only basePath readiness audit at `28845fc`, covering 10 raw `fetch('/api/…')` calls, the QRIS fallback asset, favicon/OG metadata, middleware redirects, and robots. Wrote the migration spec. Added a planned-change section to the maintainer guide. Recorded DEC-002. Replaced the literal `\n` artifacts at the end of `AGENTS.md` and `logs/*.md` with real newlines.
- **Files Modified**: `docs/MULTI_ZONE_MIGRATION.md` (new), `docs/MAINTAINER_GUIDE.md`, `AGENTS.md` (EOF artifact only), `logs/*`.
- **Verification**: Documentation only, no code changed. Every referenced path and line was re-grepped at this commit.

### [2026-09-16 17:25] [Antigravity]
- **Goal**: Initialize modular logging system and mandatory agent protocols.
- **Actions**: Created logs/ directory and established AGENTS.md.
- **Files Modified**: AGENTS.md, logs/README.md, logs/ACTIVITY_LOG.md, logs/DECISION_LOG.md, logs/CHANGELOG.md.
- **Verification**: Git status verified.
