'use client';

import { motion } from 'framer-motion';
import { Numeral } from '@/components/ui/Numeral';
import type { UseCaseBreakdown } from '@/lib/dashboard-types';

interface Props {
  totalAtStake: number;
  dormantCount: number;
  avgTicket: number;
  breakdown?: UseCaseBreakdown[];
}

export function RevenueOpportunity({
  totalAtStake,
  dormantCount,
  avgTicket,
  breakdown = [],
}: Props) {
  const hasBreakdown = breakdown.length > 0;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="relative py-16 md:py-24"
      style={{
        borderTop: '2px solid var(--fg)',
        borderBottom: '2px solid var(--fg)',
        background: 'var(--bg)',
      }}
    >
      <div className="editorial-container grid grid-cols-1 md:grid-cols-[auto_1fr] gap-12 items-end">
        <div>
          <div
            className="mb-4 text-[10.5px] uppercase font-[600]"
            style={{
              letterSpacing: '0.18em',
              color: 'var(--k-green, #0e5e48)',
              fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
            }}
          >
            Money on the table
          </div>
          <div
            className="k-digit-outlined tabular-nums"
            style={{ fontSize: 'clamp(3.5rem, 9vw, 7.5rem)' }}
          >
            <Numeral value={totalAtStake} animated format="ars" />
          </div>
        </div>

        <div className="flex flex-col gap-8 pb-4 max-w-[52ch]">
          <p
            className="k-italic-serif leading-snug"
            style={{
              fontSize: 'clamp(1.15rem, 1.55vw, 1.5rem)',
              color: 'var(--fg-muted)',
            }}
          >
            recoverable over the next 90 days if we act on the{' '}
            <span style={{ color: 'var(--fg)', fontStyle: 'normal', fontWeight: 600 }}>
              {dormantCount}
            </span>{' '}
            guests who stopped coming. Average ticket{' '}
            <span
              className="font-mono"
              style={{ fontStyle: 'normal', fontSize: '0.8em', color: 'var(--fg)' }}
            >
              ${(avgTicket / 1000).toFixed(0)}K
            </span>
            .
          </p>

          <button
            type="button"
            className="k-btn k-btn--primary inline-flex items-center gap-3 self-start"
            style={{
              border: '2px solid var(--fg)',
              height: 48,
              padding: '0 24px',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              background: 'var(--accent)',
              color: 'var(--bg)',
              fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
            }}
          >
            Start reactivation
            <span>→</span>
          </button>
        </div>
      </div>

      {hasBreakdown && (
        <div className="editorial-container mt-14 md:mt-16">
          <div
            className="mb-4 text-[10.5px] uppercase font-[600]"
            style={{
              letterSpacing: '0.18em',
              color: 'var(--k-green, #0e5e48)',
              fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
            }}
          >
            Revenue by use case · 30d
          </div>
          <ul
            role="list"
            style={{ borderTop: '1px solid var(--hairline-strong)' }}
          >
            {breakdown.map((b) => (
              <li
                key={b.key}
                className="flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_80px_120px_auto] md:items-baseline gap-3 md:gap-10 py-4"
                style={{ borderBottom: '1px solid var(--hairline)' }}
              >
                <div className="flex items-baseline justify-between gap-4 md:contents">
                  <span
                    className="truncate"
                    style={{
                      fontFamily:
                        'var(--font-kaszek-display), "Archivo Black", system-ui, sans-serif',
                      fontWeight: 800,
                      fontSize: 'clamp(1rem, 1.3vw, 1.2rem)',
                      letterSpacing: '-0.025em',
                      color: 'var(--fg)',
                    }}
                  >
                    {b.label}
                  </span>
                  <div className="md:hidden text-right shrink-0">
                    <MobileRevenue value={b.revenue} />
                  </div>
                </div>
                <div className="flex items-baseline gap-6 md:contents">
                  <BreakdownStat value={b.sent} label="sent" />
                  <BreakdownStat
                    value={b.conversions}
                    label={b.key === 'post_visit' ? '2nd visits' : 'conversions'}
                  />
                </div>
                <div className="hidden md:block text-right">
                  <MobileRevenue value={b.revenue} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.section>
  );
}

function MobileRevenue({ value }: { value: number }) {
  return (
    <>
      <div
        className="tabular-nums"
        style={{
          fontFamily: 'var(--font-kaszek-display), "Archivo Black", system-ui, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(1rem, 1.4vw, 1.3rem)',
          letterSpacing: '-0.03em',
          color: 'var(--accent)',
        }}
      >
        <Numeral value={value} format="ars" />
      </div>
      <div
        className="text-[9.5px] uppercase mt-0.5"
        style={{ letterSpacing: '0.16em', color: 'var(--fg-subtle)' }}
      >
        revenue
      </div>
    </>
  );
}

function BreakdownStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-right">
      <div
        className="font-mono tabular-nums"
        style={{
          fontSize: 'clamp(0.95rem, 1.1vw, 1.05rem)',
          color: 'var(--fg)',
        }}
      >
        <Numeral value={value} />
      </div>
      <div
        className="text-[9.5px] uppercase mt-0.5"
        style={{ letterSpacing: '0.16em', color: 'var(--fg-subtle)' }}
      >
        {label}
      </div>
    </div>
  );
}
