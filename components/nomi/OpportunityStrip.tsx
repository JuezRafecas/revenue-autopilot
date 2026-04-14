'use client';

import type { Opportunity } from '@/lib/agent/types';
import { OpportunityChip } from './OpportunityChip';

interface OpportunityStripProps {
  opportunities: Opportunity[];
  currency: string;
  error: string | null;
}

export function OpportunityStrip({
  opportunities,
  currency,
  error,
}: OpportunityStripProps) {
  const visible = opportunities.slice(0, 3);

  if (error) {
    return (
      <div
        className="py-4 px-5"
        style={{
          border: '1px solid var(--hairline)',
          borderTop: '2px solid var(--accent)',
          background: 'var(--bg-raised)',
        }}
      >
        <div
          className="k-label mb-1"
          style={{ color: 'var(--accent-dim)', fontSize: 9.5 }}
        >
          No pude leer tu CDP
        </div>
        <p
          className="k-italic-serif"
          style={{ fontSize: 13, color: 'var(--fg-muted)' }}
        >
          {error}
        </p>
      </div>
    );
  }

  if (visible.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <SparkleIcon />
        <div
          className="k-label"
          style={{
            color: 'var(--k-green)',
            fontSize: 9.5,
            letterSpacing: '0.16em',
          }}
        >
          {visible.length} oportunidad{visible.length === 1 ? '' : 'es'} que Nomi detectó
        </div>
      </div>

      <div
        className="grid gap-0"
        style={{
          gridTemplateColumns: `repeat(${visible.length}, minmax(0, 1fr))`,
          border: '1px solid var(--hairline-strong)',
          background: 'var(--bg-raised)',
          boxShadow: '0 1px 0 0 var(--hairline), 0 8px 24px -20px rgba(21,20,17,0.2)',
        }}
      >
        {visible.map((opp, i) => (
          <OpportunityChip
            key={opp.id}
            opportunity={opp}
            index={i}
            total={visible.length}
            currency={currency}
          />
        ))}
      </div>
    </div>
  );
}

function SparkleIcon() {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        color: 'var(--accent)',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="11"
        height="11"
      >
        <path
          d="M12 0 L13.8 10.2 L24 12 L13.8 13.8 L12 24 L10.2 13.8 L0 12 L10.2 10.2 Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}
