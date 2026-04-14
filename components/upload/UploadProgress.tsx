import { ProgressBar } from '@/components/ui/ProgressBar';
import { Numeral } from '@/components/ui/Numeral';
import { Label } from '@/components/ui/Label';

export function UploadProgress({
  processed,
  total,
  status,
}: {
  processed: number;
  total: number;
  status: string;
}) {
  return (
    <div className="border border-hairline p-10 bg-bg-raised">
      <Label className="mb-4">{status}</Label>
      <div className="flex items-end justify-between mb-4">
        <div className="font-mono text-4xl text-fg tabular-nums">
          <Numeral value={processed} />
        </div>
        <div className="font-mono text-sm text-fg-subtle tabular-nums">
          de <Numeral value={total} /> filas
        </div>
      </div>
      <ProgressBar value={processed} max={total} />
    </div>
  );
}
