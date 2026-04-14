'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { SegmentBadge } from '@/components/ui/Badge';
import { Label } from '@/components/ui/Label';
import { Numeral } from '@/components/ui/Numeral';
import type { Segment } from '@/lib/types';

interface Row {
  id: string;
  name: string;
  segment: Segment;
  total_visits: number;
  days_since_last: number;
  avg_score: number | null;
  total_spent: number;
}

const GRID_COLS = 'grid-cols-[minmax(0,2fr)_140px_100px_110px_80px_140px]';

export function GuestList({ rows }: { rows: Row[] }) {
  return (
    <div className="border-t border-hairline">
      <header className={`hidden md:grid ${GRID_COLS} gap-6 pl-6 pr-6 py-3 border-b border-hairline`}>
        <Label>Guest</Label>
        <Label>Segment</Label>
        <Label className="text-right">Visits</Label>
        <Label className="text-right">Last</Label>
        <Label className="text-right">Score</Label>
        <Label className="text-right">Total</Label>
      </header>
      {rows.map((row, i) => (
        <motion.div
          key={row.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.04 * i }}
        >
          <Link
            href={`/audience/${row.id}` as const}
            className={`block md:grid ${GRID_COLS} md:gap-6 md:items-center pl-5 pr-5 md:pl-6 md:pr-6 py-4 md:py-5 border-b border-hairline hover:bg-bg-raised transition-colors duration-150`}
          >
            {/* Name + mobile inline segment */}
            <div className="flex items-start justify-between gap-3 md:block">
              <div
                className="font-display text-lg text-fg truncate min-w-0"
                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
              >
                {row.name}
              </div>
              <div className="md:hidden shrink-0">
                <SegmentBadge segment={row.segment} />
              </div>
            </div>

            <div className="hidden md:block">
              <SegmentBadge segment={row.segment} />
            </div>

            {/* Mobile: compact 3-metric strip */}
            <div className="md:hidden mt-3 grid grid-cols-3 gap-3 text-[11px] font-mono tabular-nums">
              <MobileMetric label="Visits" value={row.total_visits} />
              <MobileMetric
                label="Last"
                value={row.days_since_last === 0 ? '—' : `${row.days_since_last}d`}
                muted
              />
              <MobileMetric
                label="Total"
                value={<Numeral value={row.total_spent} format="ars" />}
                accent
                align="right"
              />
            </div>

            <div className="hidden md:block text-right font-mono text-[13px] text-fg tabular-nums">
              <Numeral value={row.total_visits} />
            </div>
            <div className="hidden md:block text-right font-mono text-[13px] text-fg-muted tabular-nums">
              {row.days_since_last === 0 ? '—' : `${row.days_since_last}d`}
            </div>
            <div className="hidden md:block text-right font-mono text-[13px] text-fg-muted tabular-nums">
              {row.avg_score != null ? row.avg_score.toFixed(1) : '—'}
            </div>
            <div className="hidden md:block text-right font-mono text-[13px] text-accent tabular-nums font-semibold">
              <Numeral value={row.total_spent} format="ars" />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

function MobileMetric({
  label,
  value,
  muted,
  accent,
  align = 'left',
}: {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
  accent?: boolean;
  align?: 'left' | 'right';
}) {
  return (
    <div className={align === 'right' ? 'text-right' : ''}>
      <div className="text-[9px] uppercase tracking-label text-fg-subtle mb-0.5">{label}</div>
      <div
        className={
          accent
            ? 'text-accent font-semibold'
            : muted
              ? 'text-fg-muted'
              : 'text-fg'
        }
      >
        {value}
      </div>
    </div>
  );
}
