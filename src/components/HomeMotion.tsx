'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { m3Transition } from '@/lib/motion';

export function HeroLineReveal({
  children,
  index = 0,
  className,
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  const reduced = useReducedMotion() !== false;
  const transition = m3Transition('spatialDefault', reduced);

  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? transition : { ...transition, delay: index * 0.08 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function TariffCardReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion() !== false;
  const transition = m3Transition('spatialDefault', reduced);

  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduced ? transition : { ...transition, delay: 0.12 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ProcessRowReveal({
  children,
  index = 0,
  className,
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  const reduced = useReducedMotion() !== false;
  const transition = m3Transition('spatialDefault', reduced);

  return (
    <motion.li
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={reduced ? transition : { ...transition, delay: index * 0.06 }}
      className={className}
    >
      {children}
    </motion.li>
  );
}
