import Link from 'next/link';
import { SEGMENT_HEX } from '@/lib/constants';
import type { Segment } from '@/lib/types';
import { Numeral } from '@/components/ui/Numeral';

interface Props {
  id: string;
  name: string;
  segment: Segment;
  total_visits: number;
  days_since_last: number;
}

export function GuestCard({ id, name, segment, total_visits, days_since_last }: Props) {
  return (
    <Link
      href={`/audience/${id}` as const}
      className="group flex items-center gap-4 py-4 border-b border-hairline hover:bg-bg-raised transition-colors duration-150"
    >
      <span
        className="h-2.5 w-2.5 rounded-full shrink-0"
        style={{ backgroundColor: SEGMENT_HEX[segment] }}
      />
      <div
        className="flex-1 font-display text-base text-fg truncate"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {name}
      </div>
      <div className="font-mono text-[12px] text-fg-muted tabular-nums shrink-0">
        <Numeral value={total_visits} /> vis
      </div>
      <div className="font-mono text-[12px] text-fg-subtle tabular-nums shrink-0 w-12 text-right">
        {days_since_last}d
      </div>
    </Link>
  );
}
