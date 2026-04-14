import { cn } from '@/lib/cn';
import { SEGMENT_CONFIG, SEGMENT_HEX } from '@/lib/constants';
import type { Segment } from '@/lib/types';

export function SegmentBadge({
  segment,
  className,
}: {
  segment: Segment;
  className?: string;
}) {
  const cfg = SEGMENT_CONFIG[segment];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 border border-hairline px-2.5 py-1 text-[10px] uppercase tracking-label text-fg-muted font-sans',
        className
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: SEGMENT_HEX[segment] }}
      />
      {cfg.label}
    </span>
  );
}

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center border border-hairline px-2.5 py-1 text-[10px] uppercase tracking-label text-fg-muted font-sans',
        className
      )}
    >
      {children}
    </span>
  );
}
