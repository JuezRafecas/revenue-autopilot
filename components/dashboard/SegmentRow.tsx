'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { SEGMENT_CONFIG, formatARS } from '@/lib/constants';
import type { SegmentSummary } from '@/lib/types';
import { Numeral } from '@/components/ui/Numeral';

const TREND_GLYPH = {
  up: '↗',
  down: '↘',
  stable: '→',
} as const;

const TREND_COLOR = {
  up: 'var(--k-green, #0e5e48)',
  down: 'var(--accent)',
  stable: 'var(--fg-subtle)',
} as const;

export function SegmentRow({
  summary,
  index,
}: {
  summary: SegmentSummary;
  index: number;
}) {
  const cfg = SEGMENT_CONFIG[summary.segment];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12 + index * 0.05, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <Link
        href={`/audience?segment=${summary.segment}` as const}
        className="group relative block transition-colors duration-200 hover:bg-bg-sunken"
        style={{ borderBottom: '1px solid var(--hairline)' }}
      >
        {/* Accent bar: expands on hover */}
        <span
          aria-hidden
          className="absolute left-0 top-0 bottom-0 transition-[width] duration-200 group-hover:w-[6px] w-[3px]"
          style={{ backgroundColor: `var(--segment-${summary.segment})` }}
        />

        <div className="grid grid-cols-[minmax(0,1fr)_110px_80px_180px_auto] items-center gap-8 pl-8 pr-6 py-7">
          <div className="min-w-0">
            <h3
              style={{
                fontFamily: 'var(--font-kaszek-display), "Archivo Black", system-ui, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.25rem, 1.7vw, 1.6rem)',
                letterSpacing: '-0.035em',
                color: 'var(--fg)',
                lineHeight: 1.05,
              }}
            >
              {cfg.label}
            </h3>
            <p
              className="k-italic-serif mt-1.5 leading-snug"
              style={{
                fontSize: '13.5px',
                color: 'var(--fg-muted)',
                maxWidth: '52ch',
              }}
            >
              {cfg.description}
            </p>
          </div>

          <div className="text-right">
            <div
              className="font-mono tabular-nums"
              style={{
                fontSize: '26px',
                color: 'var(--fg)',
                letterSpacing: '-0.01em',
              }}
            >
              <Numeral value={summary.count} />
            </div>
            <div
              className="text-[9.5px] uppercase mt-0.5"
              style={{ letterSpacing: '0.16em', color: 'var(--fg-subtle)' }}
            >
              guests
            </div>
          </div>

          <div className="text-right">
            <div
              className="font-mono text-[12px] tabular-nums"
              style={{ color: 'var(--fg-muted)' }}
            >
              {summary.percentage.toFixed(1)}%
            </div>
            <div
              className="font-mono text-base mt-0.5"
              style={{ color: TREND_COLOR[summary.trend] }}
            >
              {TREND_GLYPH[summary.trend]}
            </div>
          </div>

          <div className="text-right">
            <div
              className="font-mono tabular-nums"
              style={{
                fontSize: '16px',
                color: 'var(--accent)',
                fontWeight: 600,
              }}
            >
              {formatARS(summary.revenue_opportunity)}
            </div>
            <div
              className="text-[9.5px] uppercase mt-0.5"
              style={{ letterSpacing: '0.16em', color: 'var(--fg-subtle)' }}
            >
              opportunity
            </div>
          </div>

          <div className="text-right">
            <span
              className="inline-flex items-center gap-1.5 text-[10.5px] uppercase font-[600] px-3 py-1.5 transition-colors group-hover:bg-[var(--k-green)] group-hover:text-[var(--bg)] group-hover:border-[var(--k-green)]"
              style={{
                letterSpacing: '0.16em',
                border: '1px solid var(--fg)',
                color: 'var(--fg)',
                background: 'transparent',
                fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
              }}
            >
              {cfg.cta} <span className="tabular-nums opacity-70">({summary.count})</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
