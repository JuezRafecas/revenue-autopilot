'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CampaignDraft } from '@/lib/agent/types';
import { countWorkflowSends, countWorkflowBranches } from '@/lib/campaigns';

interface CampaignDraftCardProps {
  draft: CampaignDraft;
  currency?: string;
}

export function CampaignDraftCard({ draft, currency = 'ARS' }: CampaignDraftCardProps) {
  const [state, setState] = useState<'idle' | 'creating' | 'created' | 'error' | 'dismissed'>(
    'idle'
  );
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleApprove = async () => {
    setState('creating');
    setError(null);
    try {
      const res = await fetch('/api/agent/campaigns/approve', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ draft }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const { campaign } = (await res.json()) as { campaign: { id: string } };
      setState('created');
      router.push(`/campaigns/${campaign.id}`);
    } catch (e) {
      setState('error');
      setError(e instanceof Error ? e.message : 'Unknown error.');
    }
  };

  if (state === 'dismissed') {
    return (
      <div
        className="k-mono my-3 py-2 text-[10px] uppercase"
        style={{ letterSpacing: '0.14em', color: 'var(--fg-subtle)' }}
      >
        · draft dismissed ·
      </div>
    );
  }

  const sends = countWorkflowSends(draft.workflow);
  const branches = countWorkflowBranches(draft.workflow);
  const trigger = formatTrigger(draft.trigger);
  const money = draft.estimated_revenue
    ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(draft.estimated_revenue)
    : '—';

  return (
    <section
      aria-labelledby={`draft-${draft.name}`}
      className="my-5"
      style={{
        borderTop: '1.5px solid var(--fg)',
        borderBottom: '1.5px solid var(--fg)',
        background: 'var(--bg-raised)',
      }}
    >
      <header
        className="flex items-center justify-between px-6 pt-5 pb-3"
        style={{ borderBottom: '1px solid var(--hairline)' }}
      >
        <div className="k-label" style={{ color: 'var(--k-green)' }}>
          Campaign draft · nomi
        </div>
        <div
          className="k-mono text-[10px] uppercase"
          style={{ letterSpacing: '0.14em', color: 'var(--fg-subtle)' }}
        >
          #{draft.template_key}
        </div>
      </header>

      <div className="px-6 pt-4 pb-2">
        <h3
          id={`draft-${draft.name}`}
          className="leading-tight mb-1"
          style={{
            fontFamily: 'var(--font-kaszek-display), "Archivo Black", system-ui, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(1.2rem, 1.6vw, 1.4rem)',
            letterSpacing: '-0.025em',
            color: 'var(--fg)',
          }}
        >
          {draft.name}
        </h3>
        <p
          className="k-italic-serif"
          style={{ fontSize: 14, color: 'var(--fg-muted)' }}
        >
          Designed just now by Nomi.
        </p>
      </div>

      {draft.reasoning && (
        <div
          className="px-6 py-3"
          style={{
            borderTop: '1px solid var(--hairline)',
          }}
        >
          <div className="k-label mb-1" style={{ color: 'var(--fg-subtle)', fontSize: 9.5 }}>
            Why
          </div>
          <p
            className="k-italic-serif"
            style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--fg-muted)' }}
          >
            {draft.reasoning}
          </p>
        </div>
      )}

      <DraftRow label="Audience" value={draft.described_audience || 'entire base'} />
      <DraftRow label="Trigger" value={trigger} mono />
      <DraftRow
        label="Flow"
        value={`${sends} send${sends === 1 ? '' : 's'}${
          branches > 0 ? ` · ${branches} branch${branches === 1 ? '' : 'es'}` : ''
        } · ${draft.channels.join(', ')}`}
        mono
      />
      <DraftRow label="Expected revenue" value={`${currency} ${money}`} mono />

      <footer
        className="px-6 py-5 flex items-center gap-4"
        style={{ borderTop: '1.5px solid var(--fg)' }}
      >
        <button
          type="button"
          onClick={handleApprove}
          disabled={state === 'creating' || state === 'created'}
          className="k-btn k-btn--primary px-5 py-3 inline-flex items-center gap-2"
          style={{
            background: 'var(--accent)',
            color: 'var(--k-cream)',
            fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            border: '1.5px solid var(--k-ink)',
            opacity: state === 'creating' ? 0.75 : 1,
          }}
        >
          {state === 'creating'
            ? 'Creating · · ·'
            : state === 'created'
              ? 'Created'
              : 'Approve and create'}
          {state === 'idle' && <span aria-hidden>→</span>}
        </button>
        <button
          type="button"
          onClick={() => setState('dismissed')}
          disabled={state === 'creating'}
          className="k-mono text-[10px] uppercase underline decoration-dotted underline-offset-4"
          style={{
            letterSpacing: '0.14em',
            color: 'var(--fg-subtle)',
          }}
        >
          Dismiss
        </button>
        {error && (
          <div
            className="k-mono text-[10px] uppercase ml-auto"
            style={{ color: 'var(--accent-dim)', letterSpacing: '0.14em' }}
          >
            error · {error}
          </div>
        )}
      </footer>
    </section>
  );
}

function DraftRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div
      className="px-6 py-3 grid grid-cols-[110px_1fr] gap-4 items-baseline"
      style={{ borderTop: '1px solid var(--hairline)' }}
    >
      <div className="k-label" style={{ color: 'var(--fg-subtle)', fontSize: 9.5 }}>
        {label}
      </div>
      <div
        className={mono ? 'k-mono' : ''}
        style={{
          fontSize: mono ? 12 : 14,
          color: 'var(--fg)',
          fontFamily: mono
            ? undefined
            : 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
          letterSpacing: mono ? '0.02em' : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function formatTrigger(trigger: CampaignDraft['trigger']): string {
  if (trigger.type === 'manual') return 'manual · one shot';
  if (trigger.type === 'schedule') return `schedule · ${trigger.at}`;
  return `event · ${trigger.event}${trigger.delay_hours ? ` · +${trigger.delay_hours}h` : ''}`;
}
