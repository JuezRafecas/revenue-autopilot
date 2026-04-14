'use client';

import { useMemo, useState, useCallback, useTransition } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Label } from '@/components/ui/Label';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { FilterBar, type FilterOption } from '@/components/ui/FilterBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Numeral } from '@/components/ui/Numeral';
import { ApprovalCard } from '@/components/dashboard/ApprovalCard';
import {
  MessageInboxRow,
  MessageInboxHeader,
} from '@/components/messages/MessageInboxRow';
import { formatARS } from '@/lib/constants';
import type { MessageRow } from '@/lib/api';
import type { MessageStatus } from '@/lib/types';

type StatusFilter = 'all' | 'pending_approval' | 'in_flight' | 'delivered' | 'converted' | 'failed';

const FILTER_GROUPS: { value: StatusFilter; label: string; statuses: MessageStatus[] }[] = [
  { value: 'all', label: 'All', statuses: [] },
  { value: 'pending_approval', label: 'Pending', statuses: ['pending_approval'] },
  { value: 'in_flight', label: 'In flight', statuses: ['approved', 'queued', 'sent'] },
  { value: 'delivered', label: 'Delivered', statuses: ['delivered', 'read', 'responded'] },
  { value: 'converted', label: 'Converted', statuses: ['converted'] },
  { value: 'failed', label: 'Failed', statuses: ['failed', 'skipped'] },
];

function matchesFilter(status: MessageStatus, filter: StatusFilter): boolean {
  if (filter === 'all') return true;
  const group = FILTER_GROUPS.find((g) => g.value === filter);
  return group ? group.statuses.includes(status) : false;
}

export function MessagesClient({ messages: initial }: { messages: MessageRow[] }) {
  const [messages, setMessages] = useState(initial);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const sorted = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [messages],
  );

  const pendingMessages = useMemo(
    () => sorted.filter((m) => m.status === 'pending_approval' && !dismissed.has(m.id)),
    [sorted, dismissed],
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: sorted.length };
    for (const group of FILTER_GROUPS) {
      if (group.value === 'all') continue;
      map[group.value] = sorted.filter((m) => group.statuses.includes(m.status)).length;
    }
    return map;
  }, [sorted]);

  const filtered = useMemo(
    () => sorted.filter((m) => matchesFilter(m.status, statusFilter)),
    [sorted, statusFilter],
  );

  const filterOptions: FilterOption[] = FILTER_GROUPS
    .filter((g) => g.value === 'all' || counts[g.value] > 0)
    .map((g) => ({
      value: g.value,
      label: g.label,
      count: g.value === 'all' ? counts.all : counts[g.value],
      dot:
        g.value === 'pending_approval'
          ? 'var(--accent)'
          : g.value === 'converted'
            ? 'var(--k-green, #0e5e48)'
            : g.value === 'failed'
              ? 'var(--segment-dormant)'
              : undefined,
    }));

  const totalRevenue = useMemo(
    () =>
      sorted.reduce(
        (sum, m) => sum + (m.realized_revenue != null && m.realized_revenue > 0 ? m.realized_revenue : 0),
        0,
      ),
    [sorted],
  );

  const convertedCount = useMemo(
    () => sorted.filter((m) => m.status === 'converted').length,
    [sorted],
  );

  const deliveredCount = useMemo(
    () => sorted.filter((m) => ['delivered', 'read', 'responded', 'converted'].includes(m.status)).length,
    [sorted],
  );

  const handleApprove = useCallback(
    async (id: string) => {
      setDismissed((prev) => new Set(prev).add(id));
      try {
        const res = await fetch(`/api/messages/${id}/approve`, { method: 'POST' });
        if (res.ok) {
          startTransition(() => {
            setMessages((prev) =>
              prev.map((m) => (m.id === id ? { ...m, status: 'approved' as MessageStatus } : m)),
            );
          });
        }
      } catch {
        /* optimistic — already dismissed from pending view */
      }
    },
    [],
  );

  const handleSkip = useCallback(
    async (id: string) => {
      setDismissed((prev) => new Set(prev).add(id));
      try {
        const res = await fetch(`/api/messages/${id}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'skipped from inbox' }),
        });
        if (res.ok) {
          startTransition(() => {
            setMessages((prev) =>
              prev.map((m) => (m.id === id ? { ...m, status: 'skipped' as MessageStatus } : m)),
            );
          });
        }
      } catch {
        /* optimistic */
      }
    },
    [],
  );

  const handleRowApprove = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/messages/${id}/approve`, { method: 'POST' });
        if (res.ok) {
          startTransition(() => {
            setMessages((prev) =>
              prev.map((m) => (m.id === id ? { ...m, status: 'approved' as MessageStatus } : m)),
            );
          });
        }
      } catch {
        /* silent */
      }
    },
    [],
  );

  const handleRowSkip = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/messages/${id}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'skipped from inbox' }),
        });
        if (res.ok) {
          startTransition(() => {
            setMessages((prev) =>
              prev.map((m) => (m.id === id ? { ...m, status: 'skipped' as MessageStatus } : m)),
            );
          });
        }
      } catch {
        /* silent */
      }
    },
    [],
  );

  const showPendingHero = pendingMessages.length > 0;
  const pendingShown = pendingMessages.slice(0, 3);
  const pendingRemaining = pendingMessages.length - pendingShown.length;

  return (
    <>
      <Header />

      {/* ── Hero section ── */}
      <section className="editorial-container section-pt-lead">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-2">
          <div>
            <Label className="mb-3">Messages</Label>
            <h1
              className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] text-fg"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              Inbox
            </h1>
          </div>
          {/* ── Summary stats ── */}
          {sorted.length > 0 && (
            <div
              className="flex items-center gap-0 divide-x divide-hairline self-start md:self-end"
              style={{ border: '1px solid var(--hairline)' }}
            >
              <StatCell label="Total" value={sorted.length} />
              <StatCell label="Delivered" value={deliveredCount} />
              <StatCell label="Converted" value={convertedCount} color="var(--k-green, #0e5e48)" />
              {totalRevenue > 0 && (
                <StatCell label="Revenue" text={formatARS(totalRevenue)} color="var(--k-green, #0e5e48)" />
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Pending approval cards ── */}
      {showPendingHero && (
        <section
          className="editorial-container pt-10 pb-10"
          style={{ borderTop: '1.5px solid var(--hairline-strong)' }}
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
            <div>
              <SectionLabel tone="accent" className="mb-2">
                Needs your approval
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
                  style={{
                    fontFamily: 'var(--font-display), Georgia, serif',
                  }}
                >
                  {pendingMessages.length}
                </span>{' '}
                message{pendingMessages.length === 1 ? '' : 's'} waiting.
              </h2>
            </div>
            {pendingRemaining > 0 && (
              <span
                className="inline-flex items-center gap-2 text-[11px] uppercase font-[600] px-4 py-2 self-start md:self-auto"
                style={{
                  letterSpacing: '0.16em',
                  border: '1px solid var(--fg)',
                  color: 'var(--fg)',
                  fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
                }}
              >
                +{pendingRemaining} more
              </span>
            )}
          </div>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5"
            role="list"
            aria-label={`${pendingMessages.length} messages pending approval`}
          >
            <AnimatePresence mode="popLayout">
              {pendingShown.map((m) => (
                <div role="listitem" key={m.id}>
                  <ApprovalCard
                    message={m}
                    onApprove={handleApprove}
                    onPass={handleSkip}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* ── Full inbox list ── */}
      <section
        className="editorial-container pt-10 pb-24"
        style={{ borderTop: '1.5px solid var(--hairline-strong)' }}
      >
        <SectionLabel tone="subtle" className="mb-5">
          All messages
        </SectionLabel>

        <FilterBar
          options={filterOptions}
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as StatusFilter)}
          className="mb-6"
        />

        {filtered.length === 0 ? (
          <EmptyState
            title={statusFilter === 'all' ? 'No messages yet' : 'Nothing here'}
            hint={
              statusFilter === 'all'
                ? 'Messages generated by campaigns will appear here for review.'
                : statusFilter === 'pending_approval'
                  ? 'All caught up. No messages waiting for your approval.'
                  : statusFilter === 'converted'
                    ? 'No conversions yet. Approve some pending messages to start driving revenue.'
                    : 'No messages match this filter.'
            }
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            style={{
              border: '1px solid var(--hairline)',
            }}
          >
            <MessageInboxHeader />
            <AnimatePresence initial={false}>
              {filtered.map((m) => (
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
                  onApprove={handleRowApprove}
                  onSkip={handleRowSkip}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </>
  );
}

/* ── Stat cell for the header strip ── */
function StatCell({
  label,
  value,
  text,
  color,
}: {
  label: string;
  value?: number;
  text?: string;
  color?: string;
}) {
  return (
    <div className="px-4 py-2.5 md:px-5 md:py-3">
      <div
        className="text-[9px] uppercase font-mono mb-0.5"
        style={{ letterSpacing: '0.14em', color: 'var(--fg-subtle)' }}
      >
        {label}
      </div>
      <div
        className="font-mono text-[15px] md:text-[17px] tabular-nums font-semibold leading-none"
        style={{ color: color ?? 'var(--fg)' }}
      >
        {text ?? value?.toLocaleString('es-AR') ?? '—'}
      </div>
    </div>
  );
}
