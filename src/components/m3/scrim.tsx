'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type M3ScrimProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * M3 Scrim (§3 / §5):
 * Uses `color-mix(in srgb, var(--md-sys-color-scrim) 32%, transparent)` via `.m3-scrim`.
 */
export const M3Scrim = React.forwardRef<HTMLDivElement, M3ScrimProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('m3-scrim', className)} {...props} />
));
M3Scrim.displayName = 'M3Scrim';
