# ARSC Printing Service

A modern web application for campus printing services built with Next.js 16, React 19, TypeScript, Tailwind CSS, and Supabase.

# ARSC Printing Service

ARSC Printing is a campus-focused document printing platform built with Next.js (App Router), React, TypeScript, Tailwind CSS, and Supabase. It provides a lightweight web experience for submitting print jobs, tracking order status, and managing orders from an admin dashboard.

## Key Features

- Upload PDF / DOC / DOCX files (10 MB limit) with server-side validation
- Create and manage print orders with print preferences (color, copies, paper size)
- Public order tracking via a short order ID
- Admin dashboard for viewing and updating order status
- Demo mode fallback when Supabase is not configured (for local development)
- Built with accessibility and responsive design in mind

## Tech Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript + React 19
- Database & Auth: Supabase (Postgres)
- Storage: Supabase Storage (for uploaded documents)
- State / Data: React Context + TanStack Query
- UI: Tailwind CSS, shadcn/ui primitives, Radix
- Package manager: Bun

## Quickstart (Developer)

Prerequisites: Node 20.9+, Bun, and a Supabase project (optional for demo mode).

1. Clone repository

```bash
git clone https://github.com/adsurkasur/arsc-printing.git
cd arsc-printing
```

2. Install dependencies

```bash
bun install
```

3. Create local env file

```bash
cp .env.local.example .env.local
```

4. Add Supabase environment variables to `.env.local` (optional - demo mode will run without them):

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Run the development server

```bash
bun run dev
```

Open http://localhost:3000 in your browser.

## Environment & Demo Mode

- If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing or contain placeholder values, the application runs in "demo mode":
   - Uploads and database operations will return mock/demo responses.
   - UI shows clear messages indicating demo behavior.
- For production, provide valid Supabase URL and anon key and set up the database schema with `supabase-schema.sql`.

## Supabase Setup

1. Create a Supabase project at https://app.supabase.com
2. Open SQL Editor and run `supabase-schema.sql` from the repository to create the `orders` table.
3. In Supabase > Storage, create a bucket named `documents` for uploaded files.
4. (Optional) Add an admin user via Supabase Auth or manage via the dashboard.

## API Reference

This project exposes Next.js App Router API routes under `/api`.

- POST `/api/upload` — multipart/form-data file upload
   - Accepts: `file` (PDF, DOC, DOCX). Max 10MB.
   - Response (success): `{ fileName, filePath, fileUrl }`

- GET `/api/orders` — list orders or query by `id` or `trackingId`
   - Examples:
      - List all orders: `GET /api/orders`
      - Get by id: `GET /api/orders?id=<ORDER_ID>`
      - Public tracking: `GET /api/orders?trackingId=<TRACKING_ID>` (returns limited fields)

- POST `/api/orders` — create order
   - JSON body: `CreateOrderInput` (see `src/types/order.ts`)
   - Example body:

```json
{
   "customer_name": "Jane Doe",
   "contact": "jane@example.com",
   "file_name": "document.pdf",
   "file_url": "https://...",
   "color_mode": "bw",
   "copies": 2,
   "paper_size": "A4",
   "notes": "Please print double-sided"
}
```

- PATCH `/api/orders` — update order status
   - JSON body: `{ id: string, status: 'pending' | 'printing' | 'completed' | 'cancelled' }`

Note: When Supabase is not configured the API returns demo data or `demoMode: true` in responses.

## Data Model

See `src/types/order.ts` for TypeScript definitions. Main fields:

- `id`, `customer_name`, `contact`, `file_name`, `file_url`, `color_mode` (`bw|color`), `copies`, `paper_size`, `status`, `estimated_time`, `created_at`.

Estimated processing time is calculated server-side when creating orders (copies × cost-per-copy minutes based on color mode).

## Admin

- Admin UI lives under `/admin`. Authentication is handled via Supabase Auth (project-specific).
- Admins can view all orders and update statuses.

## Deployment

Recommended: Vercel. Add the same environment variables to the Vercel project settings and deploy the `main` branch for automatic builds.

Manual build & run:

```bash
# Build for production
bun run build

# Start production server
bun run start
```

## Development Notes

- File upload validation (server and client) restricts to PDF/DOC/DOCX with a 10MB max.
- Client code gracefully falls back to demo mode when Supabase is not configured.

## Troubleshooting

- If uploads fail, confirm your Supabase `documents` bucket name and that anon/public key has storage privileges.
- Use browser console and server logs for stack traces.

## Contributing

- Fork → feature branch → PR. Keep changes focused and add tests where applicable.

## License & Ownership

This repository is currently private and owned by the ARSC Printing project. Contact the project owner for licensing and contribution agreements.

---

For a deeper technical narrative, architecture diagrams, and product rationale see [WHITEPAPER.md](WHITEPAPER.md).
