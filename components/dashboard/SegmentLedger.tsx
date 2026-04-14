import { SegmentRow } from './SegmentRow';
import { Label } from '@/components/ui/Label';
import type { SegmentSummary } from '@/lib/types';
import { SEGMENT_ORDER } from '@/lib/constants';

export function SegmentLedger({ summaries }: { summaries: SegmentSummary[] }) {
  const ordered = SEGMENT_ORDER
    .map((seg) => summaries.find((s) => s.segment === seg))
    .filter((s): s is SegmentSummary => Boolean(s));

  return (
    <section className="border-t border-hairline">
      <header className="grid grid-cols-[minmax(0,1fr)_110px_80px_180px_auto] items-end gap-8 pl-8 pr-6 pt-4 pb-3">
        <Label>Segmento</Label>
        <Label className="text-right">Volumen</Label>
        <Label className="text-right">Tendencia</Label>
        <Label className="text-right">Oportunidad</Label>
        <Label className="text-right">Acción</Label>
      </header>
      <div className="border-t border-hairline">
        {ordered.map((summary, i) => (
          <SegmentRow key={summary.segment} summary={summary} index={i} />
        ))}
      </div>
    </section>
  );
}
