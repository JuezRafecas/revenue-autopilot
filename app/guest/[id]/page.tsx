import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { GuestProfile } from '@/components/guests/GuestProfile';
import Link from 'next/link';
import { MOCK_GUESTS } from '@/lib/mock';

const FALLBACK_VISITS = [
  {
    id: 'v1',
    date: '2026-03-28T21:30:00Z',
    party_size: 4,
    amount: 182_000,
    sector: 'terraza',
    shift: 'dinner',
    outcome: 'completed',
    score: 4.8,
  },
  {
    id: 'v2',
    date: '2026-02-14T22:00:00Z',
    party_size: 2,
    amount: 98_000,
    sector: 'terraza',
    shift: 'dinner',
    outcome: 'completed',
    score: null,
  },
  {
    id: 'v3',
    date: '2026-01-22T21:00:00Z',
    party_size: 6,
    amount: 276_000,
    sector: 'privado',
    shift: 'dinner',
    outcome: 'completed',
    score: 5.0,
  },
  {
    id: 'v4',
    date: '2025-12-08T13:30:00Z',
    party_size: 2,
    amount: 84_000,
    sector: 'barra',
    shift: 'lunch',
    outcome: 'completed',
    score: null,
  },
  {
    id: 'v5',
    date: '2025-11-15T21:45:00Z',
    party_size: 4,
    amount: 164_000,
    sector: 'terraza',
    shift: 'dinner',
    outcome: 'completed',
    score: 4.6,
  },
];

export default async function GuestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guest = MOCK_GUESTS.find((g) => g.id === id) ?? MOCK_GUESTS[0]!;

  return (
    <AppShell>
      <Header />

      <section className="editorial-container pt-12 pb-24">
        <Link
          href="/dashboard"
          className="inline-block font-mono text-[10px] uppercase tracking-label text-fg-subtle hover:text-fg mb-16"
        >
          ← volver al diagnóstico
        </Link>

        <GuestProfile
          name={guest.name}
          segment={guest.segment}
          total_visits={guest.total_visits}
          days_since_last={guest.days_since_last}
          avg_score={guest.avg_score}
          total_spent={guest.total_spent}
          avg_party_size={3.2}
          preferred_sector="terraza"
          preferred_day="jueves"
          visits={FALLBACK_VISITS}
        />
      </section>
    </AppShell>
  );
}
