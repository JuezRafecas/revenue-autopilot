'use client';

import type { Opportunity } from '@/lib/agent/types';
import { useNomiHub } from './context';

interface OpportunityCardProps {
  opportunity: Opportunity;
  index: number;
  total: number;
  currency: string;
}

const SEVERITY_LABEL: Record<Opportunity['severity'], string> = {
  high: 'Priority',
  medium: 'Moderate',
  low: 'Context',
};

export function OpportunityCard({
  opportunity,
  index,
  total,
  currency,
}: OpportunityCardProps) {
  const { seedChat } = useNomiHub();

  const handleApprove = () => {
    seedChat(
      `Let's activate the "${opportunity.headline}" opportunity using template ${opportunity.suggested_template_key}. Draft it and tell me why.`
    );
  };

  const segmentVar = `var(--segment-${opportunity.target_segment})`;
  const money = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    notation: opportunity.revenue_potential > 99999 ? 'compact' : 'standard',
  }).format(opportunity.revenue_potential);
  const id = String(index + 1).padStart(3, '0');
  const notLast = index < total - 1;

  return (
    <button
      type="button"
      onClick={handleApprove}
      className="group text-left flex flex-col p-5 transition-colors relative"
      style={{
        borderRight: notLast ? '1px solid var(--hairline-strong)' : 'none',
        minHeight: 180,
        background: 'transparent',
      }}
    >
      <span
        aria-hidden
        className="absolute top-0 left-0 right-0 transition-all"
        style={{
          height: 3,
          background: segmentVar,
          transform: 'scaleX(0.18)',
          transformOrigin: 'left',
        }}
      />

      <div className="flex items-center justify-between mb-3">
        <span
          className="k-label"
          style={{
            color: segmentVar,
            fontSize: 9.5,
            letterSpacing: '0.18em',
          }}
        >
          {opportunity.target_segment.replace('_', ' ')}
        </span>
        <span
          className="k-mono"
          style={{
            color: 'var(--fg-subtle)',
            fontSize: 9,
            letterSpacing: '0.14em',
          }}
        >
          #{id}
        </span>
      </div>

      <h3
        className="leading-[1.08] mb-auto"
        style={{
          fontFamily:
            'var(--font-kaszek-display), "Archivo Black", system-ui, sans-serif',
          fontWeight: 800,
          fontSize: 16,
          letterSpacing: '-0.02em',
          color: 'var(--fg)',
        }}
      >
        {opportunity.headline}
      </h3>

      <div
        className="mt-4 pt-3"
        style={{ borderTop: '1px solid var(--hairline)' }}
      >
        <div className="flex items-end justify-between gap-2">
          <div>
            <div
              className="k-label"
              style={{ color: 'var(--fg-subtle)', fontSize: 8.5 }}
            >
              Potential
            </div>
            <div
              className="k-mono"
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: 'var(--fg)',
                letterSpacing: '-0.01em',
                marginTop: 2,
              }}
            >
              {currency} {money}
            </div>
          </div>
          <div className="text-right">
            <div
              className="k-label"
              style={{ color: 'var(--fg-subtle)', fontSize: 8.5 }}
            >
              {SEVERITY_LABEL[opportunity.severity]}
            </div>
            <div
              className="k-mono"
              style={{
                fontSize: 11,
                color: 'var(--fg-muted)',
                marginTop: 2,
              }}
            >
              {opportunity.audience_size.toLocaleString('en-US')} guests
            </div>
          </div>
        </div>
      </div>

      <div
        className="k-mono absolute bottom-4 right-5 text-[9px] uppercase transition-opacity opacity-0 group-hover:opacity-100"
        style={{ letterSpacing: '0.14em', color: 'var(--accent-dim)' }}
      >
        approve →
      </div>
    </button>
  );
}
