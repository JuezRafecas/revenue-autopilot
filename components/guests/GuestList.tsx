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

export function GuestList({ rows }: { rows: Row[] }) {
  return (
    <div className="border-t border-hairline">
      <header className="grid grid-cols-[minmax(0,2fr)_140px_100px_110px_80px_140px] gap-6 pl-6 pr-6 py-3 border-b border-hairline">
        <Label>Comensal</Label>
        <Label>Segmento</Label>
        <Label className="text-right">Visitas</Label>
        <Label className="text-right">Última</Label>
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
            href={`/guest/${row.id}` as const}
            className="grid grid-cols-[minmax(0,2fr)_140px_100px_110px_80px_140px] gap-6 pl-6 pr-6 py-5 border-b border-hairline hover:bg-bg-raised transition-colors duration-150 items-center"
          >
            <div
              className="font-display text-lg text-fg truncate"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
            >
              {row.name}
            </div>
            <div>
              <SegmentBadge segment={row.segment} />
            </div>
            <div className="text-right font-mono text-[13px] text-fg tabular-nums">
              <Numeral value={row.total_visits} />
            </div>
            <div className="text-right font-mono text-[13px] text-fg-muted tabular-nums">
              {row.days_since_last === 0 ? '—' : `${row.days_since_last}d`}
            </div>
            <div className="text-right font-mono text-[13px] text-fg-muted tabular-nums">
              {row.avg_score != null ? row.avg_score.toFixed(1) : '—'}
            </div>
            <div className="text-right font-mono text-[13px] text-accent tabular-nums">
              <Numeral value={row.total_spent} format="ars" />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
