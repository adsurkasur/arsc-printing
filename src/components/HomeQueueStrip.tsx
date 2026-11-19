'use client';

import * as React from 'react';
import Link from 'next/link';
import { ClockDuotone } from '@/components/icons';
import { COPY_HOME, COPY_LOADING, COPY_TOASTS } from '@/lib/copy';
import { CountUp } from '@/components/m3';

export type QueueStripState =
  | { status: 'loading' }
  | { status: 'ready'; count: number }
  | { status: 'error' };

export function formatQueueStripText(state: QueueStripState): string {
  if (state.status === 'loading') return COPY_LOADING.list;
  if (state.status === 'error') return COPY_TOASTS.backendUnavailable;
  return `${state.count} ${COPY_HOME.queueCountSuffix}`;
}

export async function fetchQueueCount(
  fetchImpl: typeof fetch = fetch,
): Promise<QueueStripState> {
  try {
    const res = await fetchImpl('/api/queue');
    if (!res.ok) return { status: 'error' };
    const data = (await res.json()) as { count?: unknown };
    if (typeof data?.count === 'number') {
      return { status: 'ready', count: data.count };
    }
    return { status: 'error' };
  } catch {
    return { status: 'error' };
  }
}

export function HomeQueueStrip() {
  const [state, setState] = React.useState<QueueStripState>({ status: 'loading' });

  React.useEffect(() => {
    let active = true;
    fetchQueueCount().then((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mt-space6 lg:mt-space12 p-space4 rounded-l bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex flex-wrap items-center justify-between gap-space3">
      <div className="flex items-center gap-space3">
        <ClockDuotone className="w-5 h-5 shrink-0" aria-hidden="true" />
        <span className="text-bodyMedium-emphasized">
          {state.status === 'ready' ? (
            <CountUp
              value={state.count}
              duration={0.6}
              formatter={(n) => formatQueueStripText({ status: 'ready', count: Math.round(n) })}
            />
          ) : (
            formatQueueStripText(state)
          )}
        </span>
      </div>
      <Link
        href="/queue"
        className="text-labelLarge-emphasized text-[var(--md-sys-color-on-secondary-container)] underline underline-offset-4 min-h-[48px] flex items-center"
      >
        {COPY_HOME.queueLink}
      </Link>
    </div>
  );
}
