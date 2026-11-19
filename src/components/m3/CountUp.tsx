'use client';

import * as React from 'react';
import { animate, useReducedMotion } from 'framer-motion';

export function CountUp({
  value,
  from = 0,
  duration = 0.6,
  formatter = (n) => String(Math.round(n)),
  className,
}: {
  value: number;
  from?: number;
  duration?: number;
  formatter?: (n: number) => string;
  className?: string;
}) {
  const reduced = useReducedMotion() !== false;
  const [display, setDisplay] = React.useState(() => formatter(reduced ? value : from));
  const prevRef = React.useRef(from);

  React.useEffect(() => {
    if (reduced) {
      setDisplay(formatter(value));
      prevRef.current = value;
      return;
    }
    const start = prevRef.current;
    const controls = animate(start, value, {
      duration,
      ease: [0.34, 0.80, 0.34, 1.0],
      onUpdate: (latest) => setDisplay(formatter(latest)),
    });
    prevRef.current = value;
    return () => controls.stop();
  }, [value, duration, reduced, formatter]);

  return <span className={className}>{display}</span>;
}
