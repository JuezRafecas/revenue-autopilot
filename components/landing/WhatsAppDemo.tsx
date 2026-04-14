'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { SectionHeader } from './SectionHeader';
import { WHATSAPP_DEMO, SECTION_HEADERS } from './copy';
import { ChannelStats } from './ChannelStats';

const JSON_FIELDS: Array<{ key: string; value: string }> = [
  { key: 'guest_name', value: '"Juan Pérez"' },
  { key: 'total_visits', value: '7' },
  { key: 'days_since_last_visit', value: '58' },
  { key: 'avg_days_between_visits', value: '18' },
  { key: 'preferred_day', value: '"thursday"' },
  { key: 'preferred_shift', value: '"evening"' },
  { key: 'preferred_sector', value: '"bar"' },
  { key: 'last_score', value: '4.5' },
  { key: 'lifecycle_state', value: '"dormant"' },
];

const TYPING_SPEED_MS = 26;
const LOOP_PAUSE_MS = 3200;

export function WhatsAppSection() {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.35 });
  const [typed, setTyped] = useState(reducedMotion ? WHATSAPP_DEMO.message : '');
  const [delivered, setDelivered] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setTyped(WHATSAPP_DEMO.message);
      setDelivered(true);
      return;
    }
    if (!inView) return;

    let cancelled = false;
    let timers: ReturnType<typeof setTimeout>[] = [];

    const runCycle = () => {
      if (cancelled) return;
      setTyped('');
      setDelivered(false);

      const message = WHATSAPP_DEMO.message;
      // Kick off typing after a brief pause so JSON stagger finishes
      const kickoff = setTimeout(() => {
        if (cancelled) return;
        let i = 0;
        const tick = () => {
          if (cancelled) return;
          i += 1;
          setTyped(message.slice(0, i));
          if (i < message.length) {
            const t = setTimeout(tick, TYPING_SPEED_MS);
            timers.push(t);
          } else {
            const dt = setTimeout(() => {
              if (cancelled) return;
              setDelivered(true);
              const loop = setTimeout(runCycle, LOOP_PAUSE_MS);
              timers.push(loop);
            }, 400);
            timers.push(dt);
          }
        };
        tick();
      }, 1600);
      timers.push(kickoff);
    };

    runCycle();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      timers = [];
    };
  }, [inView, reducedMotion]);

  return (
    <section
      id="whatsapp"
      className="k-section k-section-hairline editorial-container"
    >
      <SectionHeader
        eyebrow={SECTION_HEADERS.whatsapp.eyebrow}
        title={SECTION_HEADERS.whatsapp.title}
        lead={SECTION_HEADERS.whatsapp.lead}
      />

      <div
        ref={containerRef}
        className="mt-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-14 lg:gap-20 items-start"
      >
        {/* LEFT — JSON context */}
        <div data-reveal="true" data-reveal-delay="2">
          <div className="k-mono text-[10px] uppercase tracking-[0.18em] text-[#8a8782] mb-4">
            01 · Guest context
          </div>
          <div
            className="k-card-brutal p-7"
            style={{ background: '#ffffff' }}
          >
            <div className="k-mono text-[11px] text-[#8a8782] mb-3">
              guest_profile.json
            </div>
            <div className="flex flex-wrap gap-2">
              {JSON_FIELDS.map((field, i) => (
                <motion.span
                  key={field.key}
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                  transition={{
                    delay: reducedMotion ? 0 : 0.08 + i * 0.08,
                    duration: 0.4,
                    ease: [0.2, 0.7, 0.2, 1],
                  }}
                  className="k-chip"
                >
                  <span className="k-chip__key">{field.key}:</span>
                  <span className="k-chip__val">{field.value}</span>
                </motion.span>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M4 12H20M14 6L20 12L14 18"
                stroke="#151411"
                strokeWidth="2.2"
                strokeLinecap="square"
              />
            </svg>
            <span className="k-mono text-[10px] uppercase tracking-[0.18em] text-[#8a8782]">
              02 · Nomi personalizes
            </span>
          </div>
        </div>

        {/* RIGHT — phone */}
        <div data-reveal="true" data-reveal-delay="3" className="flex justify-center lg:justify-start">
          <div className="k-phone-frame">
            {/* header */}
            <div className="pt-8 px-3 pb-3 flex items-center gap-3 border-b border-[#e4dfd2]">
              <div
                className="h-9 w-9 flex items-center justify-center k-display text-[12px]"
                style={{
                  background: '#e6784c',
                  border: '1.5px solid #151411',
                  color: '#faf8f4',
                  borderRadius: '999px',
                }}
              >
                LC
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[#151411] leading-tight">
                  La Cabrera
                </div>
                <div className="text-[10px] text-[#0e5e48] leading-tight">
                  online
                </div>
              </div>
            </div>

            {/* message area */}
            <div
              className="px-3 py-5 min-h-[220px] flex flex-col gap-3"
              style={{
                background:
                  'repeating-linear-gradient(135deg, rgba(21,20,17,0.025) 0 2px, transparent 2px 18px)',
              }}
            >
              <div
                className="k-bubble-wa max-w-[85%]"
                aria-hidden={!reducedMotion}
              >
                <span className={typed.length < WHATSAPP_DEMO.message.length ? 'k-caret' : ''}>
                  {typed || '\u00a0'}
                </span>
              </div>
              <span className="sr-only">{WHATSAPP_DEMO.message}</span>

              <div className="self-end flex items-center gap-1.5 mt-1 k-mono text-[10px] uppercase tracking-[0.12em] text-[#8a8782]">
                {delivered ? (
                  <>
                    <span>sent</span>
                    <span style={{ color: '#0e5e48' }}>✓✓</span>
                  </>
                ) : (
                  <span className="italic">typing…</span>
                )}
              </div>
            </div>

            {/* input bar */}
            <div className="mt-4 mx-3 h-10 border-2 border-[#151411] bg-[#faf8f4] flex items-center px-3 k-mono text-[10px] uppercase tracking-[0.14em] text-[#8a8782]">
              Book now ›
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24">
        <ChannelStats />
      </div>
    </section>
  );
}
