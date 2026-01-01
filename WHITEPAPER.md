## ARSC Printing — Whitepaper (Draft)

Provided by: Agritech Research and Study Club (ARSC), Faculty of Agrotechnology (FAT), Brawijaya University (UB)

### Executive Summary

ARSC Printing is a lightweight, cost-conscious print management platform developed to improve on-campus printing at Brawijaya University. It enables users (students, staff, and researchers) to submit documents remotely, select print preferences, and track job status while giving ARSC administrators a focused toolset to manage and fulfill print jobs with less ambiguity and delay.

### Problem Statement

The current printing workflow at ARSC (Faculty of Agrotechnology, UB) suffers from operational frictions that reduce convenience and reliability for users:

1. Uncertain system and manual dependency

- Print availability depends on which staff member is physically present at the ARSC secretariat or HQ. Users must often visit in person and ask staff whether printing can be done, causing wasted trips and unpredictable turnaround.

2. Uncertain technical availability (driver and format issues)

- Not every staff member can print every job — printer drivers, format incompatibilities, or pre-print processing differences (paper size, duplexing, color profiles) cause jobs to fail or require manual intervention. This increases latency and workload for administrators.

These limitations lead to poor user experience (extra visits, confusion), inefficient staff workflows (interruptions for manual checks), and underutilised opportunities for automation and scheduling.

3. Competitive gaps and access barriers

- Students face limited, expensive, or inconvenient alternatives: on‑campus vending/box printing is often priced too high and can be slow, while external copy shops are frequently located off‑campus with restricted opening hours and travel time. This lack of affordable, convenient options compounds the need for a reliable, campus‑centric service.

### Proposed Solution

ARSC Printing is designed specifically to eliminate the two core pain points above by providing:

- A centralized, web-accessible order queue so users can submit jobs remotely and receive clear status updates (pending → printing → completed). This removes the need to check staff availability in person.
- Print-ready processing: uploaded documents are normalized server-side (e.g., convert office docs to print-ready PDF, enforce page size and duplex settings) so jobs are driver-agnostic and more likely to print successfully regardless of which workstation handles them.
- Admin tooling for predictable handling: a compact admin UI shows a prioritized queue, per-job metadata (copies, color mode, estimated time), and bulk actions (assign, mark printing, complete, export). This reduces interruptions and clarifies responsibility.
- Public tracking and notifications: users receive a short order ID and can check status online or receive notifications when jobs are ready to pick up.
- Operational safeguards: use signed or expiring URLs for downloads, storage permissions per-bucket, and clear demo-mode behavior for local testing without Supabase.

Combined, these features reduce wasted trips, lower error rates due to driver mismatches, and make the printing service predictable and auditable.

### Background

The Agritech Research and Study Club (ARSC) at the Faculty of Agrotechnology, Brawijaya University has operated an informal campus printing service for many years. Because the secretariat is located in a high-traffic area, students frequently use ARSC’s printers to produce academic reports, proposals, and presentation materials. However, this service remains largely ad-hoc: availability depends on which members happen to be present and whether the available workstation has the correct printer drivers or configuration.

Current constraints include:

- Heavy reliance on physical presence: students must often visit the ARSC secretariat in person to check if printing is possible.
- Technical fragility: not every workstation is configured to handle all document formats or printer settings, which leads to job failures and delays.
- No formal workflow or digital record: operations are manual, making it difficult to measure demand, allocate staff responsibility, or scale the service.

These gaps reveal a clear opportunity to professionalize the service through a web-based platform that streamlines submission, standardizes job processing, and provides predictable, affordable printing for the student community.

### Core Features (refined)

1. Online Ordering
- Web-based order form that accepts PDF, DOC, DOCX with server-side checks and a 10 MB limit. Users select copies, color mode, and paper size and receive a short order ID.

2. Print-Ready Processing
- Server-side normalization (convert office formats to print-optimized PDF, enforce page size and duplex options) to reduce dependency on specific driver setups.

3. Real-time Notifications & Tracking
- Email/onscreen notifications for status changes. Public tracking by order ID for transparency.

4. Admin Workflow & Queue Management
- Compact admin UI with a prioritized queue, metadata, estimated times, and bulk actions (assign, mark printing, complete, export CSV).

5. Secure Storage & Delivery
- Uploaded files stored in a controlled Supabase bucket. Production deployments should use signed or time-limited URLs for downloads.

6. Demo Mode for Local Testing
- Built-in demo fallback when Supabase is not configured so local development and evaluation can proceed without cloud resources.

### Advantages & Benefits

- Accessibility: users can place orders anytime without waiting for staff to be present.
- Reliability: server-side normalization reduces print failures caused by driver or format mismatches.
- Cost-effectiveness: ARSC can maintain competitive pricing compared to campus vending printers and external shops.
- Operational clarity: time-stamped order history and simple admin tools reduce interruptions and clarify responsibility.
- Revenue potential: formalizing the service creates modest income for ARSC to support club activities.

### Competitor Analysis (summary)

- Campus vending/box printing: Often convenient but expensive for students and sometimes slow due to hardware or queueing constraints.
- External copy/print shops: May offer competitive prices but are often located off-campus, adding travel time and limited opening hours.

ARSC Printing positions itself between these options by offering convenient pickup near campus activity centers, student-friendly pricing, and predictable turnaround.

### Implementation & Rollout Plan (phased)

Phase 1 — Pilot (1–2 months)
- Deploy the platform in demo mode; collect feedback from student volunteers and ARSC staff. Validate file types, estimated time logic, and pickup workflow.

Phase 2 — Soft Launch (2–4 months)
- Connect to Supabase, enable storage and DB, and onboard a limited set of staff. Start tracking metrics and adjust pricing and staffing schedules.

Phase 3 — Full Launch (ongoing)
- Expand hours, add features (signed downloads, CSV exports, basic analytics), and refine operations based on usage patterns.

### Performance Targets & Metrics

- Target: reduce in-person checks by 80% for routine jobs within the first 3 months after launch.
- Target: improve first-pass print success rate by 70% after implementing server-side normalization.
- Measure: average submission-to-ready time, number of failed/redo jobs, uptake rate, and revenue contribution to ARSC.

### Institutional Integration

To maximize adoption, coordinate with faculty and campus services to publicize the platform and integrate pickup locations into student-facing maps and orientation materials. Consider student discount programs or integration with campus payment methods in later phases.

### Conclusion

ARSC Printing converts an informal, member-dependent service into a reliable, accessible, and auditable campus printing solution. By focusing on server-side normalization, clear admin workflows, and a student-friendly operating model, the platform reduces friction for users and creates a modest revenue stream for ARSC while supporting broader campus digitalization goals.

### Goals

- Reduce user trips to ARSC HQ by 80% for routine print jobs.
- Reduce failed prints due to driver/format issues by 70% through server-side normalization.
- Provide an auditable, time-stamped order history for operational transparency.

### Success Metrics

- Number of physical visits avoided (surveys or staff logs).
- Rate of successful first-pass prints versus previously observed failure rates.
- Average time from submission → ready-for-pickup.

### Architecture & Components

- Frontend: Next.js App Router, React components, Tailwind CSS
- Backend: Next.js serverless API routes (orders, upload) – stateless endpoints
- Database: Supabase Postgres table `orders`
- Storage: Supabase Storage bucket `documents`
- Authentication: Supabase Auth (for admin flows)
- Observability: Server logs and Supabase dashboard

Sequence of actions:

1. User uploads file via `/order` UI → `/api/upload` → storage
2. User submits order → `/api/orders` (creates DB row, estimated time computed)
3. Admin updates status → `/api/orders` PATCH → users can poll or check `/track`

### Data Model

Primary entity: `Order` with fields: id, customer_name, contact, file_name, file_url, color_mode, copies, paper_size, status, estimated_time, created_at.

### Security & Privacy

- Files stored in Supabase Storage; permissions should be configured per-bucket.
- Do not expose service-level keys in client builds — use environment variables and server-side operations.
- Consider expiring public URLs or generating signed URLs for download in production.

### Operational Considerations

- Backup: rely on Supabase backups for DB; mirror important files if required.
- Scaling: stateless serverless functions and managed Supabase scale with traffic.
- Monitoring: set up alerting for upload failures and DB errors.

### Cost & Budgeting (Estimates)

- Supabase free tier may be sufficient for low-volume campus use; monitor storage and bandwidth.
- Vercel hobby tier for hosting is cost-effective for small deployments.

### Roadmap

Short-term:
- Add signed URLs for secure downloads
- Admin filters and CSV export

Mid-term:
- Billing/integration with campus accounts
- Advanced scheduling and SLA estimates

Long-term:
- Multi-tenant support for departments
- Analytics dashboard with usage trends

### Appendix

- See `src/types/order.ts` for schema details.
- API endpoints: `/api/upload`, `/api/orders`.

---

Fill in the product-market rationale, performance targets, and institutional rollout plan here.
