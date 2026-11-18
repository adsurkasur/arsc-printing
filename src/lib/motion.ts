/**
 * Motion Tokens Module (M3_SPEC.md §4)
 * Material 3 standard easing curves, durations, and spring transitions.
 * All tokens honor prefers-reduced-motion via Framer Motion.
 */

import { type Transition, useReducedMotion } from 'framer-motion';

export const M3_EASING = {
  emphasized: [0.2, 0.0, 0.0, 1.0] as const,
  emphasizedDecelerate: [0.05, 0.7, 0.1, 1.0] as const,
  emphasizedAccelerate: [0.3, 0.0, 0.8, 0.15] as const,
  standard: [0.2, 0.0, 0, 1.0] as const,
  standardDecelerate: [0, 0, 0, 1] as const,
  standardAccelerate: [0.3, 0, 1, 1] as const,
};

export const M3_DURATION = {
  short1: 0.05,
  short2: 0.1,
  short3: 0.15,
  short4: 0.2,
  medium1: 0.25,
  medium2: 0.3,
  medium3: 0.35,
  medium4: 0.4,
  long1: 0.45,
  long2: 0.5,
  long3: 0.55,
  long4: 0.6,
};

export const motionTokens = {
  spatialFast: {
    duration: M3_DURATION.short4,
    ease: M3_EASING.standard,
  } satisfies Transition,
  spatialDefault: {
    duration: M3_DURATION.medium2,
    ease: M3_EASING.emphasizedDecelerate,
  } satisfies Transition,
  spatialSlow: {
    duration: M3_DURATION.long2,
    ease: M3_EASING.emphasized,
  } satisfies Transition,
  effectsFast: {
    duration: M3_DURATION.short3,
    ease: M3_EASING.standard,
  } satisfies Transition,
  effectsDefault: {
    duration: M3_DURATION.short4,
    ease: M3_EASING.standard,
  } satisfies Transition,
  effectsSlow: {
    duration: M3_DURATION.medium2,
    ease: M3_EASING.standard,
  } satisfies Transition,
  press: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  } satisfies Transition,
  reduced: {
    duration: 0.01,
    ease: 'linear',
  } satisfies Transition,
} as const;

export type MotionTokenName = keyof typeof motionTokens;

/**
 * Returns the requested M3 transition token, automatically substituting
 * motionTokens.reduced if the user has requested reduced motion.
 */
export function useM3Transition(token: MotionTokenName): Transition {
  const shouldReduce = useReducedMotion();
  if (shouldReduce) {
    return motionTokens.reduced;
  }
  return motionTokens[token];
}
