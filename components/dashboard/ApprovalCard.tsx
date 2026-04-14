'use client';

import { motion } from 'framer-motion';
import { Numeral } from '@/components/ui/Numeral';
import { DEFAULT_RESTAURANT } from '@/lib/constants';
import type { MessageRow } from '@/lib/api';

interface Props {
  message: MessageRow;
  onApprove: (id: string) => void;
  onPass: (id: string) => void;
}

function channelLabel(c: MessageRow['channel']) {
  return c === 'whatsapp' ? 'WhatsApp' : c === 'email' ? 'Email' : 'WA → Email';
}

function timeAgo(iso: string) {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} d ago`;
}

/**
 * "Why" chip: inferred from the campaign name while the backend
 * doesn't hydrate trigger/context on MessageRow. Translates commercial
 * intent into a short line the owner can scan.
 */
function buildTrigger(campaignName: string): string | null {
  const n = campaignName.toLowerCase();
  if (n.includes('reactiv') || n.includes('dormid')) return 'Dormant · recover';
  if (n.includes('post') || n.includes('gracias')) return 'Post-visit · reinforce';
  if (n.includes('segunda') || n.includes('primera')) return '1st visit · bring back the 2nd';
  if (n.includes('evento') || n.includes('experiencia')) return 'Event · invite';
  if (n.includes('mesa') || n.includes('ocupaci')) return 'Empty table · fill';
  return null;
}

function expectedRevenue(message: MessageRow): number {
  if (message.estimated_revenue != null && message.estimated_revenue > 0) {
    return message.estimated_revenue;
  }
  return DEFAULT_RESTAURANT.avg_ticket;
}

export function ApprovalCard({ message, onApprove, onPass }: Props) {
  const isWhatsApp = message.channel === 'whatsapp' || message.channel === 'whatsapp_then_email';
  const trigger = buildTrigger(message.campaign_name);
  const expected = expectedRevenue(message);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.22 } }}
      transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
      className="relative flex flex-col gap-4 p-5 md:p-6"
      style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--hairline-strong)',
      }}
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: 'var(--accent)' }}
      />

      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className="truncate"
            style={{
              fontFamily: 'var(--font-kaszek-display), "Archivo Black", system-ui, sans-serif',
              fontWeight: 800,
              fontSize: '1.15rem',
              letterSpacing: '-0.025em',
              color: 'var(--fg)',
              lineHeight: 1.1,
            }}
          >
            {message.guest_name}
          </h3>
          <div
            className="mt-1 text-[10px] uppercase truncate"
            style={{
              letterSpacing: '0.16em',
              color: 'var(--k-green, #0e5e48)',
              fontWeight: 600,
              fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
            }}
          >
            {message.campaign_name}
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          <ChannelBadge isWhatsApp={isWhatsApp} label={channelLabel(message.channel)} />
          <div
            className="text-[9.5px] uppercase font-mono tabular-nums"
            style={{ letterSpacing: '0.08em', color: 'var(--fg-subtle)' }}
          >
            {timeAgo(message.created_at)}
          </div>
        </div>
      </header>

      {trigger && (
        <div
          className="inline-flex items-center gap-2 self-start px-2.5 py-1 text-[10px] uppercase font-[600]"
          style={{
            letterSpacing: '0.14em',
            color: 'var(--fg)',
            background: 'var(--bg-sunken)',
            border: '1px solid var(--hairline-strong)',
            fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
          }}
        >
          <span aria-hidden style={{ color: 'var(--accent)' }}>◆</span>
          {trigger}
        </div>
      )}

      <div className="relative">
        <p
          className="text-[13px] leading-snug line-clamp-3"
          style={{ color: 'var(--fg-muted)' }}
        >
          {message.content}
        </p>
        {message.content && message.content.length > 140 && (
          <span
            className="text-[10px] uppercase font-mono mt-1 inline-block"
            style={{ color: 'var(--fg-subtle)', letterSpacing: '0.1em' }}
          >
            ver mensaje completo →
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 mt-auto pt-1 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onApprove(message.id)}
            aria-label={`Approve message for ${message.guest_name}`}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-[10.5px] uppercase font-[600] transition-opacity hover:opacity-90"
            style={{
              letterSpacing: '0.16em',
              border: '1px solid var(--fg)',
              color: 'var(--bg)',
              background: 'var(--fg)',
              fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
            }}
          >
            Approve <span aria-hidden>→</span>
          </button>
          <button
            type="button"
            onClick={() => onPass(message.id)}
            aria-label={`Pass on message for ${message.guest_name}`}
            className="inline-flex items-center h-8 px-3 text-[10.5px] uppercase font-[600] transition-colors"
            style={{
              letterSpacing: '0.16em',
              border: '1px solid var(--hairline-strong)',
              color: 'var(--fg-muted)',
              background: 'transparent',
              fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
            }}
          >
            Pass
          </button>
        </div>
        <div
          className="text-right"
          aria-label={`Expected revenue on approval`}
        >
          <div
            className="tabular-nums"
            style={{
              fontFamily: 'var(--font-kaszek-display), "Archivo Black", system-ui, sans-serif',
              fontWeight: 800,
              fontSize: '1.05rem',
              letterSpacing: '-0.025em',
              color: 'var(--k-green, #0e5e48)',
              lineHeight: 1,
            }}
          >
            +<Numeral value={expected} format="ars" />
          </div>
          <div
            className="text-[9px] uppercase mt-0.5"
            style={{ letterSpacing: '0.16em', color: 'var(--fg-subtle)' }}
          >
            expected
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ChannelBadge({ isWhatsApp, label }: { isWhatsApp: boolean; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-1.5 py-0.5 text-[9.5px] uppercase font-[600]"
      style={{
        letterSpacing: '0.12em',
        color: isWhatsApp ? 'var(--bg)' : 'var(--fg-muted)',
        background: isWhatsApp ? 'var(--k-green, #0e5e48)' : 'transparent',
        border: isWhatsApp ? 'none' : '1px solid var(--hairline-strong)',
        fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
      }}
    >
      {isWhatsApp && (
        <span aria-hidden style={{ fontSize: 10, lineHeight: 1 }}>
          ●
        </span>
      )}
      {label}
    </span>
  );
}
