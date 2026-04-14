'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Numeral } from '@/components/ui/Numeral';
import { SegmentBadge } from '@/components/ui/Badge';
import { MessagePreview } from './MessagePreview';
import type { Segment } from '@/lib/types';

interface Props {
  guestName: string;
  segment: Segment;
  totalVisits: number;
  daysSinceLast: number;
  estimatedRevenue: number;
  message: string;
  onApprove?: () => void;
  onRegenerate?: () => void;
}

export function ActionPanel({
  guestName,
  segment,
  totalVisits,
  daysSinceLast,
  estimatedRevenue,
  message,
  onApprove,
  onRegenerate,
}: Props) {
  const [status, setStatus] = useState<'pending' | 'approved'>('pending');

  const handleApprove = () => {
    setStatus('approved');
    onApprove?.();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-12 border border-hairline p-10 bg-bg">
      {/* Left: context */}
      <div>
        <div className="mb-4">
          <SegmentBadge segment={segment} />
        </div>
        <h2
          className="font-display text-4xl text-fg mb-8 leading-tight"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
        >
          {guestName}
        </h2>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-hairline pt-6">
          <div>
            <Label className="mb-2">Visits</Label>
            <div className="font-mono text-2xl text-fg">
              <Numeral value={totalVisits} />
            </div>
          </div>
          <div>
            <Label className="mb-2">Last</Label>
            <div className="font-mono text-2xl text-fg">
              {daysSinceLast}
              <span className="text-xs text-fg-subtle ml-1">days ago</span>
            </div>
          </div>
          <div className="col-span-2 pt-4 border-t border-hairline">
            <Label className="mb-2">Estimated revenue</Label>
            <div className="font-mono text-3xl text-accent">
              <Numeral value={estimatedRevenue} format="ars" animated />
            </div>
          </div>
        </dl>

        <div className="mt-10 flex items-center gap-3">
          {status === 'pending' ? (
            <>
              <Button variant="primary" onClick={handleApprove}>
                Approve and send
              </Button>
              <Button variant="ghost" onClick={onRegenerate}>
                Regenerate
              </Button>
            </>
          ) : (
            <div className="font-mono text-[11px] uppercase tracking-label text-segment-active">
              ✓ Approved · sending
            </div>
          )}
        </div>
      </div>

      {/* Right: preview */}
      <MessagePreview message={message} recipientName={guestName} />
    </div>
  );
}
