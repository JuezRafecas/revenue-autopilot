import { Label } from '@/components/ui/Label';
import { Numeral } from '@/components/ui/Numeral';
import { SegmentBadge } from '@/components/ui/Badge';
import type { Segment } from '@/lib/types';

interface Visit {
  id: string;
  date: string;
  party_size: number;
  amount: number;
  sector: string;
  shift: string;
  outcome: string;
  score: number | null;
}

interface Props {
  name: string;
  segment: Segment;
  total_visits: number;
  days_since_last: number;
  avg_score: number | null;
  total_spent: number;
  avg_party_size: number;
  preferred_sector: string;
  preferred_day: string;
  visits: Visit[];
}

export function GuestProfile({
  name,
  segment,
  total_visits,
  days_since_last,
  avg_score,
  total_spent,
  avg_party_size,
  preferred_sector,
  preferred_day,
  visits,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,380px)_1fr] gap-16">
      {/* Left: identity + metrics */}
      <aside className="md:sticky md:top-12 md:self-start">
        <div className="mb-4">
          <SegmentBadge segment={segment} />
        </div>
        <h1
          className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[0.95] text-fg mb-10"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
        >
          {name}
        </h1>

        <dl className="grid grid-cols-2 gap-x-8 gap-y-8 border-t border-hairline pt-8">
          <Metric label="Visitas" value={<Numeral value={total_visits} size="xl" />} />
          <Metric
            label="Última"
            value={
              <span className="font-mono text-4xl tabular-nums">
                {days_since_last}
                <span className="text-sm text-fg-subtle ml-1">d</span>
              </span>
            }
          />
          <Metric
            label="Gastado"
            value={<Numeral value={total_spent} format="ars" size="lg" className="text-accent" />}
          />
          <Metric
            label="Score"
            value={
              avg_score != null ? (
                <Numeral value={avg_score} decimals={1} size="xl" />
              ) : (
                <span className="font-mono text-4xl text-fg-subtle">—</span>
              )
            }
          />
          <Metric
            label="Mesa habitual"
            value={
              <span
                className="font-display italic text-2xl text-fg"
                style={{ fontVariationSettings: '"opsz" 144' }}
              >
                {preferred_sector}
              </span>
            }
          />
          <Metric
            label="Día preferido"
            value={
              <span
                className="font-display italic text-2xl text-fg capitalize"
                style={{ fontVariationSettings: '"opsz" 144' }}
              >
                {preferred_day}
              </span>
            }
          />
          <Metric
            label="Grupo"
            value={
              <span className="font-mono text-4xl tabular-nums">
                {avg_party_size.toFixed(1)}
                <span className="text-sm text-fg-subtle ml-1">pers</span>
              </span>
            }
          />
        </dl>
      </aside>

      {/* Right: timeline */}
      <section>
        <Label className="mb-6">Historial de Visitas</Label>
        <ol className="relative border-l border-hairline pl-8">
          {visits.map((v, i) => (
            <li key={v.id} className="relative pb-10 last:pb-0">
              <span className="absolute -left-[33px] top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
              <div className="flex items-start gap-6">
                <time className="font-mono text-[11px] uppercase tracking-label text-fg-subtle shrink-0 w-[120px] pt-1">
                  {new Date(v.date).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'short',
                    year: '2-digit',
                  })}
                </time>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-display text-xl text-fg"
                    style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
                  >
                    {v.party_size} {v.party_size === 1 ? 'persona' : 'personas'} · {v.sector}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[12px] text-fg-muted font-mono">
                    <span className="uppercase tracking-label text-[10px]">{v.shift}</span>
                    <span className="text-fg-faint">·</span>
                    <span className="text-accent">
                      <Numeral value={v.amount} format="ars" />
                    </span>
                    {v.score != null && (
                      <>
                        <span className="text-fg-faint">·</span>
                        <span>{v.score.toFixed(1)} / 5</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2">{label}</Label>
      <div>{value}</div>
    </div>
  );
}
