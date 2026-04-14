import { CHANNEL_STATS } from './copy';

const MAX = 100;

export function ChannelStats() {
  return (
    <div className="w-full">
      <div className="k-divider-rule mb-8">
        <span className="k-mono text-[10px] uppercase tracking-[0.18em] text-[#8a8782]">
          Por qué WhatsApp · no es opinión
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {CHANNEL_STATS.map((row, i) => {
          const isWA = row.channel === 'WhatsApp';
          const scale = row.openRateNumeric / MAX;
          return (
            <div
              key={row.channel}
              data-reveal="true"
              data-reveal-delay={String(Math.min(i + 2, 6))}
              className="grid grid-cols-[120px_1fr_auto] items-center gap-5"
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block h-3 w-3"
                  style={{
                    background: isWA ? '#0e5e48' : '#d6cfbc',
                    boxShadow: '0 0 0 1.5px #151411',
                  }}
                />
                <span
                  className={`k-display-md ${isWA ? 'text-[#0e5e48]' : 'text-[#605e5a]'}`}
                  style={{ fontSize: 22 }}
                >
                  {row.channel}
                </span>
              </div>

              <div className="relative">
                <div className="k-bar-track">
                  <div
                    className="k-bar-fill"
                    data-in-view="true"
                    style={
                      {
                        background: isWA ? '#0e5e48' : '#d6cfbc',
                        ['--k-bar-scale' as string]: scale.toString(),
                        transform: `scaleX(${scale})`,
                      } as React.CSSProperties
                    }
                  />
                </div>
                <div className="mt-1.5 k-mono text-[10px] uppercase tracking-[0.14em] text-[#8a8782]">
                  Open rate {row.openRate} · conv. {row.conversion}
                </div>
              </div>

              <div className="k-mono text-[11px] uppercase tracking-[0.12em] text-[#605e5a] w-[160px] text-right">
                {row.note}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
