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
type SortKey = 'visits' | 'spent' | 'recent' | 'inactive';

const VALID_SEGMENTS = new Set<string>(SEGMENT_ORDER);

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'visits', label: 'Most visits' },
  { value: 'spent', label: 'Top spend' },
  { value: 'recent', label: 'Most recent' },
  { value: 'inactive', label: 'Most inactive' },
];

const MIN_VISITS_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 0, label: 'Any' },
  { value: 2, label: '2+' },
  { value: 5, label: '5+' },
  { value: 10, label: '10+' },
];

function sortGuests(rows: GuestRow[], sort: SortKey): GuestRow[] {
  const arr = [...rows];
  arr.sort((a, b) => {
    if (sort === 'visits') return b.total_visits - a.total_visits;
    if (sort === 'spent') return b.total_spent - a.total_spent;
    if (sort === 'recent') return a.days_since_last - b.days_since_last;
    return b.days_since_last - a.days_since_last;
  });
  return arr;
}

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
  const truncated = guests.length < totalGuests;
  const params = useSearchParams();
  const initial = params?.get('segment');
  const initialScope: Scope =
    initial && VALID_SEGMENTS.has(initial) ? (initial as Segment) : 'all';
  const [scope, setScope] = useState<Scope>(initialScope);
  const [sort, setSort] = useState<SortKey>('visits');
  const [minVisits, setMinVisits] = useState<number>(0);
  const [search, setSearch] = useState('');

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: guests.length };
    for (const g of guests) {
      map[g.segment] = (map[g.segment] ?? 0) + 1;
    }
    return map;
  }, [guests]);

  const filtered = useMemo(() => {
    let rows = scope === 'all' ? guests : guests.filter((g) => g.segment === scope);
    if (minVisits > 0) rows = rows.filter((g) => g.total_visits >= minVisits);
    const q = search.trim().toLowerCase();
    if (q) rows = rows.filter((g) => g.name.toLowerCase().includes(q));
    return sortGuests(rows, sort);
  }, [scope, guests, minVisits, search, sort]);

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
          <div className="shrink-0 md:pb-4">
            <div className="text-[10px] uppercase tracking-label text-fg-subtle md:text-right">Total base</div>
            <div className="font-mono text-2xl md:text-3xl text-fg-muted tabular-nums mt-1 md:text-right">
              <Numeral value={totalGuests} /> contacts
            </div>
            {/* Segment mini-bar */}
            <div className="flex gap-[2px] mt-3 h-[6px] rounded-full overflow-hidden" style={{ width: '180px' }}>
              {SEGMENT_ORDER.map((seg) => {
                const count = counts[seg] ?? 0;
                if (!count) return null;
                const pct = (count / guests.length) * 100;
                return (
                  <div
                    key={seg}
                    className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                    style={{
                      width: `${Math.max(pct, 3)}%`,
                      backgroundColor: SEGMENT_HEX[seg],
                      opacity: scope === 'all' || scope === seg ? 1 : 0.25,
                    }}
                    title={`${SEGMENT_CONFIG[seg].label}: ${count}`}
                  />
                );
              })}
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
            className="font-mono text-[11px] uppercase tabular-nums inline-flex items-center gap-2"
            style={{ letterSpacing: '0.14em', color: 'var(--fg-subtle)' }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: filtered.length > 0 ? 'var(--k-green, #0e5e48)' : 'var(--fg-faint)' }}
            />
            Showing <span style={{ color: 'var(--fg)', fontWeight: 600 }}>{filtered.length}</span> /{' '}
            {guests.length}
            {truncated && (
              <>
                {' '}of <span style={{ color: 'var(--fg)' }}>{totalGuests}</span> in base
              </>
            )}
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

        <div
          className="mt-4 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 px-4 py-3 rounded-sm"
          style={{ background: 'var(--bg-sunken)', border: '1px solid var(--hairline)' }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] uppercase tracking-label font-semibold"
              style={{ color: 'var(--fg-subtle)', letterSpacing: '0.16em' }}
            >
              Sort
            </span>
            {SORT_OPTIONS.map((opt) => {
              const active = sort === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSort(opt.value)}
                  className="font-mono text-[10px] uppercase px-2.5 py-1.5 transition-all duration-150 rounded-sm"
                  style={{
                    letterSpacing: '0.12em',
                    color: active ? 'var(--fg)' : 'var(--fg-subtle)',
                    border: '1px solid',
                    borderColor: active ? 'var(--fg)' : 'transparent',
                    background: active ? 'var(--bg-raised)' : 'transparent',
                    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="hidden md:block w-px h-5" style={{ background: 'var(--hairline-strong)' }} />

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] uppercase tracking-label font-semibold"
              style={{ color: 'var(--fg-subtle)', letterSpacing: '0.16em' }}
            >
              Visits
            </span>
            {MIN_VISITS_OPTIONS.map((opt) => {
              const active = minVisits === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMinVisits(opt.value)}
                  className="font-mono text-[10px] uppercase px-2.5 py-1.5 transition-all duration-150 rounded-sm"
                  style={{
                    letterSpacing: '0.12em',
                    color: active ? 'var(--fg)' : 'var(--fg-subtle)',
                    border: '1px solid',
                    borderColor: active ? 'var(--fg)' : 'transparent',
                    background: active ? 'var(--bg-raised)' : 'transparent',
                    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="hidden md:block w-px h-5" style={{ background: 'var(--hairline-strong)' }} />

          <div className="flex-1 md:max-w-[280px]">
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="var(--fg-faint)" strokeWidth="2" strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name…"
                aria-label="Search guests by name"
                className="w-full bg-bg-raised pl-8 pr-3 py-2 text-[12px] rounded-sm focus:outline-none transition-shadow duration-150"
                style={{
                  fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
                  color: 'var(--fg)',
                  border: '1px solid var(--hairline)',
                  letterSpacing: '-0.005em',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-container pb-24">
        {filtered.length === 0 ? (
          <div className="border-t border-hairline">
            <EmptyState
              title="No one matches these filters."
              hint="Loosen the filters or try a different segment."
            />
          </div>
        ) : (
          <GuestList rows={filtered} />
        )}
      </section>
    </AppShell>
  );
}
