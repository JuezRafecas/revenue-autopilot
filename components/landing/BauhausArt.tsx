import Image from 'next/image';

export function BauhausArt() {
  return (
    <div className="relative w-full aspect-[5/4] select-none">
      {/* ── Decorative Bauhaus shapes — drift outside the poster bbox ─── */}

      {/* Mint rectangle — top-left overhang */}
      <div
        className="absolute z-10 k-reveal k-reveal-2"
        style={{
          top: '-6%',
          left: '-6%',
          width: '34%',
          height: '22%',
          background: '#a8d8c4',
          boxShadow: '14px 14px 0 0 #151411',
        }}
        aria-hidden
      />

      {/* Royal-blue triangle — bottom-right overhang */}
      <svg
        className="absolute z-10 k-reveal k-reveal-4"
        style={{
          bottom: '-5%',
          right: '-4%',
          width: '26%',
          height: 'auto',
        }}
        viewBox="0 0 100 100"
        aria-hidden
      >
        <polygon points="0,100 100,100 50,6" fill="#5b8def" />
        <polygon
          points="0,100 100,100 50,6"
          fill="none"
          stroke="#151411"
          strokeWidth="3"
        />
      </svg>

      {/* Terracotta pill — top-right */}
      <div
        className="absolute z-20 k-reveal k-reveal-3"
        style={{
          top: '8%',
          right: '-9%',
          width: '22%',
          height: '11%',
          background: '#e6784c',
          borderRadius: '999px',
          border: '3px solid #151411',
        }}
        aria-hidden
      />

      {/* Sun/asterisk burst — floating bottom-left, hugging the poster */}
      <svg
        className="absolute z-20 k-reveal k-reveal-5"
        style={{
          bottom: '-6%',
          left: '-8%',
          width: '20%',
          height: 'auto',
          filter: 'drop-shadow(6px 6px 0 #151411)',
        }}
        viewBox="0 0 100 100"
        aria-hidden
      >
        <g fill="#e6784c" stroke="#151411" strokeWidth="2.5" strokeLinejoin="round">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 360) / 12;
            return (
              <rect
                key={i}
                x="46"
                y="6"
                width="8"
                height="40"
                rx="1"
                transform={`rotate(${angle} 50 50)`}
              />
            );
          })}
          <circle cx="50" cy="50" r="12" fill="#f0a04b" />
        </g>
      </svg>

      {/* ── OG poster — the main hero art ─────────────────────────────── */}
      <div
        className="absolute z-0 inset-0 k-reveal k-reveal-1 overflow-hidden border-4 border-[#151411] bg-[#faf8f4]"
        style={{ boxShadow: '18px 18px 0 0 #151411' }}
      >
        <Image
          src="/brand/push-to-prod-og.png"
          alt="Push to Prod Hackathon — Kaszek × Anthropic × Digital House"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 48vw"
          className="object-contain p-6"
        />
      </div>

      {/* Corner tag — like a sticker */}
      <div
        className="absolute z-30 k-reveal k-reveal-6"
        style={{
          bottom: '-4%',
          left: '22%',
          padding: '6px 14px',
          background: '#151411',
          color: '#faf8f4',
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '10px',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          border: '2px solid #151411',
        }}
      >
        Nomi - Guest Autopilot · Entry 01
      </div>
    </div>
  );
}
