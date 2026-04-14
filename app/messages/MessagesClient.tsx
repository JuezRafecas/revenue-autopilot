'use client';

import { useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Label } from '@/components/ui/Label';
import { Numeral } from '@/components/ui/Numeral';
import { FilterBar, type FilterOption } from '@/components/ui/FilterBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { MessageInboxHeader, MessageInboxRow } from '@/components/messages/MessageInboxRow';
import type { MessageStatus } from '@/lib/types';
import type { MessageRow } from '@/lib/api';

type Scope = 'all' | 'pending' | 'converted' | 'sent';

const SCOPE_MATCH: Record<Scope, (s: MessageStatus) => boolean> = {
  all: () => true,
  pending: (s) => s === 'pending_approval',
  converted: (s) => s === 'converted',
  sent: (s) => ['sent', 'delivered', 'read', 'responded'].includes(s),
};

export function MessagesClient({
  messages,
  pendingCount,
}: {
  messages: MessageRow[];
  pendingCount?: number;
}) {
  const [scope, setScope] = useState<Scope>('all');

  const counts = useMemo(() => {
    const all = messages.length;
    const pending = messages.filter((m) => SCOPE_MATCH.pending(m.status)).length;
    const converted = messages.filter((m) => SCOPE_MATCH.converted(m.status)).length;
    const sent = messages.filter((m) => SCOPE_MATCH.sent(m.status)).length;
    return { all, pending, converted, sent };
  }, [messages]);

  const revenue = useMemo(
    () => messages.reduce((acc, m) => acc + (m.realized_revenue ?? 0), 0),
    [messages]
  );

  const filtered = useMemo(
    () => messages.filter((m) => SCOPE_MATCH[scope](m.status)),
    [scope, messages]
  );

  const filterOptions: FilterOption[] = [
    { value: 'all', label: 'All', count: counts.all },
    { value: 'pending', label: 'Pending', count: counts.pending, dot: 'var(--accent)' },
    { value: 'sent', label: 'Sent', count: counts.sent, dot: 'var(--segment-active)' },
    { value: 'converted', label: 'Converted', count: counts.converted, dot: 'var(--k-green, #0e5e48)' },
  ];

  return (
    <AppShell pendingCount={pendingCount ?? counts.pending}>
      <Header title="Approval inbox" subtitle="Messages" />

      <section className="editorial-container section-pt-lead section-pb-close">
        <Label className="mb-3">Messages</Label>
        <h1
          className="font-display text-[clamp(2rem,5vw,4.5rem)] leading-[0.95] text-fg max-w-[22ch]"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
        >
          <span className="italic">{counts.pending}</span> awaiting your approval.
        </h1>
      </section>

      <section className="editorial-container pb-10">
        <div
          className="grid grid-cols-3"
          style={{
            borderTop: '1.5px solid var(--hairline-strong)',
            borderBottom: '1.5px solid var(--hairline-strong)',
          }}
        >
          <Stat label="Pending" value={counts.pending} tone={counts.pending > 0 ? 'warning' : undefined} borderRight />
          <Stat label="Converted today" value={counts.converted} borderRight />
          <Stat label="Revenue today" value={revenue} format="ars" accent />
        </div>
      </section>

      <section className="editorial-container pb-5">
        <FilterBar
          label="Filter messages"
          options={filterOptions}
          value={scope}
          onChange={(v) => setScope(v as Scope)}
        />
      </section>

      <section className="editorial-container pb-24">
        <MessageInboxHeader />
        {filtered.length === 0 ? (
          <EmptyState
            title="Inbox clear."
            hint={
              scope === 'pending'
                ? 'Nothing awaiting approval. The system will notify you when something new comes in.'
                : 'No messages match this filter.'
            }
          />
        ) : (
          filtered.map((m) => (
            <MessageInboxRow
              key={m.id}
              id={m.id}
              guestName={m.guest_name}
              campaignName={m.campaign_name}
              channel={m.channel}
              preview={m.content}
              status={m.status}
              createdAt={m.created_at}
              revenue={m.realized_revenue ?? undefined}
            />
          ))
        )}
      </section>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  format,
  accent,
  tone,
  borderRight,
}: {
  label: string;
  value: number;
  format?: 'ars';
  accent?: boolean;
  tone?: 'warning';
  borderRight?: boolean;
}) {
  return (
    <div
      className="px-6 py-8 md:px-8 md:py-10"
      style={{ borderRight: borderRight ? '1px solid var(--hairline)' : undefined }}
    >
      <Label className="mb-3">{label}</Label>
      <div
        className="font-mono text-2xl md:text-3xl lg:text-4xl tabular-nums"
        style={{
          color: accent
            ? 'var(--accent)'
            : tone === 'warning'
              ? 'var(--accent-dim)'
              : 'var(--fg)',
          fontWeight: accent ? 600 : 400,
        }}
      >
        <Numeral value={value} format={format === 'ars' ? 'ars' : 'plain'} />
      </div>
    </div>
  );
}
