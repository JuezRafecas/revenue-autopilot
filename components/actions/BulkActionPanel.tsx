'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Numeral } from '@/components/ui/Numeral';
import { MessagePreview } from './MessagePreview';

interface Preview {
  name: string;
  message: string;
}

interface Props {
  segmentLabel: string;
  guestCount: number;
  estimatedRevenue: number;
  previews: Preview[];
}

export function BulkActionPanel({
  segmentLabel,
  guestCount,
  estimatedRevenue,
  previews,
}: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSend = () => {
    setStatus('sending');
    setTimeout(() => setStatus('sent'), 1200);
  };

  return (
    <aside className="border border-hairline bg-bg-raised p-10 sticky top-10">
      <Label className="mb-3">Acción Masiva</Label>
      <h2
        className="font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] text-fg max-w-[18ch]"
        style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
      >
        Accionar sobre{' '}
        <span className="font-mono text-accent not-italic tabular-nums">{guestCount}</span>{' '}
        <span className="italic">{segmentLabel.toLowerCase()}</span>
      </h2>

      <div className="mt-8 pt-6 border-t border-hairline">
        <Label className="mb-2">Revenue estimado</Label>
        <div className="font-mono text-4xl text-accent">
          <Numeral value={estimatedRevenue} format="ars" animated />
        </div>
        <p
          className="mt-4 font-display italic text-sm text-fg-muted max-w-[32ch]"
          style={{ fontVariationSettings: '"opsz" 14' }}
        >
          basado en una tasa de conversión histórica y el ticket promedio de la casa.
        </p>
      </div>

      <div className="mt-10">
        <Label className="mb-4">Previews generados</Label>
        <div className="space-y-3">
          {previews.slice(0, 2).map((p, i) => (
            <div key={i} className="border border-hairline p-4 bg-bg">
              <div
                className="font-display text-sm text-fg-muted mb-2"
                style={{ fontVariationSettings: '"opsz" 14' }}
              >
                {p.name}
              </div>
              <p className="font-sans text-[13px] text-fg leading-relaxed">{p.message}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        {status === 'idle' && (
          <Button variant="primary" size="lg" className="w-full" onClick={handleSend}>
            Aprobar · enviar los {guestCount}
          </Button>
        )}
        {status === 'sending' && (
          <Button variant="primary" size="lg" className="w-full" disabled>
            Enviando…
          </Button>
        )}
        {status === 'sent' && (
          <div className="text-center font-mono text-[11px] uppercase tracking-label text-segment-active py-4 border border-segment-active/30">
            ✓ {guestCount} mensajes en camino
          </div>
        )}
      </div>
    </aside>
  );
}
