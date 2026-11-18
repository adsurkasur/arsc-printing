'use client';

import { useState } from 'react';
import OrderSuccessClient from '@/components/OrderSuccessClient';
import { MagnifyingGlassDuotone, WarningCircleDuotone } from '@/components/icons';
import { COPY_PAGES } from '@/lib/copy';
import { M3Pressable } from '@/components/m3';

export default function TrackPage() {
  const [value, setValue] = useState('');
  const [id, setId] = useState('');

  return (
    <div className="max-w-[720px] mx-auto px-4 md:px-0 pt-6 md:pt-12 pb-12 space-y-space6">
      <div>
        <h1 className="text-headlineMedium-emphasized md:text-headlineLarge-emphasized font-display text-[var(--md-sys-color-on-surface)]">
          {COPY_PAGES.track.text001}
        </h1>
        <p className="text-bodyLarge text-[var(--md-sys-color-on-surface-variant)] mt-space2">
          {COPY_PAGES.track.text002}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setId(value.trim());
        }}
        className="p-space5 md:p-space6 rounded-lPlus bg-[var(--md-sys-color-surface-container-low)] shadow-elevation-1 space-y-space4"
      >
        <div>
          <label htmlFor="tracking-id" className="block text-labelLarge-emphasized text-[var(--md-sys-color-on-surface)] mb-space2">
            {COPY_PAGES.track.text003}
          </label>
          <div className="relative">
            <input
              id="tracking-id"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={COPY_PAGES.track.text004}
              className="w-full h-14 pl-12 pr-4 rounded-t-xs bg-[var(--md-sys-color-surface-container-highest)] border-b border-[var(--md-sys-color-outline)] text-bodyLarge font-code focus:border-b-2 focus:border-[var(--md-sys-color-primary)] focus:outline-none"
            />
            <MagnifyingGlassDuotone className="w-5 h-5 text-[var(--md-sys-color-on-surface-variant)] absolute left-4 top-4.5 pointer-events-none" aria-hidden="true" />
          </div>
        </div>

        <M3Pressable
          type="submit"
          pair="primary"
          className="h-12 px-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-labelLarge-emphasized w-full sm:w-auto"
        >
          {COPY_PAGES.track.text001}
        </M3Pressable>
      </form>

      <div className="p-space4 rounded-l bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-start gap-space3 text-bodyMedium">
        <WarningCircleDuotone className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
        <p>{COPY_PAGES.success.text010}</p>
      </div>

      {id && (
        <div className="pt-space2">
          <OrderSuccessClient initialOrderId={id} />
        </div>
      )}
    </div>
  );
}
