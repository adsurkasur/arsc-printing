#!/usr/bin/env node
import { spawn } from 'node:child_process';

/**
 * Local development runner for ARSC Printing.
 * Enforces local-only loopback endpoints to prevent accidental connections to remote Supabase or Vercel.
 */

const localUrl = process.env.ARSC_LOCAL_SUPABASE_URL || 'http://127.0.0.1:54321';

try {
  const parsed = new URL(localUrl);
  const isLoopback = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '::1';
  if (!isLoopback) {
    console.error(`FATAL: ARSC_LOCAL_SUPABASE_URL must point to a loopback address. Found: ${parsed.hostname}`);
    process.exit(1);
  }
} catch (e) {
  console.error(`FATAL: Invalid URL for ARSC_LOCAL_SUPABASE_URL: ${localUrl}`);
  process.exit(1);
}

console.log('[local-dev] Initializing ARSC Printing local environment...');
console.log(`[local-dev] Local URL target: ${localUrl} (verified loopback)`);

// Start next dev server with Turbopack
const nextDev = spawn('bun', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    ARSC_LOCAL_MODE: 'true',
    ARSC_LOCAL_SUPABASE_URL: localUrl
  }
});

nextDev.on('close', (code) => {
  process.exit(code || 0);
});
