/**
 * Motion Tokens Module (M3_SPEC.md §4)
 * Locked Material 3 Expressive spring and tween configurations.
 */

import { type Transition, useReducedMotion } from 'framer-motion';

export const motionTokens = {
  // Spatial springs (transforms, layouts): mass 1, velocity 0, restDelta 0.01, restSpeed 0.1
  spatialFast: {
    type: 'spring',
    mass: 1,
    velocity: 0,
    stiffness: 800,
    damping: 32,
    restDelta: 0.01,
    restSpeed: 0.1,
  } satisfies Transition,

  spatialDefault: {
    type: 'spring',
    mass: 1,
    velocity: 0,
    stiffness: 380,
    damping: 31,
    restDelta: 0.01,
    restSpeed: 0.1,
  } satisfies Transition,

  spatialSlow: {
    type: 'spring',
    mass: 1,
    velocity: 0,
    stiffness: 200,
    damping: 24,
    restDelta: 0.01,
    restSpeed: 0.1,
  } satisfies Transition,

  // Effects tweens (color, opacity, clip): no overshoot
  effectsFast: {
    type: 'tween',
    duration: 0.15,
    ease: [0.31, 0.94, 0.34, 1.0],
  } satisfies Transition,

  effectsDefault: {
    type: 'tween',
    duration: 0.20,
    ease: [0.34, 0.80, 0.34, 1.0],
  } satisfies Transition,

  effectsSlow: {
    type: 'tween',
    duration: 0.30,
    ease: [0.34, 0.88, 0.34, 1.0],
  } satisfies Transition,

  // Press feedback recipe: scale 1 -> 0.98, radius full -> 16
  press: {
    type: 'spring',
    mass: 1,
    velocity: 0,
    stiffness: 800,
    damping: 32,
    restDelta: 0.01,
    restSpeed: 0.1,
  } satisfies Transition,

  // Reduced motion: transforms/layout duration 0; opacity duration 0.10 linear
  reduced: {
    type: 'tween',
    duration: 0.10,
    ease: 'linear',
  } satisfies Transition,
} as const;

export type MotionTokenName = keyof typeof motionTokens;

/**
 * Hook to retrieve an M3 transition respecting prefers-reduced-motion.
 */
export function useM3Transition(token: MotionTokenName): Transition {
  const shouldReduce = useReducedMotion();
  if (shouldReduce) {
    return motionTokens.reduced;
  }
  return motionTokens[token];
}
