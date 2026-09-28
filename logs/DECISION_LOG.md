# Decision Log (Architecture Decision Records)

### [DEC-001] Adoption of Modular Logging Protocol
- **Date**: 2026-09-16
- **Status**: Accepted
- **Context**: Standardizing change tracking, observability, and auditability across all managed projects for AI agents and human contributors.
- **Decision**: Mandate logs/ACTIVITY_LOG.md, logs/DECISION_LOG.md, and logs/CHANGELOG.md updates across all repositories.
- **Consequences**: Consistent history, reduced context loss during multi-agent handoffs.

### [DEC-002] Serve Printing under `/app/printing` on the shared ARSC domain (Multi-Zones)
- **Date**: 2026-09-28
- **Status**: Accepted (not implemented)
- **Context**: The owner wants one domain for all ARSC apps. The new `arsc-home` company-profile repo is the main zone and rewrites `/app/<name>/*` to each app's Vercel deployment.
- **Decision**:
  - Set `basePath: "/app/printing"` from a single `BASE_PATH` constant.
  - Use `withBase()` for all client `fetch('/api/…')` calls, the QRIS fallback asset, and favicon/OG metadata, and add `metadataBase`.
  - Add an "ARSC" back link.
  - Redirect the old host with a 308 once the rewrite is proven, so printed QR codes keep working.
  - Printing is the first app to migrate because it has no shared-identity coupling.
- **Consequences**: The production audit in `docs/MAINTAINER_GUIDE.md` still applies unchanged. Spec: `docs/MULTI_ZONE_MIGRATION.md`.
