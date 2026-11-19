# YAGNI Audit — ARSC Printing (`feat/redesign-v2`)

Audit of every visible UI element across all pages, plus explicit YAGNI decisions.

## Key YAGNI Decisions

| Item | Decision | Justification |
|---|---|---|
| Duplicate status (badge + timeline) | **Keep single indicator per context** | On `/order-success` and `/track`, only the status heading + 5-step timeline is shown (no duplicate status badge). On `/admin` order cards, `StatusBadge` is the single status indicator for each list item. |
| `Rev` and `ID Pekerjaan` in admin | **Keep `Nomor proses` in receipt only; no `Rev` in UI** | `Rev` is not shown in the admin UI. `Nomor proses` (`text062`) appears only inside the `Rincian pesanan` modal for operator/worker troubleshooting. |
| Theme toggle | **Keep** | Supports light/dark mode preference and visual comfort. |
| Account icon in public header | **Keep** | `UserCircleDuotone` (`Menu petugas`) links to `/admin`, providing operators a direct entry point without adding a text link to customer navigation. |
| Duplicate CTAs (Hero CTA + FAB) | **Keep with responsive split** | Hero CTA serves desktop/above-the-fold; FAB (`md:hidden`) serves mobile thumb reachability when scrolled. |
| Footer items | **Keep** | Brand, Location & Service Hours (`Sekretariat ARSC Gedung A FTAB UB`, `Jam layanan fleksibel`), and Tariff & Contact (`Hubungi Arina: +62 878-8283-2706` `tel:` + WhatsApp). |
| `/dev/tokens` link | **Remove / Keep unlinked** | Not linked in any customer or admin navigation; returns 404 in production. |

---

## Page-by-Page Element Inventory

### 1. Home (`/`)

| Element | Purpose | User action or decision it supports | Keep / Remove |
|---|---|---|---|
| TopAppBar (brand, nav links, theme toggle, admin icon) | Global navigation & theme | Navigate to `/`, `/order`, `/track`, `/queue`, `/admin`; toggle theme | Keep |
| Hero H1 & subtitle | Value proposition | Understand service purpose immediately | Keep |
| Hero primary CTA (`Buat pesanan`) | Start order | Navigate to `/order` | Keep |
| Tariff card (B&W Rp 500, Color Rp 750) | Pricing transparency | Decide whether to print before starting | Keep |
| Queue strip (`HomeQueueStrip`) | Live queue count | Gauge current wait/backlog | Keep |
| Process steps (3 rows) | How it works | Understand upload → pay → pickup flow | Keep |
| Service hours note | Expectations | Know orders are checked flexibly on next session | Keep |
| Mobile FAB (`md:hidden`) | Quick order access on mobile | Start `/order` while scrolled on mobile | Keep |
| Footer | Location, hours, tariff, contact | Find secretariat (`Gedung A`) or contact Arina | Keep |

### 2. Order Wizard (`/order` — Steps 1–3)

| Element | Purpose | User action or decision it supports | Keep / Remove |
|---|---|---|---|
| 3-step Stepper | Progress & navigation | See current step (1: Dokumen, 2: Pembayaran, 3: Konfirmasi) | Keep |
| Step 1: Name & WhatsApp/Telegram inputs | Customer identity | Allow operator to contact customer | Keep |
| Step 1: PDF Dropzone + page count | Document upload | Upload PDF (≤ 10 MiB) and verify page count | Keep |
| Step 1: Copies & Color/B&W selector | Print options | Configure print job and see live price estimate | Keep |
| Step 2: Order summary & QRIS/payment info | Payment amount | Verify total before paying | Keep |
| Step 2: Payment proof dropzone | Proof upload | Upload PNG/JPEG proof (≤ 5 MiB) | Keep |
| Step 3: Final review & Submit button | Confirmation | Review all details and submit order | Keep |

### 3. Order Success (`/order-success`)

| Element | Purpose | User action or decision it supports | Keep / Remove |
|---|---|---|---|
| Success icon & status heading | Confirmation | Confirm order was received | Keep |
| Pickup code panel + Copy button | Pickup identifier | Save/copy `ARSC-XXXX` code for tracking & pickup | Keep |
| Final amount panel | Receipt summary | Verify total billed | Keep |
| 5-step Timeline | Order progress | See current stage without duplicate badge | Keep |
| Contact block (Arina `tel:` + WhatsApp) | Support | Contact operator if needed | Keep |
| Actions (`Lacak pesanan`, `Buat pesanan lain`) | Next steps | Go to `/track` or start a new order | Keep |

### 4. Track (`/track`)

| Element | Purpose | User action or decision it supports | Keep / Remove |
|---|---|---|---|
| Heading & helper text | Page context | Understand how to look up an order | Keep |
| Tracking ID input (with leading magnifier) + Submit | Order lookup | Enter `ARSC-XXXX` to fetch status | Keep |
| Info banner | Expectation setting | Know how verification works | Keep |
| Contact block (Arina `tel:` + WhatsApp) | Support | Contact operator if stuck | Keep |
| `OrderSuccessClient` result (when searched) | Live status & timeline | View current status, pickup code, and timeline | Keep |

### 5. Queue (`/queue`)

| Element | Purpose | User action or decision it supports | Keep / Remove |
|---|---|---|---|
| Queue heading & summary | Public queue visibility | See active/pending print queue | Keep |
| Queue list items | Anonymized job status | Gauge position in queue | Keep |

### 6. Admin Login (`/admin/login`)

| Element | Purpose | User action or decision it supports | Keep / Remove |
|---|---|---|---|
| Email & Password inputs | Operator authentication | Sign in to `/admin` | Keep |
| Submit button | Form submission | Authenticate session | Keep |

### 7. Admin (`/admin`)

| Element | Purpose | User action or decision it supports | Keep / Remove |
|---|---|---|---|
| AdminShell (Navigation Rail / Mobile bar) | Operator navigation | Switch views or sign out | Keep |
| Simulation banner (when `NEXT_PUBLIC_ARSC_SIMULATION=true`) | Safety indicator | Distinguish simulated printer from physical printer | Keep |
| Summary card (3 metrics) | Daily overview | Monitor total orders, pages, and revenue | Keep |
| Filter card (Search, status chips, dates, device select) | Order filtering | Find specific orders or filter by status/device | Keep |
| Order cards (with single `StatusBadge` + action buttons) | Order management | Verify payment, approve, print, view receipt, or mark delivered | Keep |
| Receipt modal (`Rincian pesanan`) | Detailed audit | Inspect `Riwayat proses` and `Nomor proses` | Keep |

---

## Layout, Edge-Check & Keyboard Accessibility Audit

- **Edge-Check (`scripts/edge-check.mjs`)**: **0 offenders** (`EDGE_OK`) across `/`, `/order`, `/order-success`, `/track`, `/queue`, `/admin/login`, and `/admin` at `375`, `768`, `1280`, and `1440`.
- **Keyboard Tab / Focus Order**:
  - `/order`: `Tab` moves cleanly through header links, theme toggle, admin icon, and into `#customer_name` (`544×56`) with visible focus ring.
  - `/admin`: `Tab` moves cleanly through header links, theme toggle, admin icon, and into the admin navigation rail (`64×64`) with visible focus ring.
- **Browser Console Audit**: **0 console errors** across `/`, `/order`, `/order-success`, `/track`, `/queue`, `/admin/login`, and `/admin`.

