'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { m3Transition } from '@/lib/motion';

export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion() === true;
  const transition = m3Transition('effectsDefault', reduced);

  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 1 } : { opacity: 0, y: -8 }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
