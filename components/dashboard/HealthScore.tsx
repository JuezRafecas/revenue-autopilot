'use client';

import { motion } from 'framer-motion';
import { Label } from '@/components/ui/Label';
import { Numeral } from '@/components/ui/Numeral';

interface Props {
  score: number;
  activeCount: number;
  totalCount: number;
  diagnosis: string;
}

export function HealthScore({ score, activeCount, totalCount, diagnosis }: Props) {
  const arcColor =
    score >= 40 ? '#8FAE8B' : score >= 20 ? '#D4A574' : '#C86A52';

  const circumference = 2 * Math.PI * 88;
  const offset = circumference - (score / 100) * circumference;

  return (
    <section className="flex flex-col">
      <Label className="mb-6">Diagnóstico · Salud de la Base</Label>

      <div className="relative flex items-start gap-8">
        {/* Arc */}
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="shrink-0 -rotate-90"
          aria-hidden
        >
          <circle
            cx="100"
            cy="100"
            r="88"
            stroke="var(--hairline)"
            strokeWidth="1"
            fill="none"
          />
          <motion.circle
            cx="100"
            cy="100"
            r="88"
            stroke={arcColor}
            strokeWidth="1.5"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            strokeLinecap="butt"
          />
        </svg>

        {/* Massive typographic score */}
        <div className="flex flex-col">
          <div
            className="font-display text-[clamp(5rem,10vw,9rem)] leading-[0.85] text-fg tabular-nums"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 20' }}
          >
            <Numeral value={score} animated decimals={1} size="display" className="font-display not-italic" />
            <span className="text-fg-subtle text-[0.4em] align-top ml-2">%</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-fg-muted font-mono text-[12px]">
            <Numeral value={activeCount} /> <span className="text-fg-faint">/</span>{' '}
            <Numeral value={totalCount} />{' '}
            <span className="text-fg-subtle uppercase tracking-label text-[10px]">
              comensales activos
            </span>
          </div>
        </div>
      </div>

      <p
        className="mt-10 font-display italic text-fg-muted text-xl md:text-2xl max-w-[26ch] leading-snug"
        style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
      >
        {diagnosis}
      </p>
    </section>
  );
}
