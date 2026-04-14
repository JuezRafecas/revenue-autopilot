import { describe, expect, it } from 'vitest';
import {
  calculateRevenueOpportunity,
  buildSegmentSummaries,
  totalRevenueAtStake,
} from '../revenue';
import type { GuestProfile, Segment, SegmentSummary } from '../types';

function profile(
  segment: Segment,
  overrides: Partial<GuestProfile> = {},
): GuestProfile {
  return {
    id: overrides.id ?? `p-${segment}-${Math.random()}`,
    guest_id: 'g',
    restaurant_id: 'r',
    total_visits: overrides.total_visits ?? 2,
    total_no_shows: 0,
    total_cancellations: 0,
    first_visit_at: null,
    last_visit_at: null,
    days_since_last: overrides.days_since_last ?? 10,
    avg_days_between_visits: null,
    avg_party_size: null,
    avg_amount: null,
    total_spent: overrides.total_spent ?? null,
    avg_score: null,
    preferred_shift: null,
    preferred_day_of_week: null,
    preferred_sector: null,
    rfm_recency: null,
    rfm_frequency: null,
    rfm_monetary: null,
    rfm_score: null,
    segment,
    tier: 'occasional',
    calculated_at: '2026-04-14T00:00:00Z',
  };
}

const AVG_TICKET = 45_000;

describe('calculateRevenueOpportunity', () => {
  it('returns 0 when no profiles in the segment', () => {
    expect(calculateRevenueOpportunity('dormant', [], AVG_TICKET)).toBe(0);
  });

  it('scales with the count of profiles in the segment', () => {
    const one = [profile('dormant')];
    const ten = Array.from({ length: 10 }, () => profile('dormant'));
    const v1 = calculateRevenueOpportunity('dormant', one, AVG_TICKET);
    const v10 = calculateRevenueOpportunity('dormant', ten, AVG_TICKET);
    expect(v10).toBeCloseTo(v1 * 10);
  });

  it('scales with the avg ticket', () => {
    const profiles = Array.from({ length: 5 }, () => profile('at_risk'));
    const atLow = calculateRevenueOpportunity('at_risk', profiles, 30_000);
    const atHigh = calculateRevenueOpportunity('at_risk', profiles, 60_000);
    expect(atHigh).toBeCloseTo(atLow * 2);
  });

  it('assigns higher opportunity per profile to VIPs than to leads', () => {
    const perVip = calculateRevenueOpportunity('vip', [profile('vip')], AVG_TICKET);
    const perLead = calculateRevenueOpportunity('lead', [profile('lead')], AVG_TICKET);
    expect(perVip).toBeGreaterThan(perLead);
  });

  it('only counts profiles matching the segment passed in', () => {
    // Passing mixed profiles should not inflate — the function filters internally.
    const mixed = [profile('dormant'), profile('dormant'), profile('active')];
    const filtered = calculateRevenueOpportunity('dormant', mixed, AVG_TICKET);
    const justDormant = calculateRevenueOpportunity(
      'dormant',
      [profile('dormant'), profile('dormant')],
      AVG_TICKET,
    );
    expect(filtered).toBeCloseTo(justDormant);
  });
});

describe('buildSegmentSummaries', () => {
  it('returns a summary for every segment even when count is zero', () => {
    const out = buildSegmentSummaries([], AVG_TICKET);
    expect(out).toHaveLength(6);
    const segments = out.map((s) => s.segment).sort();
    expect(segments).toEqual(['active', 'at_risk', 'dormant', 'lead', 'new', 'vip']);
    for (const s of out) {
      expect(s.count).toBe(0);
      expect(s.percentage).toBe(0);
      expect(s.revenue_opportunity).toBe(0);
    }
  });

  it('counts profiles per segment and computes percentage', () => {
    const profiles = [
      profile('active'),
      profile('active'),
      profile('dormant'),
      profile('vip'),
    ];
    const out = buildSegmentSummaries(profiles, AVG_TICKET);
    const byseg = Object.fromEntries(out.map((s) => [s.segment, s]));
    expect(byseg.active.count).toBe(2);
    expect(byseg.active.percentage).toBeCloseTo(0.5);
    expect(byseg.dormant.count).toBe(1);
    expect(byseg.dormant.percentage).toBeCloseTo(0.25);
    expect(byseg.vip.count).toBe(1);
    expect(byseg.new.count).toBe(0);
  });

  it('populates revenue_opportunity using the avg ticket', () => {
    const out = buildSegmentSummaries(
      [profile('dormant'), profile('dormant')],
      AVG_TICKET,
    );
    const dormant = out.find((s) => s.segment === 'dormant')!;
    expect(dormant.revenue_opportunity).toBeGreaterThan(0);
  });

  it('assigns a trend per segment (down for at-risk/dormant, up for active/vip)', () => {
    const out = buildSegmentSummaries([], AVG_TICKET);
    const byseg = Object.fromEntries(out.map((s) => [s.segment, s]));
    expect(byseg.at_risk.trend).toBe('down');
    expect(byseg.dormant.trend).toBe('down');
    expect(byseg.active.trend).toBe('up');
    expect(byseg.vip.trend).toBe('up');
  });
});

describe('totalRevenueAtStake', () => {
  it('returns 0 for empty summaries', () => {
    expect(totalRevenueAtStake([])).toBe(0);
  });

  it('sums revenue_opportunity across all summaries', () => {
    const summaries: SegmentSummary[] = [
      { segment: 'dormant', count: 10, percentage: 0.5, trend: 'down', revenue_opportunity: 100_000 },
      { segment: 'at_risk', count: 5, percentage: 0.25, trend: 'down', revenue_opportunity: 50_000 },
      { segment: 'active', count: 5, percentage: 0.25, trend: 'up', revenue_opportunity: 200_000 },
    ];
    expect(totalRevenueAtStake(summaries)).toBe(350_000);
  });
});
