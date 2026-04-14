import { describe, it, expect } from 'vitest';
import { matchesAudience, filterProfiles, computeTier, describeAudience } from '../lib/audience';
import type { GuestProfile, AudienceFilter } from '../lib/types';

function profile(overrides: Partial<GuestProfile> = {}): GuestProfile {
  return {
    id: 'p1',
    guest_id: 'g1',
    restaurant_id: 'r1',
    total_visits: 5,
    total_no_shows: 0,
    total_cancellations: 0,
    first_visit_at: '2025-01-01T00:00:00Z',
    last_visit_at: '2026-04-01T00:00:00Z',
    days_since_last: 13,
    avg_days_between_visits: 20,
    avg_party_size: 2,
    avg_amount: 40000,
    total_spent: 200000,
    avg_score: 4.5,
    preferred_shift: 'dinner',
    preferred_day_of_week: 'thursday',
    preferred_sector: 'terraza',
    rfm_recency: 5,
    rfm_frequency: 3,
    rfm_monetary: 3,
    rfm_score: '533',
    segment: 'active',
    tier: 'frequent',
    calculated_at: '2026-04-14T00:00:00Z',
    ...overrides,
  };
}

describe('matchesAudience', () => {
  it('matches everything with empty filter', () => {
    expect(matchesAudience(profile(), {})).toBe(true);
  });

  it('filters by segment', () => {
    const filter: AudienceFilter = { segments: ['dormant'] };
    expect(matchesAudience(profile({ segment: 'dormant' }), filter)).toBe(true);
    expect(matchesAudience(profile({ segment: 'active' }), filter)).toBe(false);
  });

  it('filters by tier', () => {
    const filter: AudienceFilter = { tiers: ['vip'] };
    expect(matchesAudience(profile({ tier: 'vip' }), filter)).toBe(true);
    expect(matchesAudience(profile({ tier: 'frequent' }), filter)).toBe(false);
  });

  it('respects visited_in_last_days', () => {
    const filter: AudienceFilter = { visited_in_last_days: 30 };
    expect(matchesAudience(profile({ days_since_last: 13 }), filter)).toBe(true);
    expect(matchesAudience(profile({ days_since_last: 45 }), filter)).toBe(false);
  });

  it('respects not_visited_in_last_days', () => {
    const filter: AudienceFilter = { not_visited_in_last_days: 60 };
    expect(matchesAudience(profile({ days_since_last: 75 }), filter)).toBe(true);
    expect(matchesAudience(profile({ days_since_last: 30 }), filter)).toBe(false);
  });

  it('combines multiple filters with AND', () => {
    const filter: AudienceFilter = {
      segments: ['dormant'],
      not_visited_in_last_days: 60,
      min_total_visits: 2,
    };
    expect(
      matchesAudience(
        profile({ segment: 'dormant', days_since_last: 90, total_visits: 3 }),
        filter
      )
    ).toBe(true);
    expect(
      matchesAudience(
        profile({ segment: 'active', days_since_last: 90, total_visits: 3 }),
        filter
      )
    ).toBe(false);
    expect(
      matchesAudience(
        profile({ segment: 'dormant', days_since_last: 90, total_visits: 1 }),
        filter
      )
    ).toBe(false);
  });

  it('filters by preferred day/shift', () => {
    const filter: AudienceFilter = {
      preferred_day_of_week: 'thursday',
      preferred_shift: 'dinner',
    };
    expect(matchesAudience(profile(), filter)).toBe(true);
    expect(matchesAudience(profile({ preferred_day_of_week: 'monday' }), filter)).toBe(false);
  });
});

describe('filterProfiles', () => {
  it('returns only matching profiles', () => {
    const profiles = [
      profile({ id: 'a', segment: 'dormant' }),
      profile({ id: 'b', segment: 'active' }),
      profile({ id: 'c', segment: 'dormant' }),
    ];
    const result = filterProfiles(profiles, { segments: ['dormant'] });
    expect(result.map((p) => p.id)).toEqual(['a', 'c']);
  });
});

describe('computeTier', () => {
  it('classifies VIP by visits + monetary', () => {
    expect(
      computeTier({ total_visits: 10, total_spent: 900_000, rfm_monetary: 5, rfm_frequency: 5 })
    ).toBe('vip');
  });
  it('classifies frequent by visits alone', () => {
    expect(
      computeTier({ total_visits: 4, total_spent: 100_000, rfm_monetary: 2, rfm_frequency: 2 })
    ).toBe('frequent');
  });
  it('classifies occasional as default', () => {
    expect(
      computeTier({ total_visits: 1, total_spent: 30_000, rfm_monetary: 1, rfm_frequency: 1 })
    ).toBe('occasional');
  });
});

describe('describeAudience', () => {
  it('returns "entire base" for empty filter', () => {
    expect(describeAudience({})).toBe('entire base');
  });
  it('joins segments and constraints', () => {
    const str = describeAudience({
      segments: ['dormant'],
      not_visited_in_last_days: 60,
      min_total_visits: 2,
    });
    expect(str).toContain('Dormant');
    expect(str).toContain('60d');
    expect(str).toContain('2 visits');
  });
});
