import { cn } from '@/lib/utils';

/**
 * M3 Focus Ring contract (§2.1 / §5):
 * 3px solid primary outline with 3px surface-colored gap.
 * Matches `:focus-visible` in globals.css; `.m3-focus-ring` allows deterministic fixture testing.
 */
export const m3FocusRingClass = 'm3-focus-ring';

export function getM3FocusRingClass(forced = false, extra?: string) {
  return cn(forced && m3FocusRingClass, extra);
}
