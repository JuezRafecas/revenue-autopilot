import { describe, expect, it } from 'vitest';
import {
  classifyGuests,
  classifyProfiles,
  calculateRFM,
  determineSegment,
} from '../segmentation';
import type { GuestProfile, Visit } from '../types';

// ---------- helpers --------------------------------------------------------

type ProfileSeed = Partial<GuestProfile> & {
  total_visits: number;
  days_since_last: number | null;
};

function profile(seed: ProfileSeed): GuestProfile {
  return {
    id: seed.id ?? 'p-1',
    guest_id: seed.guest_id ?? 'g-1',
    restaurant_id: seed.restaurant_id ?? 'r-1',
    total_visits: seed.total_visits,
    total_no_shows: seed.total_no_shows ?? 0,
    total_cancellations: seed.total_cancellations ?? 0,
    first_visit_at: seed.first_visit_at ?? null,
    last_visit_at: seed.last_visit_at ?? null,
    days_since_last: seed.days_since_last,
    avg_days_between_visits: seed.avg_days_between_visits ?? null,
    avg_party_size: seed.avg_party_size ?? null,
    avg_amount: seed.avg_amount ?? null,
    total_spent: seed.total_spent ?? null,
    avg_score: seed.avg_score ?? null,
    preferred_shift: seed.preferred_shift ?? null,
    preferred_day_of_week: seed.preferred_day_of_week ?? null,
    preferred_sector: seed.preferred_sector ?? null,
    rfm_recency: seed.rfm_recency ?? null,
    rfm_frequency: seed.rfm_frequency ?? null,
    rfm_monetary: seed.rfm_monetary ?? null,
    rfm_score: seed.rfm_score ?? null,
    segment: seed.segment ?? 'new',
    tier: seed.tier ?? 'occasional',
    calculated_at: seed.calculated_at ?? '2026-04-14T00:00:00Z',
  };
}

// ---------- determineSegment ------------------------------------------------

describe('determineSegment', () => {
  it('LEAD when total_visits is 0', () => {
    expect(determineSegment(profile({ total_visits: 0, days_since_last: null }))).toBe('lead');
  });

  it('LEAD when days_since_last is null (never visited)', () => {
    expect(determineSegment(profile({ total_visits: 3, days_since_last: null }))).toBe('lead');
  });

  it('NEW when exactly 1 completed visit in last 30 days', () => {
    expect(determineSegment(profile({ total_visits: 1, days_since_last: 12 }))).toBe('new');
  });

  it('ACTIVE when 2–4 recent visits in last 30 days', () => {
    expect(determineSegment(profile({ total_visits: 3, days_since_last: 10 }))).toBe('active');
  });

  it('VIP when 5+ visits in last 30 days', () => {
    expect(determineSegment(profile({ total_visits: 8, days_since_last: 5 }))).toBe('vip');
  });

  it('AT_RISK when last visit between 1× and 2× avg frequency', () => {
    // avg 20d between visits, hasn't been in 35d → risk window is 20-40
    expect(
      determineSegment(
        profile({ total_visits: 4, days_since_last: 35, avg_days_between_visits: 20 }),
      ),
    ).toBe('at_risk');
  });

  it('DORMANT when last visit beyond 2× avg frequency', () => {
    // avg 20d, hasn't been in 90d → 90 > 40 and > 60 ⇒ dormant
    expect(
      determineSegment(
        profile({ total_visits: 4, days_since_last: 90, avg_days_between_visits: 20 }),
      ),
    ).toBe('dormant');
  });

  it('DORMANT when days_since_last > 60 and no avg known', () => {
    expect(determineSegment(profile({ total_visits: 2, days_since_last: 120 }))).toBe('dormant');
  });

  it('AT_RISK when days_since_last in 31–60 and no avg known', () => {
    expect(determineSegment(profile({ total_visits: 2, days_since_last: 45 }))).toBe('at_risk');
  });
});

// ---------- calculateRFM ----------------------------------------------------

describe('calculateRFM', () => {
  it('assigns max recency (5) when visited this week', () => {
    const rfm = calculateRFM(profile({ total_visits: 3, days_since_last: 3 }));
    expect(rfm.recency).toBe(5);
  });

  it('assigns min recency (1) when dormant beyond 90 days', () => {
    const rfm = calculateRFM(profile({ total_visits: 2, days_since_last: 180 }));
    expect(rfm.recency).toBe(1);
  });

  it('assigns max frequency (5) when 10+ visits', () => {
    const rfm = calculateRFM(profile({ total_visits: 12, days_since_last: 10 }));
    expect(rfm.frequency).toBe(5);
  });

  it('assigns min frequency (1) when only 1 visit', () => {
    const rfm = calculateRFM(profile({ total_visits: 1, days_since_last: 5 }));
    expect(rfm.frequency).toBe(1);
  });

  it('assigns max monetary (5) when total_spent ≥ 500k ARS', () => {
    const rfm = calculateRFM(
      profile({ total_visits: 5, days_since_last: 10, total_spent: 750000 }),
    );
    expect(rfm.monetary).toBe(5);
  });

  it('assigns min monetary (1) when total_spent is null', () => {
    const rfm = calculateRFM(profile({ total_visits: 5, days_since_last: 10, total_spent: null }));
    expect(rfm.monetary).toBe(1);
  });
});

// ---------- classifyProfiles ------------------------------------------------

describe('classifyProfiles', () => {
  it('returns empty array for empty input', () => {
    expect(classifyProfiles([])).toEqual([]);
  });

  it('stamps segment, tier, and rfm scores on every profile', () => {
    const input = [
      profile({
        id: 'p-vip',
        total_visits: 12,
        days_since_last: 5,
        total_spent: 800000,
        avg_days_between_visits: 15,
      }),
      profile({
        id: 'p-lead',
        total_visits: 0,
        days_since_last: null,
      }),
    ];

    const out = classifyProfiles(input);
    expect(out).toHaveLength(2);

    const vip = out.find((p) => p.id === 'p-vip')!;
    expect(vip.segment).toBe('vip');
    expect(vip.tier).toBe('vip');
    expect(vip.rfm_recency).toBe(5);
    expect(vip.rfm_frequency).toBe(5);
    expect(vip.rfm_monetary).toBe(5);
    expect(vip.rfm_score).toBe('555');

    const lead = out.find((p) => p.id === 'p-lead')!;
    expect(lead.segment).toBe('lead');
  });

  it('does not mutate the input profiles', () => {
    const input = [profile({ id: 'p-imm', total_visits: 8, days_since_last: 5 })];
    classifyProfiles(input);
    expect(input[0].segment).toBe('new');
    expect(input[0].rfm_recency).toBeNull();
  });
});

// ---------- classifyGuests (visit-driven path) ------------------------------

describe('classifyGuests', () => {
  it('returns empty array when there are no guests', () => {
    expect(classifyGuests(new Map())).toEqual([]);
  });

  it('builds a profile per guest and classifies it', () => {
    const v = (overrides: Partial<Visit>): Visit => ({
      id: overrides.id ?? 'v-x',
      guest_id: overrides.guest_id ?? 'g-x',
      restaurant_id: overrides.restaurant_id ?? 'r-1',
      visit_date: overrides.visit_date ?? '2026-04-01T20:00:00Z',
      party_size: overrides.party_size ?? 2,
      amount: overrides.amount ?? 45000,
      shift: overrides.shift ?? 'dinner',
      day_of_week: overrides.day_of_week ?? 'friday',
      sector: overrides.sector ?? null,
      visit_type: overrides.visit_type ?? 'reservation',
      outcome: overrides.outcome ?? 'completed',
      score: overrides.score ?? null,
      review_comment: overrides.review_comment ?? null,
    });

    // Guest A: 3 completed visits, last one recent → active
    const guestA = Array.from({ length: 3 }, (_, i) =>
      v({ id: `a-${i}`, guest_id: 'g-a', visit_date: `2026-04-0${i + 1}T20:00:00Z` }),
    );

    // Guest B: 1 cancelled, 0 completed → lead (only completed visits count)
    const guestB = [v({ id: 'b-1', guest_id: 'g-b', outcome: 'cancelled' })];

    const result = classifyGuests(
      new Map<string, Visit[]>([
        ['g-a', guestA],
        ['g-b', guestB],
      ]),
    );

    const a = result.find((p) => p.guest_id === 'g-a')!;
    const b = result.find((p) => p.guest_id === 'g-b')!;
    expect(a.total_visits).toBe(3);
    expect(a.segment).toBe('active');
    expect(b.total_visits).toBe(0);
    expect(b.segment).toBe('lead');
  });
});
