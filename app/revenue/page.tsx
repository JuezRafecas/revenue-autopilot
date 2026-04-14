import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Label } from '@/components/ui/Label';
import { Numeral } from '@/components/ui/Numeral';
import { formatARS } from '@/lib/constants';

const LEDGER = [
  { date: '2026-04-14', action: 'Reactivation · Dormant', sent: 47, converted: 4, revenue: 189_000 },
  { date: '2026-04-13', action: 'Second visit · New', sent: 23, converted: 6, revenue: 278_000 },
  { date: '2026-04-12', action: 'Fill tables · Thursday dinner', sent: 31, converted: 9, revenue: 402_000 },
  { date: '2026-04-11', action: 'Reactivation · At risk', sent: 18, converted: 3, revenue: 132_000 },
  { date: '2026-04-10', action: 'VIP · Seasonal event', sent: 12, converted: 8, revenue: 624_000 },
  { date: '2026-04-09', action: 'Reactivation · Dormant', sent: 52, converted: 5, revenue: 218_000 },
  { date: '2026-04-08', action: 'Post-visit · Reviews', sent: 28, converted: 0, revenue: 0 },
];

export default function RevenuePage() {
  const total = LEDGER.reduce((acc, r) => acc + r.revenue, 0);
  const totalSent = LEDGER.reduce((acc, r) => acc + r.sent, 0);
  const totalConverted = LEDGER.reduce((acc, r) => acc + r.converted, 0);

  return (
    <AppShell>
      <Header />

      <section className="editorial-container pt-20 pb-16">
        <Label className="mb-6">Revenue generated · last 7 days</Label>
        <div
          className="font-display font-light text-accent tabular-nums leading-[0.85]"
          style={{
            fontVariationSettings: '"opsz" 144, "SOFT" 20',
            fontSize: 'clamp(4.5rem, 12vw, 12rem)',
          }}
        >
          <Numeral value={total} animated format="ars" size="display" className="font-display not-italic" />
        </div>
        <p
          className="mt-8 font-display italic text-2xl text-fg-muted max-w-[40ch] leading-snug"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
        >
          new money in the register — no discounts, no promos, no mass blasts.
        </p>
      </section>

      <section className="editorial-container pb-24 grid grid-cols-3 gap-0 border-y border-hairline">
        <Stat label="Messages sent" value={totalSent} />
        <Stat label="Conversions" value={totalConverted} />
        <Stat label="Rate" value={`${((totalConverted / totalSent) * 100).toFixed(1)}%`} />
      </section>

      <section className="editorial-container pb-32 mt-16">
        <Label className="mb-6">Ledger</Label>
        <div className="border-t border-hairline">
          <header className="grid grid-cols-[120px_minmax(0,1fr)_80px_80px_140px] gap-6 py-3 border-b border-hairline">
            <Label>Date</Label>
            <Label>Action</Label>
            <Label className="text-right">Sent</Label>
            <Label className="text-right">Conv.</Label>
            <Label className="text-right">Revenue</Label>
          </header>
          {LEDGER.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[120px_minmax(0,1fr)_80px_80px_140px] gap-6 py-5 border-b border-hairline items-center"
            >
              <div className="font-mono text-[12px] text-fg-muted tabular-nums">
                {new Date(row.date).toLocaleDateString('en-US', {
                  day: '2-digit',
                  month: 'short',
                })}
              </div>
              <div
                className="font-display text-lg text-fg"
                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
              >
                {row.action}
              </div>
              <div className="font-mono text-[13px] text-fg-muted tabular-nums text-right">
                {row.sent}
              </div>
              <div className="font-mono text-[13px] text-fg tabular-nums text-right">
                {row.converted}
              </div>
              <div className="font-mono text-[13px] text-accent tabular-nums text-right">
                {formatARS(row.revenue)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="px-10 py-12 border-r border-hairline last:border-r-0">
      <Label className="mb-3">{label}</Label>
      <div className="font-mono text-4xl text-fg tabular-nums">
        {typeof value === 'number' ? <Numeral value={value} /> : value}
      </div>
    </div>
  );
}
