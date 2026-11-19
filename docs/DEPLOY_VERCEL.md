# Vercel Deployment Readiness — ARSC Printing

> **Important:** This document is documentation-only. No API or auth code was changed.

## Build Command

```bash
bun run build
```

(Runs `next build`.)

## Environment Variables (Names Only)

Set these in the Vercel project settings (never commit values):

- `ARSC_LOCAL_MODE`
- `ARSC_LOCAL_SUPABASE_URL`
- `ARSC_LOCAL_SUPABASE_ANON_KEY`
- `ARSC_LOCAL_SUPABASE_SERVICE_ROLE_KEY`
- `ARSC_LOCAL_CAPABILITY_SECRET`
- `ARSC_LOCAL_CRON_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ARSC_SIMULATION` (set to `false` for physical/production, `true` for simulation)

## Loopback Guard Blocker (Why Vercel Cannot Reach t530 Supabase As-Is)

The current server and middleware code **explicitly rejects non-loopback Supabase URLs** (`http://localhost`, `http://127.0.0.1`, or `http://[::1]` only) and requires `ARSC_LOCAL_MODE === 'true'`:

- **`src/lib/supabase/service.ts:9`**:
  ```ts
  if(process.env.ARSC_LOCAL_MODE==='true'&&u.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(u.hostname)&&!u.username&&!u.password&&!u.search&&!u.hash&&u.pathname==='/')return u.origin
  ```
- **`src/lib/supabase/middleware.ts:9`**:
  ```ts
  if(process.env.ARSC_LOCAL_MODE!=='true'||url.protocol!=='http:'||!['localhost','127.0.0.1','[::1]'].includes(url.hostname)||url.username||url.password||url.pathname!=='/'||url.search||url.hash||!key)throw new Error('unavailable')
  ```

Because Vercel serverless functions run on remote infrastructure (not loopback), any remote `https://` Supabase URL or t530 tunnel URL will be rejected by this guard until the guard is updated for production/remote deployment.
