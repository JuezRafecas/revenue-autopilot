'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

const DEFAULT_DURATION_MS = 1500;

interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Animates from 0 → value when the element enters the viewport.
 * Tabular-nums on .k-count-up prevents layout jitter. Reduced-motion
 * short-circuits to the final value immediately.
 */
export function CountUp({
  value,
  prefix = '',
  suffix = '',
  durationMs = DEFAULT_DURATION_MS,
  className = '',
  style,
}: CountUpProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [display, setDisplay] = useState(reducedMotion ? value : 0);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      return;
    }
    if (!inView) return;

    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      // Ease-out cubic for a natural settle
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, durationMs, reducedMotion]);

  return (
    <span ref={ref} className={`k-count-up ${className}`.trim()} style={style}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
