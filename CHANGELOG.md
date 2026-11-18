
## [feat/redesign-v2] - 2026-11-18
### Added
- M3 Expressive UI across `/`, `/order`, `/order-success`, `/track`, `/queue`, `/admin/login`, and `/admin`.
- `COPY_RECEIPT_EVENTS` and `formatReceiptEvent()` for human Indonesian receipt history labels.
- `scripts/e2e-admin.mjs` and `scripts/stage5-capture.mjs` for full-flow verification.

### Fixed
- Order submission headers/fields (`Idempotency-Key`, `csrfToken`, `orderId`) and `OrderSuccessClient` status heading/body for `delivered` and `cancelled`.
- `/admin` API mapping (`data.items`, `contact`, `expectedVersion`, `printerKey`).
- `/track` leading magnifier icon alignment inside `#tracking-id`.
