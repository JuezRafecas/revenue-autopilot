'use client';

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion';
import { SectionHeader } from './SectionHeader';
import { CLAUDE_PHASES, SECTION_HEADERS } from './copy';

export function ClaudePhasesSection() {
  const reducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start 70%', 'end 30%'],
  });

  // Progress bar width on the sticky column
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section
      id="metodo"
      className="k-section k-section-hairline editorial-container"
    >
      <SectionHeader
        eyebrow={SECTION_HEADERS.metodo.eyebrow}
        title={SECTION_HEADERS.metodo.title}
        lead={SECTION_HEADERS.metodo.lead}
      />

      <div
        ref={trackRef}
        className="mt-16 relative grid grid-cols-1 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-10 lg:gap-16"
      >
        {/* LEFT — sticky progress column */}
        <div className="relative">
          <div className="lg:sticky lg:top-[18vh]">
            <div className="k-mono text-[10px] uppercase tracking-[0.18em] text-[#8a8782] mb-4">
              Decision pipeline
            </div>
            <div
              className="k-display mb-6"
              style={{
                fontSize: 'clamp(3rem, 5vw, 5rem)',
                lineHeight: 0.86,
                letterSpacing: '-0.04em',
                color: '#e6784c',
                WebkitTextStroke: '2px #151411',
              }}
            >
              4 phases
            </div>
            <p className="k-body max-w-[38ch] mb-8">
              Nomi answers a single question in a loop: what revenue
              opportunity exists today and what concrete action should run.
            </p>

            {/* Progress bar */}
            <div className="relative h-1.5 bg-[#e4dfd2] border border-[#151411] max-w-[280px]">
              <motion.div
                className="absolute inset-y-0 left-0 bg-[#e6784c]"
                style={{ width: reducedMotion ? '100%' : progressWidth }}
              />
            </div>
            <div className="mt-2 k-mono text-[9.5px] uppercase tracking-[0.16em] text-[#8a8782]">
              Scroll to advance
            </div>
          </div>
        </div>

        {/* RIGHT — phase panels stack */}
        <div className="flex flex-col gap-8">
          {CLAUDE_PHASES.map((phase, i) => (
            <PhaseCard
              key={phase.kicker}
              phase={phase}
              index={i}
              total={CLAUDE_PHASES.length}
              scrollYProgress={scrollYProgress}
              reducedMotion={!!reducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PhaseCard({
  phase,
  index,
  total,
  scrollYProgress,
  reducedMotion,
}: {
  phase: (typeof CLAUDE_PHASES)[number];
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  // Each phase "owns" a 1/total slice of the scroll. Pop scale & opacity in,
  // then hold. Always call hooks regardless of reduced-motion branch.
  const start = index / total;
  const end = Math.min(1, (index + 1) / total);
  const active = useTransform(
    scrollYProgress,
    [Math.max(0, start - 0.08), start, end, Math.min(1, end + 0.08)],
    [0.35, 1, 1, 0.55],
  );
  const opacity = reducedMotion ? 1 : active;
  const scale = useTransform(active, [0.35, 1], [0.97, 1]);

  return (
    <motion.article
      style={reducedMotion ? undefined : { opacity, scale }}
      className="k-card-brutal p-8 md:p-10 relative"
    >
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ background: phase.accent }}
        aria-hidden
      />

      <div className="flex items-baseline justify-between gap-3 mb-4 pt-2">
        <span
          className="k-display"
          style={{
            fontSize: 56,
            lineHeight: 0.86,
            color: phase.accent,
            WebkitTextStroke: '2.5px #151411',
            letterSpacing: '-0.04em',
          }}
        >
          {phase.kicker}
        </span>
        <span
          aria-hidden
          className="inline-block h-3 w-3"
          style={{ background: phase.accent, boxShadow: '0 0 0 2px #151411' }}
        />
      </div>

      <h3
        className="k-display-md mb-4"
        style={{ fontSize: 'clamp(1.75rem, 2.4vw, 2.25rem)' }}
      >
        {phase.title}
      </h3>

      <p className="text-[15px] leading-relaxed text-[#151411] mb-6 max-w-[52ch]">
        {phase.body}
      </p>

      <div className="pt-4 border-t border-[#e4dfd2]">
        <div className="k-mono text-[9.5px] uppercase tracking-[0.16em] text-[#8a8782] mb-1.5">
          Examples
        </div>
        <p className="text-[13px] leading-snug text-[#605e5a] italic max-w-[58ch]">
          {phase.detail}
        </p>
      </div>
    </motion.article>
  );
}
