import { Numeral } from '@/components/ui/Numeral';

interface Props {
  sent: number;
  secondVisits: number;
  revenue: number;
}

/**
 * Always-on horizontal strip for use case #1 (Post-visit).
 * Minimal presence: declares that the system runs on its own.
 */
export function PostVisitaStrip({ sent, secondVisits, revenue }: Props) {
  return (
    <section
      aria-label="Post-visit always-on"
      className="editorial-container"
    >
      <div
        className="flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center gap-5 md:gap-10 px-5 md:px-8 py-5"
        style={{
          borderTop: '1px solid var(--hairline)',
          borderBottom: '1px solid var(--hairline)',
          background: 'var(--bg-sunken)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            aria-hidden
            className="k-pulse inline-block shrink-0"
            style={{
              width: 8,
              height: 8,
              background: 'var(--k-green, #0e5e48)',
              borderRadius: 999,
            }}
          />
          <div className="min-w-0">
            <div
              className="text-[10px] uppercase font-[600] truncate"
              style={{
                letterSpacing: '0.18em',
                color: 'var(--k-green, #0e5e48)',
                fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
              }}
            >
              Post-visit · Always-on
            </div>
            <div
              className="k-italic-serif truncate"
              style={{ color: 'var(--fg-muted)', fontSize: 13 }}
            >
              running without you touching a thing.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 md:contents">
          <StripStat label="Sent" value={sent} />
          <StripStat label="Second visits" value={secondVisits} />
          <StripStat label="Revenue" value={revenue} format="ars" accent />
        </div>
      </div>
    </section>
  );
}

function StripStat({
  label,
  value,
  format = 'plain',
  accent = false,
}: {
  label: string;
  value: number;
  format?: 'plain' | 'ars';
  accent?: boolean;
}) {
  return (
    <div className="text-right">
      <div
        className="tabular-nums"
        style={{
          fontFamily: 'var(--font-kaszek-display), "Archivo Black", system-ui, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(1.05rem, 1.6vw, 1.35rem)',
          letterSpacing: '-0.03em',
          color: accent ? 'var(--accent)' : 'var(--fg)',
          lineHeight: 1,
        }}
      >
        <Numeral value={value} format={format} />
      </div>
      <div
        className="text-[9.5px] uppercase mt-1"
        style={{ letterSpacing: '0.16em', color: 'var(--fg-subtle)' }}
      >
        {label}
      </div>
    </div>
  );
}
