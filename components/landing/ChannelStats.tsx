import { CHANNEL_STATS } from './copy';

const MAX = 100;

const CHANNEL_ACCENTS: Record<string, { bar: string; label: string }> = {
  Email: { bar: '#d6cfbc', label: '#605e5a' },
  SMS: { bar: '#d6cfbc', label: '#605e5a' },
  WhatsApp: { bar: '#0e5e48', label: '#0e5e48' },
  Voice: { bar: '#e6784c', label: '#e6784c' },
};

export function ChannelStats() {
  return (
    <div className="w-full">
      <div className="k-divider-rule mb-8">
        <span className="k-mono text-[10px] uppercase tracking-[0.18em] text-[#8a8782]">
          Canales · por qué Nomi elige WhatsApp y Voice
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {CHANNEL_STATS.map((row, i) => {
          const accent = CHANNEL_ACCENTS[row.channel] ?? CHANNEL_ACCENTS.Email;
          const isHighlight =
            row.channel === 'WhatsApp' || row.channel === 'Voice';
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
                    background: accent.bar,
                    boxShadow: '0 0 0 1.5px #151411',
                  }}
                />
                <span
                  className="k-display-md"
                  style={{
                    fontSize: 22,
                    color: accent.label,
                  }}
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
                        background: accent.bar,
                        ['--k-bar-scale' as string]: scale.toString(),
                        transform: `scaleX(${scale})`,
                      } as React.CSSProperties
                    }
                  />
                </div>
                <div className="mt-1.5 k-mono text-[10px] uppercase tracking-[0.14em] text-[#8a8782]">
                  Open rate {row.openRate} · conv.{' '}
                  <span
                    style={{
                      color: isHighlight ? accent.label : '#8a8782',
                      fontWeight: isHighlight ? 600 : 400,
                    }}
                  >
                    {row.conversion}
                  </span>
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
