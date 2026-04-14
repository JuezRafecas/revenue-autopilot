'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { EmptyState } from '@/components/ui/EmptyState';
import { ApprovalCard } from './ApprovalCard';
import type { MessageRow } from '@/lib/api';

interface Props {
  messages: MessageRow[];
}

export function PendingApprovalsHero({ messages }: Props) {
  const pendingAll = useMemo(
    () => messages.filter((m) => m.status === 'pending_approval'),
    [messages],
  );

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = pendingAll.filter((m) => !dismissed.has(m.id));
  const shown = visible.slice(0, 3);
  const remaining = visible.length - shown.length;

  const dismiss = (id: string) =>
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  if (pendingAll.length === 0) {
    return (
      <section className="editorial-container pb-10">
        <div
          style={{
            borderTop: '1.5px solid var(--hairline-strong)',
            borderBottom: '1.5px solid var(--hairline-strong)',
          }}
        >
          <EmptyState
            title="Inbox clear."
            hint="No messages waiting on your approval. Want to schedule a reactivation for dormant guests?"
            cta={{ label: 'Go to templates', href: '/templates' }}
          />
        </div>
      </section>
    );
  }

  return (
    <section
      className="editorial-container pt-8 pb-14"
      style={{ borderTop: '1.5px solid var(--hairline-strong)' }}
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
        <div>
          <SectionLabel tone="accent" className="mb-2">
            Inbox · Needs action
          </SectionLabel>
          <h2
            style={{
              fontFamily: 'var(--font-kaszek-display), "Archivo Black", system-ui, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(1.35rem, 1.9vw, 1.75rem)',
              letterSpacing: '-0.03em',
              color: 'var(--fg)',
              lineHeight: 1.1,
            }}
          >
            <span
              className="italic tabular-nums"
              style={{ fontFamily: 'var(--font-kaszek-italic-serif), "Fraunces", Georgia, serif' }}
            >
              {visible.length}
            </span>{' '}
            messages waiting on your approval.
          </h2>
        </div>
        {remaining > 0 && (
          <Link
            href="/messages?status=pending_approval"
            className="inline-flex items-center gap-2 text-[10.5px] uppercase font-[600] px-4 py-2 transition-colors self-start md:self-auto k-outline-cta"
            style={{
              letterSpacing: '0.16em',
              border: '1px solid var(--fg)',
              color: 'var(--fg)',
              fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
            }}
          >
            See the remaining {remaining}
            <span aria-hidden>→</span>
          </Link>
        )}
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5"
        role="list"
        aria-label={`${visible.length} messages pending approval`}
      >
        <AnimatePresence mode="popLayout">
          {shown.map((m) => (
            <div role="listitem" key={m.id}>
              <ApprovalCard message={m} onApprove={dismiss} onPass={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
