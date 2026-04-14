import type { GuestProfile, Segment, SegmentSummary } from './types';

// ============================================================================
// Revenue opportunity math
// ============================================================================
//
// Each segment has an opportunity multiplier applied over `count × avgTicket`.
// Multipliers are hand-tuned to reflect the expected value of rescuing /
// retaining that cohort:
//   - dormant  : large pool, low conversion, 1 visit → 0.20
//   - at_risk  : actionable save, 1 visit → 0.40
//   - lead     : never visited, low conversion → 0.30
//   - new      : second-visit push, high leverage → 0.60
//   - active   : baseline retention, ~1.5 visits → 1.50
//   - vip      : loyalty value is the biggest lever, ~2.5 visits → 2.50
// ============================================================================

const SEGMENT_MULTIPLIER: Record<Segment, number> = {
  dormant: 0.2,
  at_risk: 0.4,
  lead: 0.3,
  new: 0.6,
  active: 1.5,
  vip: 2.5,
};

const SEGMENT_TREND: Record<Segment, 'up' | 'down' | 'stable'> = {
  dormant: 'down',
  at_risk: 'down',
  lead: 'stable',
  new: 'stable',
  active: 'up',
  vip: 'up',
};

const ALL_SEGMENTS: Segment[] = ['lead', 'new', 'active', 'at_risk', 'dormant', 'vip'];

export function calculateRevenueOpportunity(
  segment: Segment,
  profiles: GuestProfile[],
  avgTicket: number,
): number {
  const count = profiles.filter((p) => p.segment === segment).length;
  if (count === 0) return 0;
  return count * avgTicket * SEGMENT_MULTIPLIER[segment];
}

export function buildSegmentSummaries(
  profiles: GuestProfile[],
  avgTicket: number,
): SegmentSummary[] {
  const total = profiles.length;
  return ALL_SEGMENTS.map((segment) => {
    const count = profiles.filter((p) => p.segment === segment).length;
    const percentage = total > 0 ? count / total : 0;
    const revenue_opportunity = calculateRevenueOpportunity(segment, profiles, avgTicket);
    return {
      segment,
      count,
      percentage,
      trend: SEGMENT_TREND[segment],
      revenue_opportunity,
    };
  });
}

export function totalRevenueAtStake(summaries: SegmentSummary[]): number {
  return summaries.reduce((acc, s) => acc + s.revenue_opportunity, 0);
}
