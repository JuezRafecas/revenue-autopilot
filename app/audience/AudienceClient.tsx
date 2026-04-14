'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Label } from '@/components/ui/Label';
import { FilterBar, type FilterOption } from '@/components/ui/FilterBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { SegmentLedger } from '@/components/dashboard/SegmentLedger';
import { GuestList } from '@/components/guests/GuestList';
import { Numeral } from '@/components/ui/Numeral';
import { SEGMENT_CONFIG, SEGMENT_HEX, SEGMENT_ORDER } from '@/lib/constants';
import type { Segment, SegmentSummary } from '@/lib/types';
import type { GuestRow } from '@/lib/api';

type Scope = 'all' | Segment;

const VALID_SEGMENTS = new Set<string>(SEGMENT_ORDER);

export function AudienceClient({
  summaries,
  guests,
  totalGuests,
  pendingCount,
}: {
  summaries: SegmentSummary[];
  guests: GuestRow[];
  totalGuests: number;
  pendingCount?: number;
}) {
  const params = useSearchParams();
  const initial = params?.get('segment');
  const initialScope: Scope =
    initial && VALID_SEGMENTS.has(initial) ? (initial as Segment) : 'all';
  const [scope, setScope] = useState<Scope>(initialScope);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: guests.length };
    for (const g of guests) {
      map[g.segment] = (map[g.segment] ?? 0) + 1;
    }
    return map;
  }, [guests]);

  const filtered = useMemo(
    () => (scope === 'all' ? guests : guests.filter((g) => g.segment === scope)),
    [scope, guests]
  );

  const filterOptions: FilterOption[] = useMemo(() => {
    const base: FilterOption[] = [
      { value: 'all', label: 'All', count: counts.all },
    ];
    for (const s of SEGMENT_ORDER) {
      if (!counts[s]) continue;
      base.push({
        value: s,
        label: SEGMENT_CONFIG[s].label,
        count: counts[s],
        dot: SEGMENT_HEX[s],
      });
    }
    return base;
  }, [counts]);

  return (
    <AppShell pendingCount={pendingCount}>
      <Header title="Audience" subtitle="Guest base" />

      <section className="editorial-container section-pt-lead section-pb-close">
        <Label className="mb-3">Audience · Guest base</Label>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-10">
          <h1
            className="font-display text-[clamp(2.25rem,4.6vw,4.5rem)] leading-[0.95] text-fg max-w-[24ch]"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
          >
            <span className="italic">{totalGuests}</span> guests in the base.
          </h1>
          <div className="md:text-right shrink-0 md:pb-4 flex items-baseline gap-3 md:block">
            <div className="text-[10px] uppercase tracking-label text-fg-subtle">Total base</div>
            <div className="font-mono text-2xl md:text-3xl text-fg-muted tabular-nums md:mt-1">
              <Numeral value={totalGuests} /> contacts
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-container pb-16">
        <SegmentLedger summaries={summaries} />
      </section>

      <section className="editorial-container pb-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-3">
          <Label>Featured guests</Label>
          <span
            className="font-mono text-[10.5px] uppercase tabular-nums"
            style={{ letterSpacing: '0.14em', color: 'var(--fg-subtle)' }}
          >
            Showing <span style={{ color: 'var(--fg)' }}>{filtered.length}</span> / {guests.length}
          </span>
        </div>
        <div className="border-t border-hairline pt-3">
          <FilterBar
            label="Filter guests by segment"
            options={filterOptions}
            value={scope}
            onChange={(v) => setScope(v as Scope)}
          />
        </div>
      </section>

      <section className="editorial-container pb-24">
        {filtered.length === 0 ? (
          <div className="border-t border-hairline">
            <EmptyState
              title="No one in this segment."
              hint="Try another segment or wait for new guests to land in the base."
            />
          </div>
        ) : (
          <GuestList rows={filtered} />
        )}
      </section>
    </AppShell>
  );
}
