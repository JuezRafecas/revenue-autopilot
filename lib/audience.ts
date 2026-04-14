import type { AudienceFilter, GuestProfile, Segment, AudienceTier } from './types';

// ============================================================================
// Audience matching
// ============================================================================

/**
 * Pure predicate: does this guest profile match the given audience filter?
 *
 * Each filter field is AND-combined. Empty arrays match everything.
 * No filter fields set = matches all.
 */
export function matchesAudience(profile: GuestProfile, filter: AudienceFilter): boolean {
  if (filter.segments && filter.segments.length > 0) {
    if (!filter.segments.includes(profile.segment)) return false;
  }
  if (filter.tiers && filter.tiers.length > 0) {
    if (!filter.tiers.includes(profile.tier)) return false;
  }
  if (filter.min_total_visits != null && profile.total_visits < filter.min_total_visits) {
    return false;
  }
  if (filter.max_total_visits != null && profile.total_visits > filter.max_total_visits) {
    return false;
  }
  if (filter.visited_in_last_days != null) {
    if (profile.days_since_last == null || profile.days_since_last > filter.visited_in_last_days) {
      return false;
    }
  }
  if (filter.not_visited_in_last_days != null) {
    if (profile.days_since_last == null || profile.days_since_last < filter.not_visited_in_last_days) {
      return false;
    }
  }
  if (filter.preferred_day_of_week && profile.preferred_day_of_week !== filter.preferred_day_of_week) {
    return false;
  }
  if (filter.preferred_shift && profile.preferred_shift !== filter.preferred_shift) {
    return false;
  }
  // Opt-in check requires joining with guests table; skipped at the profile level
  return true;
}

export function filterProfiles(profiles: GuestProfile[], filter: AudienceFilter): GuestProfile[] {
  return profiles.filter((p) => matchesAudience(p, filter));
}

/**
 * Compute a value tier for a guest based on frequency and monetary metrics.
 * VIP = 5+ visits AND top 20% by monetary
 * Frequent = 3+ visits OR top 50% by monetary
 * Occasional = everyone else
 */
export function computeTier(
  profile: Pick<GuestProfile, 'total_visits' | 'total_spent' | 'rfm_monetary' | 'rfm_frequency'>
): AudienceTier {
  const visits = profile.total_visits ?? 0;
  const monetary = profile.rfm_monetary ?? 0;
  const frequency = profile.rfm_frequency ?? 0;
  if (visits >= 5 && monetary >= 4) return 'vip';
  if (visits >= 3 || monetary >= 3 || frequency >= 3) return 'frequent';
  return 'occasional';
}

export const TIER_LABEL: Record<AudienceTier, string> = {
  vip: 'VIP',
  frequent: 'Frequent',
  occasional: 'Occasional',
};

export const SEGMENT_LABEL: Record<Segment, string> = {
  lead: 'Leads',
  new: 'New',
  active: 'Active',
  at_risk: 'At risk',
  dormant: 'Dormant',
  vip: 'VIP',
};

/**
 * Produce a human-readable summary of an audience filter.
 */
export function describeAudience(filter: AudienceFilter): string {
  const parts: string[] = [];
  if (filter.segments?.length) {
    parts.push(filter.segments.map((s) => SEGMENT_LABEL[s]).join(' + '));
  }
  if (filter.tiers?.length) {
    parts.push(filter.tiers.map((t) => TIER_LABEL[t]).join(' + '));
  }
  if (filter.not_visited_in_last_days) {
    parts.push(`no visit in ${filter.not_visited_in_last_days}d`);
  }
  if (filter.visited_in_last_days) {
    parts.push(`visit in last ${filter.visited_in_last_days}d`);
  }
  if (filter.min_total_visits) {
    parts.push(`≥ ${filter.min_total_visits} visits`);
  }
  if (filter.preferred_day_of_week) {
    parts.push(`prefer ${filter.preferred_day_of_week}`);
  }
  if (filter.preferred_shift) {
    parts.push(filter.preferred_shift === 'dinner' ? 'dinner' : 'lunch');
  }
  if (parts.length === 0) return 'entire base';
  return parts.join(' · ');
}
