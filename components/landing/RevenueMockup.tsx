import { formatARS, formatNumber } from '@/lib/constants';
import { SectionHeader } from './SectionHeader';
import { REVENUE_MOCKUP, SECTION_HEADERS } from './copy';

export function RevenueMockupSection() {
  const maxRevenue = Math.max(...REVENUE_MOCKUP.lines.map((l) => l.revenue));

  return (
    <section
      id="impacto"
      className="k-section k-section-hairline editorial-container"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-14 lg:gap-20 items-start">
        <div>
          <SectionHeader
            eyebrow={SECTION_HEADERS.impacto.eyebrow}
            title={SECTION_HEADERS.impacto.title}
            lead={SECTION_HEADERS.impacto.lead}
          />
        </div>

        <div
          data-reveal="true"
          data-reveal-delay="3"
          className="k-card-brutal p-10 md:p-12"
          style={{ background: '#ffffff' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span
              aria-hidden
              className="inline-block h-3 w-3"
              style={{ background: '#e6784c', boxShadow: '0 0 0 2px #151411' }}
            />
            <span className="k-mono text-[10px] uppercase tracking-[0.18em] text-[#8a8782]">
              {REVENUE_MOCKUP.month} · La Cabrera
            </span>
          </div>

          <div
            className="k-display k-count-up mb-2"
            style={{
              fontSize: 'clamp(3.5rem, 7vw, 6rem)',
              lineHeight: 0.86,
              letterSpacing: '-0.045em',
              color: '#e6784c',
              WebkitTextStroke: '2.5px #151411',
            }}
          >
            {formatARS(REVENUE_MOCKUP.total)}
          </div>
          <div className="k-label text-[#0e5e48] mb-10">
            Incremental revenue that wouldn&rsquo;t exist without the system
          </div>

          <div className="flex flex-col gap-8 pt-8 border-t border-[#e4dfd2]">
            {REVENUE_MOCKUP.lines.map((line, i) => {
              const scale = line.revenue / maxRevenue;
              return (
                <div
                  key={line.label}
                  data-reveal="true"
                  data-reveal-delay={String(Math.min(i + 4, 6))}
                  className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-end"
                >
                  <div>
                    <div className="k-display-md mb-2" style={{ fontSize: 20 }}>
                      {line.label}
                    </div>
                    <div className="k-bar-track mb-2">
                      <div
                        className="k-bar-fill"
                        data-in-view="true"
                        style={
                          {
                            background: line.accent,
                            ['--k-bar-scale' as string]: scale.toString(),
                            transform: `scaleX(${scale})`,
                          } as React.CSSProperties
                        }
                      />
                    </div>
                    <div className="k-mono text-[11px] uppercase tracking-[0.12em] text-[#8a8782]">
                      {formatNumber(line.sent)} messages ·{' '}
                      {formatNumber(line.converted)} converted
                    </div>
                  </div>
                  <div
                    className="k-display k-count-up text-right"
                    style={{
                      fontSize: 28,
                      lineHeight: 1,
                      letterSpacing: '-0.035em',
                      color: line.accent,
                    }}
                  >
                    {formatARS(line.revenue)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 pt-6 border-t border-[#e4dfd2] flex items-center justify-between gap-4">
            <span className="k-mono text-[10px] uppercase tracking-[0.16em] text-[#8a8782]">
              Attributed · Nomi decision engine
            </span>
            <span className="k-mono text-[10px] uppercase tracking-[0.16em] text-[#0e5e48]">
              Revenue &gt; activity
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
