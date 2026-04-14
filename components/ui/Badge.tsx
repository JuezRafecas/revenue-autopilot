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
  const hex = SEGMENT_HEX[segment];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-1 text-[10px] uppercase tracking-label font-sans font-medium',
        className
      )}
      style={{
        backgroundColor: `${hex}18`,
        border: `1px solid ${hex}30`,
        color: 'var(--fg-muted)',
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: hex }}
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
