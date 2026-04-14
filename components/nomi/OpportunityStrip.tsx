'use client';

import { useEffect, useState } from 'react';
import type { Opportunity } from '@/lib/agent/types';
import { OpportunityChip } from './OpportunityChip';

interface OpportunityStripProps {
  opportunities: Opportunity[];
  currency: string;
  error: string | null;
  collapsed?: boolean;
}

export function OpportunityStrip({
  opportunities,
  currency,
  error,
  collapsed = false,
}: OpportunityStripProps) {
  const visible = opportunities.slice(0, 3);
  const [expanded, setExpanded] = useState(!collapsed);

  useEffect(() => {
    setExpanded(!collapsed);
  }, [collapsed]);

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
          Couldn't read your CDP
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

  if (!expanded) {
    const headlines = visible.map((o) => o.headline).join(' · ');
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-3 px-4 transition-colors"
        style={{
          border: '1px solid var(--hairline-strong)',
          background: 'var(--bg-raised)',
          height: 44,
          textAlign: 'left',
          cursor: 'pointer',
        }}
        aria-label="Show opportunities"
      >
        <SparkleIcon />
        <span
          className="k-label shrink-0"
          style={{
            color: 'var(--k-green)',
            fontSize: 9.5,
            letterSpacing: '0.16em',
          }}
        >
          {visible.length} opportunit{visible.length === 1 ? 'y' : 'ies'}
        </span>
        <span
          className="truncate min-w-0 flex-1"
          style={{
            fontFamily:
              'var(--font-kaszek-sans), Inter, -apple-system, sans-serif',
            fontSize: 12,
            color: 'var(--fg-muted)',
            letterSpacing: '-0.005em',
          }}
        >
          {headlines}
        </span>
        <span
          className="k-mono shrink-0"
          style={{
            fontSize: 9.5,
            letterSpacing: '0.14em',
            color: 'var(--fg-subtle)',
            textTransform: 'uppercase',
          }}
        >
          ▾ Show
        </span>
      </button>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <SparkleIcon />
          <div
            className="k-label"
            style={{
              color: 'var(--k-green)',
              fontSize: 9.5,
              letterSpacing: '0.16em',
            }}
          >
            {visible.length} opportunit{visible.length === 1 ? 'y' : 'ies'} Nomi detected
          </div>
        </div>
        {collapsed && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="k-mono"
            style={{
              fontSize: 9.5,
              letterSpacing: '0.14em',
              color: 'var(--fg-subtle)',
              textTransform: 'uppercase',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 6px',
            }}
            aria-label="Hide opportunities"
          >
            ▴ Hide
          </button>
        )}
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
