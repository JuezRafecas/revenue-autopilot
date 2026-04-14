import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { ActionPanel } from '@/components/actions/ActionPanel';
import { FillTablesForm } from '@/components/actions/FillTablesForm';
import { Label } from '@/components/ui/Label';
import { MOCK_GUESTS, MOCK_SAMPLE_MESSAGES } from '@/lib/mock';

export default function ActionsPage() {
  const dormantGuest = MOCK_GUESTS.find((g) => g.segment === 'dormant')!;
  const atRiskGuest = MOCK_GUESTS.find((g) => g.segment === 'at_risk')!;

  return (
    <AppShell>
      <Header />

      <section className="editorial-container pt-16 pb-10">
        <Label className="mb-4">Cola de acciones</Label>
        <h1
          className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] text-fg max-w-[22ch]"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
        >
          <span className="italic">Mensajes listos</span>{' '}
          para tu aprobación.
        </h1>
      </section>

      <section className="editorial-container pb-16 space-y-12">
        <ActionPanel
          guestName={dormantGuest.name}
          segment={dormantGuest.segment}
          totalVisits={dormantGuest.total_visits}
          daysSinceLast={dormantGuest.days_since_last}
          estimatedRevenue={54_000}
          message={MOCK_SAMPLE_MESSAGES.dormant}
        />
        <ActionPanel
          guestName={atRiskGuest.name}
          segment={atRiskGuest.segment}
          totalVisits={atRiskGuest.total_visits}
          daysSinceLast={atRiskGuest.days_since_last}
          estimatedRevenue={48_000}
          message={MOCK_SAMPLE_MESSAGES.at_risk}
        />
      </section>

      <section className="editorial-container pb-32">
        <FillTablesForm />
      </section>
    </AppShell>
  );
}
