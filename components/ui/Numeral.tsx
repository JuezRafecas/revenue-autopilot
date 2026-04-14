'use client';

import { cn } from '@/lib/cn';
import { animate, useMotionValue, useTransform } from 'framer-motion';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'display';

const SIZE: Record<Size, string> = {
  xs: 'text-[11px]',
  sm: 'text-[13px]',
  md: 'text-base',
  lg: 'text-2xl',
  xl: 'text-4xl',
  display: 'text-[clamp(4rem,9vw,8rem)] leading-none',
};

interface Props {
  value: number;
  size?: Size;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  animated?: boolean;
  className?: string;
  format?: 'plain' | 'ars' | 'compact';
}

function formatValue(v: number, format: Props['format'], decimals: number, prefix = '', suffix = ''): string {
  let s: string;
  if (format === 'ars') {
    s = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(Math.round(v));
  } else if (format === 'compact') {
    s = new Intl.NumberFormat('es-AR', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(v);
  } else {
    s = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(v);
  }
  return `${prefix}${s}${suffix}`;
}

export function Numeral({
  value,
  size = 'md',
  prefix,
  suffix,
  decimals = 0,
  animated = false,
  className,
  format = 'plain',
}: Props) {
  const mv = useMotionValue(animated ? 0 : value);
  const [display, setDisplay] = useState(() =>
    formatValue(animated ? 0 : value, format, decimals, prefix, suffix)
  );

  useEffect(() => {
    if (!animated) {
      setDisplay(formatValue(value, format, decimals, prefix, suffix));
      return;
    }
    const controls = animate(mv, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(formatValue(v, format, decimals, prefix, suffix)),
    });
    return () => controls.stop();
  }, [value, animated, decimals, prefix, suffix, format, mv]);

  return (
    <motion.span
      className={cn('font-mono tabular-nums', SIZE[size], className)}
    >
      {display}
    </motion.span>
  );
}
