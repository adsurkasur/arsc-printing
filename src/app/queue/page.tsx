'use client';

import { useOrders } from '@/contexts/OrderContext';
import { ArrowClockwiseDuotone, ClockDuotone, CheckCircleDuotone } from '@/components/icons';
import { COPY_PAGES, COPY_LOADING } from '@/lib/copy';
import { M3Pressable } from '@/components/m3';

export default function QueuePage() {
  const { getQueueInfo, refreshOrders, loading, error } = useOrders();
  const queue = getQueueInfo();

  return (
    <div className="max-w-[720px] mx-auto px-4 md:px-0 pt-6 md:pt-12 pb-12 space-y-space6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space4">
        <div>
          <h1 className="text-headlineMedium-emphasized md:text-headlineLarge-emphasized font-display text-[var(--md-sys-color-on-surface)]">
            {COPY_PAGES.queue.text001}
          </h1>
          <p className="text-bodyMedium text-[var(--md-sys-color-on-surface-variant)] mt-space1">
            {COPY_PAGES.queue.text007}
          </p>
        </div>

        <M3Pressable
          type="button"
          pair="secondaryContainer"
          disabled={loading}
          aria-busy={loading}
          onClick={() => void refreshOrders()}
          className="min-h-[48px] px-5 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-labelLarge-emphasized flex items-center justify-center gap-space2 self-start sm:self-auto"
        >
          <ArrowClockwiseDuotone className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>{loading ? COPY_LOADING.genericRefresh : 'Segarkan'}</span>
        </M3Pressable>
      </div>

      {error && (
        <div
          role="alert"
          className="p-space4 rounded-l bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-bodyMedium"
        >
          {error}
        </div>
      )}

      {/* Real queue count */}
      <div className="p-space6 rounded-lPlus bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] flex items-center justify-between gap-space4">
        <div className="flex items-center gap-space3">
          <ClockDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)] shrink-0" aria-hidden="true" />
          <span className="text-titleMedium-emphasized">{COPY_PAGES.queue.text002}</span>
        </div>
        <span className="text-headlineLarge-emphasized font-code text-[var(--md-sys-color-primary)]">
          {queue.count}
        </span>
      </div>

      <div className="p-space5 rounded-l border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] flex items-start gap-space3">
        <CheckCircleDuotone className="w-5 h-5 text-[var(--md-sys-color-primary)] shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-bodyMedium text-[var(--md-sys-color-on-surface-variant)]">
          {COPY_PAGES.home.text018}
        </p>
      </div>
    </div>
  );
}
