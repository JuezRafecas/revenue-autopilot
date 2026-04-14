import { SegmentRow } from './SegmentRow';
import type { SegmentSummary } from '@/lib/types';
import { SEGMENT_ORDER } from '@/lib/constants';

export function SegmentLedger({ summaries }: { summaries: SegmentSummary[] }) {
  const ordered = SEGMENT_ORDER
    .map((seg) => summaries.find((s) => s.segment === seg))
    .filter((s): s is SegmentSummary => Boolean(s));

  return (
    <section style={{ borderTop: '1.5px solid var(--hairline-strong)' }}>
      <header
        className="grid grid-cols-[minmax(0,1fr)_110px_80px_180px_auto] items-end gap-8 pl-8 pr-6 pt-5 pb-3"
        style={{ borderBottom: '1px solid var(--hairline)' }}
      >
        <LedgerLabel>Segment</LedgerLabel>
        <LedgerLabel align="right">Volume</LedgerLabel>
        <LedgerLabel align="right">Trend</LedgerLabel>
        <LedgerLabel align="right">Opportunity</LedgerLabel>
        <LedgerLabel align="right">Action</LedgerLabel>
      </header>
      <div>
        {ordered.map((summary, i) => (
          <SegmentRow key={summary.segment} summary={summary} index={i} />
        ))}
      </div>
    </section>
  );
}

function LedgerLabel({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <span
      className="text-[10px] uppercase font-[600]"
      style={{
        letterSpacing: '0.18em',
        color: 'var(--k-green, #0e5e48)',
        fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
        textAlign: align,
      }}
    >
      {children}
    </span>
  );
}
