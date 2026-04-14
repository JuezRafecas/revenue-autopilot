import type { GuestProfile, Segment, Visit } from './types';
import { computeTier } from './audience';

// ============================================================================
// Segmentation engine
// ============================================================================
//
// Two entry points:
//   - `classifyProfiles(profiles)`  — the production path. Takes the aggregate
//     rows we already have in `guest_profiles` (projected from `cdp_guest_*`)
//     and stamps RFM scores, lifecycle segment, and value tier on each one.
//   - `classifyGuests(visitsByGuest)` — visit-driven path kept for the CSV
//     upload flow. Builds synthetic profiles from raw visits, then reuses
//     `classifyProfiles`.
//
// Lifecycle segment rules (§ segmentation.md):
//   LEAD    → 0 completed visits (or never visited)
//   Recent (days_since_last ≤ 30):
//     VIP    → total_visits ≥ 5
//     ACTIVE → total_visits ≥ 2
//     NEW    → total_visits === 1
//   DORMANT → days_since_last > max(2 × avg_days_between, 60)
//   AT_RISK → anything in between
// ============================================================================

const RECENCY_WINDOW_DAYS = 30;
const DORMANT_THRESHOLD_DAYS = 60;

type RfmInput = Pick<GuestProfile, 'total_visits' | 'days_since_last' | 'total_spent'>;
type SegmentInput = Pick<
  GuestProfile,
  'total_visits' | 'days_since_last' | 'avg_days_between_visits'
>;

export function determineSegment(profile: SegmentInput): Segment {
  const { total_visits, days_since_last, avg_days_between_visits } = profile;

  if (total_visits === 0) return 'lead';
  if (days_since_last == null) return 'lead';

  if (days_since_last <= RECENCY_WINDOW_DAYS) {
    if (total_visits >= 5) return 'vip';
    if (total_visits >= 2) return 'active';
    return 'new';
  }

  const expectedGap = avg_days_between_visits ?? RECENCY_WINDOW_DAYS;
  const dormantCutoff = Math.max(expectedGap * 2, DORMANT_THRESHOLD_DAYS);
  if (days_since_last > dormantCutoff) return 'dormant';

  return 'at_risk';
}

// ---------- RFM scoring (absolute thresholds) ------------------------------
// Absolute thresholds are simpler and sufficient for the hackathon — we can
// revisit with population quantiles if the data justifies it.

function recencyScore(daysSinceLast: number | null): number {
  if (daysSinceLast == null) return 1;
  if (daysSinceLast <= 7) return 5;
  if (daysSinceLast <= 14) return 4;
  if (daysSinceLast <= 30) return 3;
  if (daysSinceLast <= 60) return 2;
  return 1;
}

function frequencyScore(totalVisits: number): number {
  if (totalVisits >= 10) return 5;
  if (totalVisits >= 5) return 4;
  if (totalVisits >= 3) return 3;
  if (totalVisits >= 2) return 2;
  return 1;
}

function monetaryScore(totalSpent: number | null): number {
  if (totalSpent == null || totalSpent <= 0) return 1;
  if (totalSpent >= 500_000) return 5;
  if (totalSpent >= 250_000) return 4;
  if (totalSpent >= 100_000) return 3;
  if (totalSpent >= 50_000) return 2;
  return 1;
}

export function calculateRFM(profile: RfmInput): {
  recency: number;
  frequency: number;
  monetary: number;
} {
  return {
    recency: recencyScore(profile.days_since_last),
    frequency: frequencyScore(profile.total_visits),
    monetary: monetaryScore(profile.total_spent),
  };
}

// ---------- Main entry point -----------------------------------------------

export function classifyProfiles(profiles: GuestProfile[]): GuestProfile[] {
  return profiles.map((p) => {
    const rfm = calculateRFM(p);
    const segment = determineSegment(p);
    const tier = computeTier({
      total_visits: p.total_visits,
      total_spent: p.total_spent,
      rfm_monetary: rfm.monetary,
      rfm_frequency: rfm.frequency,
    });
    return {
      ...p,
      rfm_recency: rfm.recency,
      rfm_frequency: rfm.frequency,
      rfm_monetary: rfm.monetary,
      rfm_score: `${rfm.recency}${rfm.frequency}${rfm.monetary}`,
      segment,
      tier,
      calculated_at: new Date().toISOString(),
    };
  });
}

// ---------- Visit-driven path (CSV upload flow) ----------------------------

function buildProfileFromVisits(guestId: string, visits: Visit[]): GuestProfile {
  const completed = visits.filter((v) => v.outcome === 'completed');
  const sorted = [...completed].sort(
    (a, b) => new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime(),
  );

  const first = sorted[0]?.visit_date ?? null;
  const last = sorted[sorted.length - 1]?.visit_date ?? null;
  const now = Date.now();
  const daysSinceLast =
    last !== null ? Math.floor((now - new Date(last).getTime()) / (1000 * 60 * 60 * 24)) : null;

  let avgDaysBetween: number | null = null;
  if (sorted.length >= 2) {
    const totalGap =
      (new Date(last!).getTime() - new Date(first!).getTime()) / (1000 * 60 * 60 * 24);
    avgDaysBetween = totalGap / (sorted.length - 1);
  }

  const amounts = completed.map((v) => v.amount).filter((a): a is number => a != null);
  const totalSpent = amounts.length > 0 ? amounts.reduce((acc, n) => acc + n, 0) : null;
  const avgAmount = amounts.length > 0 && totalSpent !== null ? totalSpent / amounts.length : null;

  const parties = completed.map((v) => v.party_size);
  const avgPartySize = parties.length > 0 ? parties.reduce((a, b) => a + b, 0) / parties.length : null;

  const scores = completed.map((v) => v.score).filter((s): s is number => s != null);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

  const restaurantId = visits[0]?.restaurant_id ?? '';
  return {
    id: guestId,
    guest_id: guestId,
    restaurant_id: restaurantId,
    total_visits: completed.length,
    total_no_shows: visits.filter((v) => v.outcome === 'no_show').length,
    total_cancellations: visits.filter((v) => v.outcome === 'cancelled').length,
    first_visit_at: first,
    last_visit_at: last,
    days_since_last: daysSinceLast,
    avg_days_between_visits: avgDaysBetween,
    avg_party_size: avgPartySize,
    avg_amount: avgAmount,
    total_spent: totalSpent,
    avg_score: avgScore,
    preferred_shift: null,
    preferred_day_of_week: null,
    preferred_sector: null,
    rfm_recency: null,
    rfm_frequency: null,
    rfm_monetary: null,
    rfm_score: null,
    segment: 'new',
    tier: 'occasional',
    calculated_at: new Date().toISOString(),
  };
}

export function classifyGuests(visitsByGuest: Map<string, Visit[]>): GuestProfile[] {
  if (visitsByGuest.size === 0) return [];
  const profiles: GuestProfile[] = [];
  for (const [guestId, visits] of visitsByGuest) {
    profiles.push(buildProfileFromVisits(guestId, visits));
  }
  return classifyProfiles(profiles);
}
