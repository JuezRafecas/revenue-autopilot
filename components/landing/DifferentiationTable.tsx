import { SectionHeader } from './SectionHeader';
import { DIFFERENTIATION, SECTION_HEADERS } from './copy';

export function DifferentiationSection() {
  return (
    <section
      id="diferenciacion"
      className="k-section k-section-hairline editorial-container"
    >
      <SectionHeader
        eyebrow={SECTION_HEADERS.diff.eyebrow}
        title={SECTION_HEADERS.diff.title}
        lead={SECTION_HEADERS.diff.lead}
      />

      <div className="mt-16 grid grid-cols-[minmax(0,auto)_1fr_1fr] gap-x-6 md:gap-x-10">
        <div className="k-mono text-[9.5px] uppercase tracking-[0.16em] text-[#8a8782] pb-4" />
        <div className="k-mono text-[9.5px] uppercase tracking-[0.16em] text-[#8a8782] pb-4 flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-2 w-2"
            style={{ background: '#d6cfbc', boxShadow: '0 0 0 1.5px #151411' }}
          />
          What everyone offers
        </div>
        <div className="k-mono text-[9.5px] uppercase tracking-[0.16em] text-[#0e5e48] pb-4 flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-2 w-2"
            style={{ background: '#0e5e48', boxShadow: '0 0 0 1.5px #151411' }}
          />
          Nomi - Guest Autopilot
        </div>

        {DIFFERENTIATION.map((row, i) => (
          <div
            key={i}
            className="contents"
            data-reveal="true"
            data-reveal-delay={String(Math.min(i + 1, 6))}
          >
            <div
              className="k-mono text-[11px] uppercase tracking-[0.14em] text-[#8a8782] py-5 border-t border-[#e4dfd2] flex items-center"
            >
              {String(i + 1).padStart(2, '0')}
            </div>
            <div className="text-[15px] leading-snug text-[#605e5a] py-5 border-t border-[#e4dfd2] flex items-center">
              <span className="k-strike" data-in-view="true">
                {row.them}
              </span>
            </div>
            <div className="text-[16px] leading-snug text-[#151411] font-semibold py-5 border-t border-[#e4dfd2] flex items-center gap-3">
              <span
                aria-hidden
                className="inline-block h-2 w-2 flex-shrink-0"
                style={{ background: '#e6784c', boxShadow: '0 0 0 1.5px #151411' }}
              />
              {row.us}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
