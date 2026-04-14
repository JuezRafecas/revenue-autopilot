'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { SEGMENT_CONFIG, SEGMENT_ORDER, SEGMENT_HEX, formatNumber } from '@/lib/constants';
import type { Segment } from '@/lib/types';
import { SectionHeader } from './SectionHeader';
import { LIFECYCLE_DEMO, SECTION_HEADERS } from './copy';

const AUTO_ADVANCE_MS = 4200;

export function LifecycleSection() {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState<Segment>('dormant');
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    if (userInteracted || reducedMotion) return;
    const id = setInterval(() => {
      setActive((prev) => {
        const currentIdx = SEGMENT_ORDER.indexOf(prev);
        const nextIdx = (currentIdx + 1) % SEGMENT_ORDER.length;
        return SEGMENT_ORDER[nextIdx];
      });
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [userInteracted, reducedMotion]);

  const onPick = (seg: Segment) => {
    setActive(seg);
    setUserInteracted(true);
  };

  const config = SEGMENT_CONFIG[active];
  const demo = LIFECYCLE_DEMO[active];
  const hex = SEGMENT_HEX[active];

  return (
    <section
      id="ciclo"
      className="k-section k-section-hairline editorial-container"
    >
      <SectionHeader
        eyebrow={SECTION_HEADERS.lifecycle.eyebrow}
        title={SECTION_HEADERS.lifecycle.title}
        lead={SECTION_HEADERS.lifecycle.lead}
      />

      <div className="mt-16 grid grid-cols-1 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] gap-12 lg:gap-20 items-start">
        {/* LEFT — pills */}
        <div
          data-reveal="true"
          data-reveal-delay="2"
          className="flex flex-col gap-3"
          role="tablist"
          aria-label="Guest lifecycle states"
        >
          {SEGMENT_ORDER.map((seg) => {
            const c = SEGMENT_CONFIG[seg];
            const isActive = seg === active;
            return (
              <button
                key={seg}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onPick(seg)}
                className={`k-pill ${isActive ? 'k-pill--active' : ''} w-fit`}
              >
                <span
                  aria-hidden
                  className="inline-block h-3 w-3"
                  style={{
                    background: SEGMENT_HEX[seg],
                    boxShadow: isActive ? '0 0 0 2px #faf8f4' : '0 0 0 2px #151411',
                  }}
                />
                <span>{c.icon}</span>
                <span>{c.label}</span>
                <span className="k-mono text-[10px] tracking-[0.1em] opacity-70">
                  {formatNumber(LIFECYCLE_DEMO[seg].volume)}
                </span>
              </button>
            );
          })}
        </div>

        {/* RIGHT — detail panel */}
        <div
          data-reveal="true"
          data-reveal-delay="3"
          className="relative"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
              className="k-card-brutal p-8 md:p-10"
              style={{ background: '#ffffff' }}
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="inline-block h-4 w-4"
                    style={{ background: hex, boxShadow: '0 0 0 2px #151411' }}
                  />
                  <span className="k-mono text-[10px] uppercase tracking-[0.16em] text-[#8a8782]">
                    State · {config.key}
                  </span>
                </div>
                <span
                  className="k-mono text-[10px] uppercase tracking-[0.14em]"
                  style={{
                    color:
                      demo.trend === 'up'
                        ? '#0e5e48'
                        : demo.trend === 'down'
                          ? '#c25a2e'
                          : '#8a8782',
                  }}
                >
                  {demo.trend === 'up' ? '↑ ' : demo.trend === 'down' ? '↓ ' : '→ '}
                  {demo.trendLabel}
                </span>
              </div>

              <div
                className="k-display k-count-up"
                style={{
                  fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                  lineHeight: 0.88,
                  letterSpacing: '-0.045em',
                }}
              >
                {formatNumber(demo.volume)}
              </div>
              <div className="mt-1 k-label text-[#0e5e48]">
                {config.label} · {config.description}
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-[#e4dfd2]">
                <div>
                  <div className="k-mono text-[9.5px] uppercase tracking-[0.18em] text-[#8a8782] mb-2">
                    What Nomi does
                  </div>
                  <div className="text-[15px] leading-snug text-[#151411]">
                    {demo.action}
                  </div>
                </div>
                <div>
                  <div className="k-mono text-[9.5px] uppercase tracking-[0.18em] text-[#8a8782] mb-2">
                    Success metric
                  </div>
                  <div className="text-[15px] leading-snug text-[#151411]">
                    {demo.metric}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#e4dfd2]">
                <div className="k-mono text-[9.5px] uppercase tracking-[0.18em] text-[#8a8782] mb-3">
                  Illustrative example
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 flex items-center justify-center k-display text-[20px]"
                    style={{
                      background: hex,
                      border: '2px solid #151411',
                      color: '#151411',
                    }}
                  >
                    {demo.sample.name
                      .split(' ')
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-[15px] text-[#151411]">
                      {demo.sample.name}
                    </div>
                    <div className="text-[13px] text-[#605e5a]">
                      {demo.sample.subtitle}
                    </div>
                    <div className="text-[12px] text-[#8a8782] italic mt-0.5">
                      {demo.sample.trait}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {!userInteracted && !reducedMotion && (
            <div
              aria-hidden
              className="absolute -bottom-8 right-0 k-mono text-[9px] uppercase tracking-[0.18em] text-[#8a8782]"
            >
              auto-advance · click to explore
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
