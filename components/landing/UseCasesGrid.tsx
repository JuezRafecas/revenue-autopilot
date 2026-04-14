import { SectionHeader } from './SectionHeader';
import { USE_CASES, SECTION_HEADERS } from './copy';

export function UseCasesSection() {
  return (
    <section
      id="casos"
      className="k-section k-section-hairline editorial-container"
    >
      <SectionHeader
        eyebrow={SECTION_HEADERS.casos.eyebrow}
        title={SECTION_HEADERS.casos.title}
        lead={SECTION_HEADERS.casos.lead}
      />

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        {USE_CASES.map((uc, i) => {
          // First two span 3 cols each on lg, rest span 2 cols
          const colSpan = i < 2 ? 'lg:col-span-3' : 'lg:col-span-2';
          return (
            <article
              key={uc.rank}
              data-reveal="true"
              data-reveal-delay={String(Math.min(i + 1, 6))}
              className={`k-tile k-tile--${uc.tileVariant} ${colSpan} flex flex-col gap-4 min-h-[320px]`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="k-step-digit">{uc.rank}</span>
                <span className="k-mono text-[9px] uppercase tracking-[0.18em] text-[#151411] bg-[#faf8f4]/80 border border-[#151411] px-2 py-1">
                  {uc.mode}
                </span>
              </div>

              <h3 className="k-display-md">{uc.title}</h3>

              <div className="mt-auto pt-5 border-t border-[#151411]/30 flex flex-col gap-3">
                <div>
                  <div className="k-mono text-[9.5px] uppercase tracking-[0.16em] text-[#151411]/60 mb-1">
                    Trigger
                  </div>
                  <div className="text-[12.5px] leading-snug text-[#151411]">
                    {uc.trigger}
                  </div>
                </div>
                <div>
                  <div className="k-mono text-[9.5px] uppercase tracking-[0.16em] text-[#151411]/60 mb-1">
                    Nomi&rsquo;s action
                  </div>
                  <div className="text-[12.5px] leading-snug text-[#151411]">
                    {uc.action}
                  </div>
                </div>
                <div>
                  <div className="k-mono text-[9.5px] uppercase tracking-[0.16em] text-[#151411]/60 mb-1">
                    Metric
                  </div>
                  <div className="text-[12.5px] leading-snug text-[#151411] italic">
                    {uc.metric}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
