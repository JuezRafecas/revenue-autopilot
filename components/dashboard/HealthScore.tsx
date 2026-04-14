'use client';

import { Numeral } from '@/components/ui/Numeral';
import { Sparkline } from '@/components/ui/Sparkline';

interface Props {
  score: number;
  activeCount: number;
  totalCount: number;
  diagnosis: string;
  series?: number[];
}

export function HealthScore({ score, activeCount, totalCount, diagnosis, series }: Props) {
  const severity = score < 25 ? 'critical' : score < 50 ? 'at risk' : 'stable';

  return (
    <section className="flex flex-col">
      <div
        className="mb-6 text-[10.5px] uppercase font-[600]"
        style={{
          letterSpacing: '0.18em',
          color: 'var(--k-green, #0e5e48)',
          fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
        }}
      >
        Diagnosis · Base health
      </div>

      <div className="flex flex-col">
        <div className="flex items-start">
          <span
            className="tabular-nums"
            style={{
              fontFamily: 'var(--font-kaszek-display), "Archivo Black", system-ui, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(4.6rem, 9.5vw, 7.6rem)',
              letterSpacing: '-0.055em',
              color: 'var(--fg)',
              lineHeight: 0.85,
            }}
          >
            <Numeral value={score} animated decimals={1} />
          </span>
          <span
            className="ml-2 mt-2 font-[600]"
            style={{
              fontSize: '1.4rem',
              color: 'var(--fg-subtle)',
            }}
          >
            %
          </span>
        </div>

        {series && series.length > 1 && (
          <div className="mt-6 flex items-center gap-3">
            <span
              className="font-mono text-[9px] tabular-nums"
              style={{ color: 'var(--fg-faint)', letterSpacing: '0.08em' }}
              aria-hidden
            >
              0
            </span>
            <Sparkline
              data={series}
              width={200}
              height={28}
              strokeWidth={1.5}
              color="var(--accent)"
              ariaLabel="Base health trend over the last 30 days"
            />
            <span
              className="font-mono text-[9px] tabular-nums"
              style={{ color: 'var(--fg-faint)', letterSpacing: '0.08em' }}
              aria-hidden
            >
              100
            </span>
          </div>
        )}

        <div
          className="mt-5 flex items-center gap-2 font-mono text-[11px]"
          style={{ color: 'var(--fg-muted)', letterSpacing: '0.06em' }}
        >
          <Numeral value={activeCount} />
          <span style={{ color: 'var(--fg-faint)' }}>/</span>
          <Numeral value={totalCount} />
          <span
            className="uppercase text-[10px] ml-1"
            style={{ letterSpacing: '0.16em', color: 'var(--fg-subtle)' }}
          >
            active guests
          </span>
        </div>
        <span
          className="k-event-pill mt-5 self-start"
          style={{ textTransform: 'uppercase' }}
        >
          Health {severity}
        </span>
      </div>

      <p
        className="mt-8 k-italic-serif leading-snug"
        style={{
          fontSize: 'clamp(1.05rem, 1.4vw, 1.3rem)',
          color: 'var(--fg-muted)',
          maxWidth: '28ch',
        }}
      >
        {diagnosis}
      </p>
    </section>
  );
}
