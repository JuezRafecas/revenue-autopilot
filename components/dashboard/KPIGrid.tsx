import { Numeral } from '@/components/ui/Numeral';
import { Sparkline } from '@/components/ui/Sparkline';

interface KPI {
  label: string;
  value: number;
  format?: 'plain' | 'ars' | 'percent' | 'compact';
  delta?: number;
  animated?: boolean;
  sparkline?: number[];
}

export function KPIGrid({ kpis }: { kpis: KPI[] }) {
  return (
    <div
      className="kpi-grid grid grid-cols-2 lg:grid-cols-4"
      style={{
        borderTop: '1.5px solid var(--hairline-strong)',
        borderBottom: '1.5px solid var(--hairline-strong)',
      }}
    >
      {kpis.map((k) => {
        const isAnchor = k.format === 'ars';
        return (
          <div
            key={k.label}
            className="kpi-cell relative px-6 py-7 md:px-8 md:py-8"
          >
            <div
              className="mb-3 text-[10.5px] uppercase font-[600]"
              style={{
                letterSpacing: '0.18em',
                color: isAnchor ? 'var(--accent-dim)' : 'var(--k-green, #0e5e48)',
                fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
              }}
            >
              {k.label}
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <KPIValue kpi={k} isAnchor={isAnchor} />
            </div>
            {(k.sparkline || (k.delta != null && k.delta !== 0)) && (
              <div className="mt-4 flex items-center gap-2.5 min-h-[18px]">
                {k.sparkline && k.sparkline.length > 1 && (
                  <Sparkline
                    data={k.sparkline}
                    width={96}
                    height={16}
                    color={isAnchor ? 'var(--accent)' : 'var(--k-green, #0e5e48)'}
                    ariaLabel={`${k.label} trend over the last 30 days`}
                  />
                )}
                {k.delta != null && k.delta !== 0 && <DeltaChip delta={k.delta} />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function KPIValue({ kpi, isAnchor }: { kpi: KPI; isAnchor: boolean }) {
  const displayFont = 'var(--font-kaszek-display), "Archivo Black", system-ui, sans-serif';
  const color = isAnchor ? 'var(--accent)' : 'var(--fg)';

  if (kpi.format === 'percent') {
    return (
      <span
        className="tabular-nums"
        style={{
          fontFamily: displayFont,
          fontWeight: 800,
          fontSize: 'clamp(1.8rem, 2.6vw, 2.4rem)',
          letterSpacing: '-0.035em',
          color,
          lineHeight: 1,
        }}
      >
        <Numeral value={kpi.value} decimals={1} animated={kpi.animated} />
        <span
          className="align-top ml-0.5"
          style={{ fontSize: '0.42em', color: 'var(--fg-subtle)' }}
        >
          %
        </span>
      </span>
    );
  }
  if (kpi.format === 'ars') {
    return (
      <span
        className="tabular-nums"
        style={{
          fontFamily: displayFont,
          fontWeight: 800,
          fontSize: 'clamp(1.8rem, 2.8vw, 2.6rem)',
          letterSpacing: '-0.04em',
          color,
          lineHeight: 1,
        }}
      >
        <Numeral value={kpi.value} format="ars" animated={kpi.animated} />
      </span>
    );
  }
  return (
    <span
      className="tabular-nums"
      style={{
        fontFamily: displayFont,
        fontWeight: 800,
        fontSize: 'clamp(1.8rem, 2.6vw, 2.4rem)',
        letterSpacing: '-0.035em',
        color,
        lineHeight: 1,
      }}
    >
      <Numeral value={kpi.value} animated={kpi.animated} />
    </span>
  );
}

function DeltaChip({ delta }: { delta: number }) {
  const positive = delta > 0;
  return (
    <span
      className="font-mono text-[10px] tabular-nums px-1.5 py-0.5 animate-[fade-up_.6s_cubic-bezier(0.2,0.7,0.2,1)_.3s_both]"
      style={{
        letterSpacing: '0.04em',
        border: '1px solid var(--hairline-strong)',
        background: 'var(--bg-raised)',
        color: positive ? 'var(--k-green, #0e5e48)' : 'var(--accent-dim)',
      }}
      aria-label={`${positive ? 'Up' : 'Down'} ${Math.abs(delta).toFixed(1)} percent versus last week`}
    >
      <span aria-hidden>{positive ? '↗' : '↘'}</span> {Math.abs(delta).toFixed(1)}%
      <span className="ml-1 opacity-60" aria-hidden>vs 7d</span>
    </span>
  );
}
