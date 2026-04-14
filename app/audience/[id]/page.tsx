import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { GuestProfile } from '@/components/guests/GuestProfile';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';
import { resolveApiBase } from '@/lib/api';
import type { Segment } from '@/lib/types';

interface ProfileResponse {
  guest_partner: {
    profile: {
      id: string;
      segment: Segment;
      total_visits: number;
      days_since_last: number | null;
      avg_score: number | null;
      total_spent: number | string | null;
      avg_party_size: number | string | null;
      preferred_sector: string | null;
      preferred_day_of_week: string | null;
    };
    guest: { name: string | null } | null;
  };
}

interface VisitsResponse {
  visits: Array<{
    id: string;
    visit_date: string;
    party_size: number | null;
    amount: number | string | null;
    sector: string | null;
    shift: string | null;
    outcome: string | null;
    score: number | string | null;
  }>;
}

async function fetchGuest(id: string): Promise<{
  profile: ProfileResponse['guest_partner']['profile'];
  name: string;
  visits: VisitsResponse['visits'];
} | null> {
  const base = await resolveApiBase();
  const headers = { 'cache-control': 'no-store' } as const;

  const [profileRes, visitsRes] = await Promise.all([
    fetch(`${base}/api/guest-partners/${id}`, { cache: 'no-store', headers }),
    fetch(`${base}/api/guest-partners/${id}/visits?limit=50`, {
      cache: 'no-store',
      headers,
    }),
  ]);

  if (profileRes.status === 404) return null;
  if (!profileRes.ok) {
    throw new Error(`profile fetch failed: ${profileRes.status}`);
  }
  if (!visitsRes.ok) {
    throw new Error(`visits fetch failed: ${visitsRes.status}`);
  }

  const profileBody = (await profileRes.json()) as ProfileResponse;
  const visitsBody = (await visitsRes.json()) as VisitsResponse;

  return {
    profile: profileBody.guest_partner.profile,
    name: profileBody.guest_partner.guest?.name ?? '—',
    visits: visitsBody.visits ?? [],
  };
}

export default async function AudienceGuestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let data;
  let error: string | null = null;
  try {
    data = await fetchGuest(id);
  } catch (e) {
    error = e instanceof Error ? e.message : 'unknown error';
  }

  return (
    <AppShell>
      <Header />

      <section className="editorial-container pt-12 pb-24">
        <Link
          href="/audience"
          className="inline-block font-mono text-[10px] uppercase tracking-label text-fg-subtle hover:text-fg mb-16"
        >
          ← Back to audience
        </Link>

        {!data ? (
          <EmptyState
            title={error ? 'Could not load this guest.' : 'Guest not found.'}
            hint={
              error ?? 'They may have been removed from the base or the link is stale.'
            }
          />
        ) : (
          <GuestProfile
            name={data.name}
            segment={data.profile.segment}
            total_visits={data.profile.total_visits ?? 0}
            days_since_last={data.profile.days_since_last ?? 0}
            avg_score={
              data.profile.avg_score == null ? null : Number(data.profile.avg_score)
            }
            total_spent={Number(data.profile.total_spent ?? 0)}
            avg_party_size={Number(data.profile.avg_party_size ?? 0)}
            preferred_sector={data.profile.preferred_sector ?? '—'}
            preferred_day={data.profile.preferred_day_of_week ?? '—'}
            visits={data.visits.map((v) => ({
              id: v.id,
              date: v.visit_date,
              party_size: Number(v.party_size ?? 0),
              amount: Number(v.amount ?? 0),
              sector: v.sector ?? '—',
              shift: v.shift ?? '—',
              outcome: v.outcome ?? 'completed',
              score: v.score == null ? null : Number(v.score),
            }))}
          />
        )}
      </section>
    </AppShell>
  );
}
