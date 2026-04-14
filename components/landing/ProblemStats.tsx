import { SectionHeader } from './SectionHeader';
import { CountUp } from './CountUp';
import {
  PROBLEM_STATS,
  PROBLEM_PULL_QUOTE,
  SECTION_HEADERS,
} from './copy';

export function ProblemSection() {
  return (
    <section
      id="problema"
      className="k-section k-section-hairline editorial-container"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] gap-16 lg:gap-24 items-start">
        <div>
          <SectionHeader
            eyebrow={SECTION_HEADERS.problema.eyebrow}
            title={SECTION_HEADERS.problema.title}
            lead={SECTION_HEADERS.problema.lead}
          />
        </div>

        <div
          data-reveal="true"
          data-reveal-delay="4"
          className="relative pt-4 lg:pt-10 pl-8"
        >
          <p className="k-pull">{PROBLEM_PULL_QUOTE}</p>
          <div className="mt-10 k-mono text-[10px] uppercase tracking-[0.16em] text-[#8a8782]">
            — Hackathon knowledge base · §2
          </div>
        </div>
      </div>

      <div className="mt-20 pt-10 k-divider-rule">
        <span className="k-mono text-[10px] uppercase tracking-[0.18em] text-[#8a8782]">
          Lo que el sistema ve
        </span>
      </div>

      <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12">
        {PROBLEM_STATS.map((stat, i) => (
          <div
            key={stat.label}
            data-reveal="true"
            data-reveal-delay={String(Math.min(i + 1, 6))}
            className="flex flex-col gap-2"
          >
            <div
              className="k-display text-[#151411]"
              style={{
                fontSize: 'clamp(2.75rem, 4.5vw, 4rem)',
                lineHeight: 0.9,
                letterSpacing: '-0.04em',
              }}
            >
              <CountUp
                value={stat.valueNumeric}
                prefix={stat.prefix ?? ''}
                suffix={stat.suffix ?? ''}
              />
            </div>
            <div className="k-label text-[11px] text-[#0e5e48] leading-snug max-w-[30ch]">
              {stat.label}
            </div>
            <div className="k-mono text-[10px] uppercase tracking-[0.14em] text-[#8a8782]">
              {stat.sub}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
