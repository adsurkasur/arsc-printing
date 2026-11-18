'use client';

import * as React from 'react';
import Link from 'next/link';
import { ClockDuotone } from '@/components/icons';
import { COPY_HOME } from '@/lib/copy';

export function HomeQueueStrip() {
  const [count, setCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    let active = true;
    fetch('/api/queue')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data && typeof data.total_active === 'number') {
          setCount(data.total_active);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const label =
    count === null
      ? `0 ${COPY_HOME.queueCountSuffix}`
      : `${count} ${COPY_HOME.queueCountSuffix}`;

  return (
    <div className="mt-space6 lg:mt-space12 p-space4 rounded-l bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex flex-wrap items-center justify-between gap-space3">
      <div className="flex items-center gap-space3">
        <ClockDuotone className="w-5 h-5 shrink-0" aria-hidden="true" />
        <span className="text-bodyMedium-emphasized">{label}</span>
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
