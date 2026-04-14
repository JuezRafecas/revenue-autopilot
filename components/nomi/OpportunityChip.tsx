'use client';

import type { Opportunity } from '@/lib/agent/types';
import { useNomiHub } from './context';

interface OpportunityChipProps {
  opportunity: Opportunity;
  index: number;
  total: number;
  currency: string;
}

const SEGMENT_LABEL: Record<Opportunity['target_segment'], string> = {
  dormant: 'Dormidos',
  at_risk: 'En riesgo',
  new: 'Primerizos',
  active: 'Activos',
  vip: 'VIP',
  lead: 'Leads',
};

export function OpportunityChip({
  opportunity,
  index,
  total,
  currency,
}: OpportunityChipProps) {
  const { seedChat } = useNomiHub();

  const handleApprove = () => {
    seedChat(
      `Quiero activar la oportunidad "${opportunity.headline}" con el template ${opportunity.suggested_template_key}. Armame el borrador y explicame por qué.`
    );
  };

  const segmentVar = `var(--segment-${opportunity.target_segment})`;
  const money = new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 0,
    notation: opportunity.revenue_potential > 99999 ? 'compact' : 'standard',
  }).format(opportunity.revenue_potential);
  const notLast = index < total - 1;

  return (
    <div
      className="relative flex flex-col p-4"
      style={{
        borderRight: notLast ? '1px solid var(--hairline)' : 'none',
        minHeight: 148,
      }}
    >
      <span
        aria-hidden
        className="absolute top-0 left-0 right-0"
        style={{
          height: 3,
          background: segmentVar,
        }}
      />

      <div className="flex items-center justify-between mb-2 pt-1">
        <div className="flex items-center gap-1.5">
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              width: 7,
              height: 7,
              background: segmentVar,
              borderRadius: 1,
            }}
          />
          <span
            className="k-label"
            style={{
              color: 'var(--fg)',
              fontSize: 9,
              letterSpacing: '0.16em',
            }}
          >
            {SEGMENT_LABEL[opportunity.target_segment] ??
              opportunity.target_segment}
          </span>
        </div>
        <span
          className="k-mono"
          style={{
            color: 'var(--fg-subtle)',
            fontSize: 9,
            letterSpacing: '0.14em',
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <h3
        className="leading-[1.15] mb-3 flex-1"
        style={{
          fontFamily:
            'var(--font-kaszek-display), "Archivo Black", system-ui, sans-serif',
          fontWeight: 800,
          fontSize: 13.5,
          letterSpacing: '-0.02em',
          color: 'var(--fg)',
        }}
      >
        {opportunity.headline}
      </h3>

      <div
        className="flex items-end justify-between gap-2 pt-2.5 mb-3"
        style={{ borderTop: '1px solid var(--hairline)' }}
      >
        <div>
          <div
            className="k-label"
            style={{ color: 'var(--fg-subtle)', fontSize: 8 }}
          >
            Potencial
          </div>
          <div
            className="k-mono"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--fg)',
              letterSpacing: '-0.01em',
              marginTop: 1,
            }}
          >
            {currency} {money}
          </div>
        </div>
        <div
          className="k-mono text-right"
          style={{
            fontSize: 9.5,
            color: 'var(--fg-muted)',
          }}
        >
          {opportunity.audience_size.toLocaleString('es-AR')} clientes
        </div>
      </div>

      <button
        type="button"
        onClick={handleApprove}
        className="nomi-approve inline-flex items-center justify-center gap-1.5 w-full py-2 transition-colors"
        style={{
          background: 'var(--accent)',
          color: '#fff',
          fontFamily:
            'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          border: 'none',
          borderRadius: 0,
          cursor: 'pointer',
        }}
      >
        Aprobar
        <span aria-hidden style={{ transform: 'translateY(-0.5px)' }}>
          →
        </span>
      </button>

      <style jsx>{`
        .nomi-approve:hover {
          background: var(--accent-dim);
        }
        .nomi-approve:focus-visible {
          outline: 2px solid var(--k-royal);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
