'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { SEGMENT_CONFIG, SEGMENT_HEX, formatARS } from '@/lib/constants';
import type { SegmentSummary } from '@/lib/types';
import { Numeral } from '@/components/ui/Numeral';
import { cn } from '@/lib/cn';

const TREND_GLYPH = {
  up: '↗',
  down: '↘',
  stable: '→',
} as const;

const TREND_COLOR = {
  up: 'text-segment-active',
  down: 'text-segment-dormant',
  stable: 'text-fg-subtle',
} as const;

export function SegmentRow({
  summary,
  index,
}: {
  summary: SegmentSummary;
  index: number;
}) {
  const cfg = SEGMENT_CONFIG[summary.segment];
  const hex = SEGMENT_HEX[summary.segment];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/segments/${summary.segment}` as const}
        className="group relative block border-b border-hairline transition-colors duration-200 hover:bg-bg-raised"
      >
        {/* Accent bar */}
        <span
          className="absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-200 group-hover:w-[6px]"
          style={{ backgroundColor: hex }}
          aria-hidden
        />

        <div className="grid grid-cols-[minmax(0,1fr)_110px_80px_180px_auto] items-center gap-8 pl-8 pr-6 py-8">
          <div className="min-w-0">
            <h3
              className="font-display text-2xl md:text-[28px] leading-tight text-fg"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              {cfg.label}
            </h3>
            <p
              className="mt-1 font-display italic text-[13px] text-fg-muted max-w-[48ch] leading-snug"
              style={{ fontVariationSettings: '"opsz" 14' }}
            >
              {cfg.description}
            </p>
          </div>

          <div className="text-right">
            <div className="font-mono text-[28px] tabular-nums text-fg">
              <Numeral value={summary.count} />
            </div>
            <div className="text-[10px] uppercase tracking-label text-fg-subtle mt-1">
              comensales
            </div>
          </div>

          <div className="text-right">
            <div className="font-mono text-[13px] text-fg-muted tabular-nums">
              {summary.percentage.toFixed(1)}%
            </div>
            <div className={cn('text-base mt-1 font-mono', TREND_COLOR[summary.trend])}>
              {TREND_GLYPH[summary.trend]}
            </div>
          </div>

          <div className="text-right">
            <div className="font-mono text-[14px] text-accent tabular-nums">
              {formatARS(summary.revenue_opportunity)}
            </div>
            <div className="text-[10px] uppercase tracking-label text-fg-subtle mt-1">
              oportunidad
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] uppercase tracking-[0.12em] text-fg-muted group-hover:text-accent transition-colors">
              {cfg.cta} &nbsp;→
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
