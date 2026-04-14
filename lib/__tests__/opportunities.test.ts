import { describe, expect, it } from 'vitest';
import type { GuestProfile, Segment } from '../types';
import { detectOpportunities } from '../agent/opportunities';

function profile(overrides: Partial<GuestProfile> & { segment: Segment }): GuestProfile {
  return {
    id: `p-${Math.random().toString(36).slice(2, 9)}`,
    guest_id: `g-${Math.random().toString(36).slice(2, 9)}`,
    restaurant_id: 'r-demo',
    total_visits: 3,
    total_no_shows: 0,
    total_cancellations: 0,
    first_visit_at: '2025-01-01',
    last_visit_at: '2025-06-01',
    days_since_last: 30,
    avg_days_between_visits: 45,
    avg_party_size: 2,
    avg_amount: 50000,
    total_spent: 150000,
    avg_score: 5,
    preferred_shift: 'dinner',
    preferred_day_of_week: 'friday',
    preferred_sector: null,
    rfm_recency: 3,
    rfm_frequency: 3,
    rfm_monetary: 3,
    rfm_score: '333',
    tier: 'frequent',
    calculated_at: '2026-04-14',
    ...overrides,
  };
}

function fill(n: number, seg: Segment, extra: Partial<GuestProfile> = {}): GuestProfile[] {
  return Array.from({ length: n }, () => profile({ segment: seg, ...extra }));
}

describe('detectOpportunities', () => {
  it('devuelve lista vacía sin perfiles', () => {
    expect(detectOpportunities([], 50000)).toEqual([]);
  });

  it('detecta reactivación cuando los dormidos superan el 25% de la base', () => {
    const profiles = [
      ...fill(30, 'dormant', { total_visits: 4, days_since_last: 90 }),
      ...fill(70, 'active', { days_since_last: 10 }),
    ];

    const opps = detectOpportunities(profiles, 50000);

    const reactivate = opps.find(
      (o) => o.suggested_template_key === 'reactivate_inactive' && o.target_segment === 'dormant'
    );
    expect(reactivate).toBeDefined();
    expect(reactivate!.severity).toBe('high');
    expect(reactivate!.confidence).toBeGreaterThan(0);
    expect(reactivate!.confidence).toBeLessThanOrEqual(1);
  });

  it('detecta cohorte at_risk grande con variante warm', () => {
    const profiles = [
      ...fill(60, 'at_risk', { total_visits: 3, days_since_last: 35 }),
      ...fill(200, 'active', { days_since_last: 10 }),
    ];

    const opps = detectOpportunities(profiles, 50000);
    const atRisk = opps.find((o) => o.target_segment === 'at_risk');

    expect(atRisk).toBeDefined();
    expect(atRisk!.suggested_template_key).toBe('reactivate_inactive');
  });

  it('revenue_potential escala con avgTicket', () => {
    const profiles = [
      ...fill(30, 'dormant', { total_visits: 4, days_since_last: 90 }),
      ...fill(70, 'active', { days_since_last: 10 }),
    ];

    const lo = detectOpportunities(profiles, 20000).find(
      (o) => o.target_segment === 'dormant'
    )!;
    const hi = detectOpportunities(profiles, 80000).find(
      (o) => o.target_segment === 'dormant'
    )!;

    expect(lo.revenue_potential).toBeGreaterThan(0);
    expect(hi.revenue_potential).toBeGreaterThan(lo.revenue_potential);
    expect(hi.revenue_potential / lo.revenue_potential).toBeCloseTo(4, 1);
  });

  it('confidence queda acotada entre 0 y 1 para cualquier mix', () => {
    const profiles = [
      ...fill(5, 'dormant'),
      ...fill(5, 'at_risk'),
      ...fill(5, 'new', { total_visits: 1 }),
      ...fill(5, 'active'),
    ];

    const opps = detectOpportunities(profiles, 50000);
    for (const opp of opps) {
      expect(opp.confidence).toBeGreaterThanOrEqual(0);
      expect(opp.confidence).toBeLessThanOrEqual(1);
    }
  });
});
