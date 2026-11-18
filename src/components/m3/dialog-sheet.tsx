'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export interface M3ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  /** Render as bottom sheet on mobile (<600px) and centered dialog (>=600px) */
  sheetOnMobile?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Responsive M3 Dialog <-> Bottom Sheet (§5):
 * - Radix Dialog portal, Escape closes, focus trap/return
 * - Scrim: `.m3-scrim` (32% scrim token via color-mix)
 * - >=600px: centered dialog, max-width 560px, radius 28px, elevation-3
 * - <600px (when sheetOnMobile=true): bottom sheet, top radius 28px, 32x4 handle, max-h 85dvh
 */
export function M3ResponsiveDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  sheetOnMobile = true,
  children,
  actions,
  className,
}: M3ResponsiveDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="m3-scrim" />
        <DialogPrimitive.Content
          data-sheet={sheetOnMobile ? 'true' : undefined}
          className={cn('m3-overlay-panel', className)}
        >
          {sheetOnMobile && <div className="m3-sheet-handle" aria-hidden="true" />}
          <DialogPrimitive.Title className="text-headlineSmall-emphasized font-display text-[var(--md-sys-color-on-surface)]">
            {title}
          </DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description className="text-bodyLarge text-[var(--md-sys-color-on-surface-variant)] mt-space2">
              {description}
            </DialogPrimitive.Description>
          )}
          <div className="mt-space4">{children}</div>
          {actions && <div className="mt-space6 flex flex-wrap justify-end gap-space2">{actions}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
