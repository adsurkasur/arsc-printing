'use client';

import * as React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { m3Transition } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { getM3LayerVars, M3StateLayer, type M3SurfacePair } from './state-layer';

export interface M3PressableProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  children?: React.ReactNode;
  pair?: M3SurfacePair;
  disabledLayer?: boolean;
  /** Optional simulated state for /dev/tokens matrix */
  simulatedState?: 'hover' | 'focus' | 'pressed' | 'dragged';
  /** Disable morphing borderRadius on press (e.g. non-pill controls) */
  morphRadius?: boolean;
}

/**
 * Reusable M3 Pressable button primitive:
 * - Uses Framer Motion `press` spring (stiffness 800, damping 32)
 * - Scales 1 -> 0.98 and morphs radius -> 16px on press
 * - Honors `prefers-reduced-motion` (0ms transform)
 * - Includes `.m3-control` + `M3StateLayer`
 */
export const M3Pressable = React.forwardRef<HTMLButtonElement, M3PressableProps>(
  (
    {
      pair = 'primary',
      disabledLayer = false,
      simulatedState,
      morphRadius = true,
      disabled,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const prefersReduced = useReducedMotion() === true;
    const transition = m3Transition('press', prefersReduced);
    const layerVars = getM3LayerVars(pair, disabledLayer);
    const fgColor = disabled ? undefined : (layerVars as Record<string, string>)['--m3-layer-foreground'];

    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        tabIndex={disabled ? undefined : (props.tabIndex ?? 0)}
        data-state={simulatedState}
        transition={transition}
        whileTap={
          disabled || prefersReduced
            ? undefined
            : morphRadius
              ? { scale: 0.98, borderRadius: '16px' }
              : { scale: 0.98 }
        }
        style={{ ...(fgColor ? { color: fgColor } : {}), ...layerVars, ...style }}
        className={cn(
          'm3-control',
          simulatedState === 'focus' && 'm3-focus-ring',
          simulatedState === 'pressed' && !prefersReduced && 'scale-[0.98] rounded-[16px]',
          className,
        )}
        {...props}
      >
        <M3StateLayer />
        {children}
      </motion.button>
    );
  },
);
M3Pressable.displayName = 'M3Pressable';
