import Image from 'next/image';

export function SponsorStrip() {
  return (
    <section className="relative border-t border-b border-[#e4dfd2] bg-[#f1ede3]/60">
      <div className="editorial-container py-7 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="k-label text-[10px] text-[#8a8782] whitespace-nowrap">
          Presentado en · Presented at
        </div>

        <div className="flex items-center gap-10 md:gap-14 opacity-90">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/kaszek-logo.png"
              alt="Kaszek"
              width={96}
              height={24}
              className="h-5 w-auto object-contain"
              style={{ filter: 'grayscale(1) contrast(1.05)' }}
            />
          </div>

          <span className="h-4 w-px bg-[#d6cfbc]" />

          <AnthropicWordmark />

          <span className="h-4 w-px bg-[#d6cfbc]" />

          <div className="flex items-center gap-3">
            <Image
              src="/brand/digital-house.svg"
              alt="Digital House"
              width={120}
              height={24}
              className="h-5 w-auto object-contain"
              style={{ filter: 'grayscale(1) contrast(1.05)' }}
            />
          </div>
        </div>

        <div className="k-mono text-[10px] uppercase tracking-[0.16em] text-[#8a8782] whitespace-nowrap">
          Belgrano · CABA
        </div>
      </div>
    </section>
  );
}

function AnthropicWordmark() {
  return (
    <div
      className="text-[#151411]"
      style={{
        fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
        fontWeight: 600,
        fontSize: '15px',
        letterSpacing: '-0.02em',
      }}
    >
      Anthropic
    </div>
  );
}
