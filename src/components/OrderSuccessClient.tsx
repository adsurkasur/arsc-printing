'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { m3Transition } from '@/lib/motion';
import {
  CheckCircleDuotone,
  CopyDuotone,
  WarningCircleDuotone,
} from '@/components/icons';
import {
  COPY_PAGES,
  COPY_UI,
  COPY_TOASTS,
  COPY_TIMELINE_STEPS,
  COPY_VALIDATION,
  COPY_ORDER_STATUS,
} from '@/lib/copy';
import { M3Pressable, getM3LayerVars, M3StateLayer, m3Toast } from '@/components/m3';

function getTimelineIndex(status: string | null): number {
  if (status === 'delivered') return 4;
  if (status === 'approved') return 2;
  return 1;
}

export default function OrderSuccessClient({ initialOrderId }: { initialOrderId: string | null }) {
  const reduced = useReducedMotion() === true;
  const [loading, setLoading] = React.useState(Boolean(initialOrderId));
  const [status, setStatus] = React.useState<string | null>(null);
  const [pickupCode, setPickupCode] = React.useState<string | null>(null);
  const [amountDue, setAmountDue] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedCode, setCopiedCode] = React.useState(false);

  React.useEffect(() => {
    if (!initialOrderId) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch('/api/orders?id=' + encodeURIComponent(initialOrderId), {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(COPY_VALIDATION.forbidden);
        }
        return res.json();
      })
      .then((data) => {
        setStatus(typeof data?.status === 'string' ? data.status : null);
        const code = typeof data?.pickupCode === 'string' ? data.pickupCode : typeof data?.pickup_code === 'string' ? data.pickup_code : null;
        setPickupCode(code);
        setAmountDue(typeof data?.amount_due === 'number' ? data.amount_due : null);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : COPY_VALIDATION.forbidden);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [initialOrderId]);

  const handleCopyPickup = async () => {
    if (!pickupCode) return;
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(pickupCode);
      setCopiedCode(true);
      m3Toast.success(COPY_TOASTS.copyPickup);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      m3Toast.error(COPY_TOASTS.clipboardFailed);
    }
  };

  if (!initialOrderId) {
    return (
      <div className="max-w-[720px] mx-auto px-4 md:px-0 pt-6 md:pt-12 pb-12">
        <div role="alert" className="p-space5 rounded-lPlus bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] flex items-start gap-space3">
          <WarningCircleDuotone className="w-6 h-6 shrink-0" aria-hidden="true" />
          <div>
            <h1 className="text-titleMedium-emphasized">{COPY_VALIDATION.notFound}</h1>
            <Link href="/order" className="inline-block mt-space3 underline text-labelLarge-emphasized">
              {COPY_UI.orderCta}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-[720px] mx-auto px-4 md:px-0 pt-6 md:pt-12 pb-12 space-y-space4" aria-busy="true">
        <div className="h-10 w-64 rounded-m bg-[var(--md-sys-color-surface-container-highest)] animate-pulse" />
        <div className="h-28 w-full rounded-lPlus bg-[var(--md-sys-color-surface-container-highest)] animate-pulse" />
        <div className="h-20 w-full rounded-lPlus bg-[var(--md-sys-color-surface-container-highest)] animate-pulse" />
        <div className="h-40 w-full rounded-lPlus bg-[var(--md-sys-color-surface-container-highest)] animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[720px] mx-auto px-4 md:px-0 pt-6 md:pt-12 pb-12 space-y-space4">
        <div role="alert" className="p-space5 rounded-lPlus bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] flex items-start gap-space3">
          <WarningCircleDuotone className="w-6 h-6 shrink-0" aria-hidden="true" />
          <p className="text-bodyLarge">{error}</p>
        </div>
        <Link href="/order" className="inline-block underline text-labelLarge-emphasized text-[var(--md-sys-color-primary)]">
          {COPY_UI.orderCta}
        </Link>
      </div>
    );
  }

  const activeIdx = getTimelineIndex(status);
  const statusInfo =
    status && status in COPY_ORDER_STATUS
      ? COPY_ORDER_STATUS[status as keyof typeof COPY_ORDER_STATUS]
      : COPY_ORDER_STATUS.pending_verification;

  return (
    <div className="max-w-[720px] mx-auto px-4 md:px-0 pt-6 md:pt-12 pb-12 space-y-space6">
      {/* Check32 + H1 + Body */}
      <div className="flex items-start gap-space3">
        <svg className="w-8 h-8 text-[var(--md-custom-color-success)] shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <motion.circle
            cx="12"
            cy="12"
            r="10"
            initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={m3Transition('effectsDefault', reduced)}
          />
          <motion.path
            d="m9 12 2 2 4-4"
            initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={m3Transition('effectsSlow', reduced)}
          />
        </svg>
        <div>
          <h1 className="text-headlineSmall-emphasized md:text-headlineMedium-emphasized font-display text-[var(--md-sys-color-on-surface)]">
            {status && status !== 'pending_verification' ? statusInfo.label : COPY_PAGES.success.text001}
          </h1>
          <p className="text-bodyLarge text-[var(--md-sys-color-on-surface-variant)] mt-space1">
            {status && status !== 'pending_verification' ? statusInfo.sentence : COPY_PAGES.success.text002}
          </p>
        </div>
      </div>

      {/* Pickup Panel (440px) + Final Amount (256px) at 1280 */}
      <div className="grid grid-cols-1 md:grid-cols-[440px_256px] gap-space6 items-stretch">
        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={m3Transition('spatialDefault', reduced)}
          style={getM3LayerVars('primaryContainer', true)}
          className="p-space5 rounded-lPlus bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex flex-col justify-between gap-space3"
        >
          <div className="flex items-start justify-between gap-space3">
            <div>
              <span className="text-labelLarge font-bold">{COPY_UI.pickupLabel}</span>
              <div className="text-pickup font-code mt-1 select-all">
                {pickupCode ?? COPY_UI.pickupMissing}
              </div>
            </div>
            <M3Pressable
              type="button"
              pair="primaryContainer"
              disabled={!pickupCode}
              aria-label={COPY_UI.copyPickup}
              onClick={() => void handleCopyPickup()}
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            >
              {copiedCode ? <CheckCircleDuotone className="w-6 h-6" /> : <CopyDuotone className="w-6 h-6" />}
            </M3Pressable>
          </div>
        </motion.div>

        <div className="p-space5 rounded-lPlus bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] flex flex-col justify-between">
          <span className="text-labelLarge text-[var(--md-sys-color-on-surface-variant)]">Tagihan akhir</span>
          <div className="text-amount-emphasized font-code text-[var(--md-sys-color-primary)] mt-space2">
            {amountDue !== null ? `Rp ${amountDue.toLocaleString('id-ID')}` : '—'}
          </div>
          <span className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)] mt-space2">
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* 5-step Timeline from actual status */}
      <ol className="p-space5 rounded-lPlus bg-[var(--md-sys-color-surface-container-low)] shadow-elevation-1 space-y-space3">
        {COPY_TIMELINE_STEPS.map((label, i) => {
          const done = i < activeIdx;
          const current = i === activeIdx;
          return (
            <motion.li
              key={label}
              aria-current={current ? 'step' : undefined}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? m3Transition('reduced', true) : { ...m3Transition('spatialDefault', false), delay: i * 0.06 }}
              className="flex items-center gap-space3"
            >
              {done ? (
                <CheckCircleDuotone className="w-5 h-5 text-[var(--md-custom-color-success)] shrink-0" aria-hidden="true" />
              ) : current ? (
                <span className="w-5 h-5 rounded-full ring-2 ring-[var(--md-sys-color-primary)] flex items-center justify-center shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)]" />
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full border border-[var(--md-sys-color-outline)] shrink-0" />
              )}
              <span className={current ? 'text-titleSmall-emphasized text-[var(--md-sys-color-primary)]' : 'text-titleSmall'}>
                {label}
              </span>
            </motion.li>
          );
        })}
      </ol>

      {/* Contact */}
      <div className="p-space4 rounded-lPlus bg-[var(--md-sys-color-surface-container-low)] flex flex-wrap items-center gap-x-4 gap-y-2 text-bodySmall">
        <a
          href={COPY_UI.contactTel}
          className="text-[var(--md-sys-color-primary)] font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--md-sys-color-primary)]"
        >
          {COPY_UI.contactLabel}
        </a>
        <a
          href={COPY_UI.contactWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--md-sys-color-primary)] font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--md-sys-color-primary)]"
        >
          {COPY_UI.contactWhatsappLabel}
        </a>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space3">
        <Link
          href="/track"
          style={getM3LayerVars('primary')}
          className="m3-control h-12 px-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-labelLarge-emphasized flex items-center justify-center"
        >
          <M3StateLayer />
          <span>Lacak pesanan</span>
        </Link>
        <Link
          href="/order"
          style={getM3LayerVars('surface')}
          className="m3-control h-12 px-6 rounded-full text-[var(--md-sys-color-primary)] text-labelLarge-emphasized flex items-center justify-center"
        >
          <M3StateLayer />
          <span>Buat pesanan lain</span>
        </Link>
      </div>
    </div>
  );
}
