import { cn } from '@/lib/cn';
import type { Message, MessageStatus } from '@/lib/types';
import { Label } from '@/components/ui/Label';
import { formatARS } from '@/lib/constants';

const STATUS_LABEL: Record<MessageStatus, string> = {
  pending_approval: 'Awaiting approval',
  approved: 'Approved',
  queued: 'Queued',
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
  responded: 'Responded',
  converted: 'Converted',
  failed: 'Failed',
  skipped: 'Skipped',
};

/* AA-compliant tokens: each status pairs a dot color with a readable text color on cream. */
const STATUS_TOKENS: Record<
  MessageStatus,
  { dot: string; text: string; weight?: number }
> = {
  pending_approval: { dot: 'var(--accent)', text: 'var(--accent-dim)', weight: 600 },
  approved:         { dot: 'var(--segment-new)', text: 'var(--fg)' },
  queued:           { dot: 'var(--fg-faint)', text: 'var(--fg-muted)' },
  sent:             { dot: 'var(--fg-faint)', text: 'var(--fg-muted)' },
  delivered:        { dot: 'var(--segment-active)', text: 'var(--fg)' },
  read:             { dot: 'var(--segment-active)', text: 'var(--fg)' },
  responded:        { dot: 'var(--segment-active)', text: 'var(--k-green, #0e5e48)', weight: 600 },
  converted:        { dot: 'var(--accent)', text: 'var(--k-green, #0e5e48)', weight: 700 },
  failed:           { dot: 'var(--segment-dormant)', text: 'var(--accent-dim)', weight: 600 },
  skipped:          { dot: 'var(--fg-faint)', text: 'var(--fg-subtle)' },
};

interface Props {
  id: string;
  guestName: string;
  campaignName: string;
  channel: Message['channel'];
  preview: string;
  status: MessageStatus;
  createdAt: string;
  revenue?: number;
  onApprove?: (id: string) => void;
  onSkip?: (id: string) => void;
}

export function MessageInboxRow({
  id,
  guestName,
  campaignName,
  channel,
  preview,
  status,
  createdAt,
  revenue,
  onApprove,
  onSkip,
}: Props) {
  const when = new Date(createdAt).toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  const tokens = STATUS_TOKENS[status];
  const pending = status === 'pending_approval';

  return (
    <div
      className={cn(
        'group relative grid items-center gap-4 pl-6 pr-6 py-5 border-b border-hairline transition-colors duration-150',
        'grid-cols-[minmax(0,1fr)_110px] md:grid-cols-[minmax(0,1.5fr)_minmax(0,2.2fr)_120px_130px_140px]',
        'hover:bg-bg-raised focus-within:bg-bg-raised'
      )}
    >
      {pending && (
        <span
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ background: 'var(--accent)' }}
        />
      )}

      <div className="min-w-0">
        <div
          className="font-display text-[17px] text-fg leading-tight truncate"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
        >
          {guestName}
        </div>
        <div className="text-[10px] uppercase tracking-label text-fg-subtle mt-1 truncate">
          {campaignName}
        </div>
        {/* Mobile-only preview below name */}
        <div className="md:hidden font-sans text-[13px] text-fg-muted leading-snug mt-2 line-clamp-2">
          {preview}
        </div>
      </div>

      <div className="hidden md:block font-sans text-[13px] text-fg-muted leading-snug truncate">
        {preview}
      </div>

      <div className="hidden md:block text-[10px] uppercase tracking-label text-fg-subtle">
        {channel === 'whatsapp' ? 'WhatsApp' : channel === 'email' ? 'Email' : 'WA → Email'}
      </div>

      <div
        className="hidden md:flex items-center gap-2 text-[11px] uppercase tracking-label"
        style={{ color: tokens.text, fontWeight: tokens.weight ?? 500 }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{ background: tokens.dot }}
          aria-hidden
        />
        {STATUS_LABEL[status]}
      </div>

      <div className="text-right md:text-right relative">
        {/* Revenue or timestamp when not hovered + not pending */}
        {pending ? (
          <div className="hidden md:flex items-center justify-end gap-1.5 opacity-100 md:group-hover:opacity-0 md:group-focus-within:opacity-0 transition-opacity">
            <span
              className="font-mono text-[11px] uppercase"
              style={{ letterSpacing: '0.14em', color: 'var(--accent-dim)', fontWeight: 600 }}
            >
              Approve
            </span>
            <span aria-hidden style={{ color: 'var(--accent-dim)' }}>→</span>
          </div>
        ) : revenue != null && revenue > 0 ? (
          <div className="font-mono text-[13px] text-accent tabular-nums font-semibold">
            {formatARS(revenue)}
          </div>
        ) : (
          <div className="font-mono text-[11px] text-fg-subtle tabular-nums">{when}</div>
        )}

        {/* Hover/focus actions for pending messages */}
        {pending && (
          <div className="hidden md:flex absolute inset-0 items-center justify-end gap-1.5 opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity">
            <button
              type="button"
              aria-label={`Skip message for ${guestName}`}
              className="h-7 px-2.5 text-[10px] uppercase font-[600] transition-colors"
              onClick={() => onSkip?.(id)}
              style={{
                letterSpacing: '0.14em',
                border: '1px solid var(--hairline-strong)',
                color: 'var(--fg-muted)',
                background: 'var(--bg-raised)',
                fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
              }}
            >
              Skip
            </button>
            <button
              type="button"
              aria-label={`Approve message for ${guestName}`}
              className="h-7 px-2.5 text-[10px] uppercase font-[600] transition-colors hover:opacity-90"
              onClick={() => onApprove?.(id)}
              style={{
                letterSpacing: '0.14em',
                border: '1px solid var(--fg)',
                color: 'var(--bg)',
                background: 'var(--fg)',
                fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
              }}
            >
              Approve →
            </button>
          </div>
        )}
      </div>

      {/* Mobile status + action cluster */}
      <div className="md:hidden col-span-2 flex items-center justify-between gap-3 mt-2">
        <div
          className="flex items-center gap-2 text-[11px] uppercase tracking-label"
          style={{ color: tokens.text, fontWeight: tokens.weight ?? 500 }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full shrink-0"
            style={{ background: tokens.dot }}
            aria-hidden
          />
          {STATUS_LABEL[status]}
          <span className="text-fg-subtle" style={{ fontWeight: 400 }}>· {channel === 'whatsapp' ? 'WA' : channel === 'email' ? 'Email' : 'WA→Email'}</span>
        </div>
        {pending ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label={`Skip message for ${guestName}`}
              className="h-7 px-2.5 text-[10px] uppercase font-[600]"
              onClick={() => onSkip?.(id)}
              style={{
                letterSpacing: '0.14em',
                border: '1px solid var(--hairline-strong)',
                color: 'var(--fg-muted)',
                background: 'var(--bg-raised)',
              }}
            >
              Skip
            </button>
            <button
              type="button"
              aria-label={`Approve message for ${guestName}`}
              className="h-7 px-2.5 text-[10px] uppercase font-[600]"
              onClick={() => onApprove?.(id)}
              style={{
                letterSpacing: '0.14em',
                border: '1px solid var(--fg)',
                color: 'var(--bg)',
                background: 'var(--fg)',
              }}
            >
              Approve →
            </button>
          </div>
        ) : revenue != null && revenue > 0 ? (
          <div className="font-mono text-[12px] text-accent tabular-nums font-semibold">
            {formatARS(revenue)}
          </div>
        ) : (
          <div className="font-mono text-[10px] text-fg-subtle tabular-nums">{when}</div>
        )}
      </div>
    </div>
  );
}

export function MessageInboxHeader() {
  return (
    <div className="hidden md:grid grid-cols-[minmax(0,1.5fr)_minmax(0,2.2fr)_120px_130px_140px] gap-4 pl-6 pr-6 py-3 border-y border-hairline">
      <Label>Guest</Label>
      <Label>Preview</Label>
      <Label>Channel</Label>
      <Label>Status</Label>
      <Label className="text-right">Action · Revenue</Label>
    </div>
  );
}
