import type { GuestProfile } from '../types';
import type { Opportunity, OpportunitySeverity } from './types';

/**
 * Assumed reactivation rate — conservative. Surfaced in the reasoning so the
 * operator sees the assumption. Tune once we have real experiment data.
 */
const REACTIVATION_RATE = 0.08;
const WARM_REACTIVATION_RATE = 0.12;
const SECOND_VISIT_LIFT = 0.15;

const DORMANT_SHARE_THRESHOLD = 0.25;
const AT_RISK_COUNT_THRESHOLD = 50;
const FIRST_VISIT_ONLY_SHARE_THRESHOLD = 0.2;

function severityFromShare(share: number): OpportunitySeverity {
  if (share >= 0.35) return 'high';
  if (share >= 0.25) return 'high';
  if (share >= 0.15) return 'medium';
  return 'low';
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function opportunityId(type: string): string {
  return `opp_${type}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function detectOpportunities(
  profiles: GuestProfile[],
  avgTicket: number
): Opportunity[] {
  if (profiles.length === 0) return [];

  const total = profiles.length;
  const now = new Date().toISOString();
  const opportunities: Opportunity[] = [];

  const dormant = profiles.filter((p) => p.segment === 'dormant');
  const atRisk = profiles.filter((p) => p.segment === 'at_risk');
  const firstVisitOnly = profiles.filter(
    (p) => p.segment === 'new' && (p.total_visits ?? 0) === 1
  );

  const dormantShare = dormant.length / total;
  if (dormantShare > DORMANT_SHARE_THRESHOLD) {
    const audienceSize = dormant.length;
    const revenuePotential = Math.round(audienceSize * avgTicket * REACTIVATION_RATE);
    const sharePct = Math.round(dormantShare * 100);
    opportunities.push({
      id: opportunityId('dormant'),
      type: 'reactivate_dormant',
      severity: severityFromShare(dormantShare),
      target_segment: 'dormant',
      suggested_template_key: 'reactivate_inactive',
      headline: `${audienceSize} guests have gone dormant.`,
      reasoning: `${sharePct}% of your base is in the dormant segment. Assuming an average ticket of $${formatMoney(
        avgTicket
      )} and a conservative reactivation rate of ${Math.round(
        REACTIVATION_RATE * 100
      )}%, there's ~$${formatMoney(revenuePotential)} recoverable with a reactivation campaign.`,
      audience_size: audienceSize,
      revenue_potential: revenuePotential,
      confidence: clamp01(0.5 + dormantShare),
      detected_at: now,
    });
  }

  if (atRisk.length > AT_RISK_COUNT_THRESHOLD) {
    const audienceSize = atRisk.length;
    const revenuePotential = Math.round(
      audienceSize * avgTicket * WARM_REACTIVATION_RATE
    );
    opportunities.push({
      id: opportunityId('at_risk'),
      type: 'reactivate_at_risk',
      severity: audienceSize > 200 ? 'high' : 'medium',
      target_segment: 'at_risk',
      suggested_template_key: 'reactivate_inactive',
      headline: `${audienceSize} guests are about to go dormant.`,
      reasoning: `You have ${audienceSize} guests in the "at risk" segment — they visited between 30 and 60 days ago. A warm nudge (${Math.round(
        WARM_REACTIVATION_RATE * 100
      )}% assumed reactivation rate) recovers ~$${formatMoney(revenuePotential)}.`,
      audience_size: audienceSize,
      revenue_potential: revenuePotential,
      confidence: clamp01(0.4 + Math.min(audienceSize / 500, 0.5)),
      detected_at: now,
    });
  }

  const firstVisitShare = firstVisitOnly.length / total;
  if (firstVisitShare > FIRST_VISIT_ONLY_SHARE_THRESHOLD) {
    const audienceSize = firstVisitOnly.length;
    const revenuePotential = Math.round(audienceSize * avgTicket * SECOND_VISIT_LIFT);
    const sharePct = Math.round(firstVisitShare * 100);
    opportunities.push({
      id: opportunityId('second_visit'),
      type: 'second_visit_leak',
      severity: severityFromShare(firstVisitShare),
      target_segment: 'new',
      suggested_template_key: 'first_to_second_visit',
      headline: `${audienceSize} first-time guests with no second visit.`,
      reasoning: `${sharePct}% of your base visited only once. The second visit defines retention — a personalized invite in the first 72h lifts ~${Math.round(
        SECOND_VISIT_LIFT * 100
      )}%. Potential: ~$${formatMoney(revenuePotential)}.`,
      audience_size: audienceSize,
      revenue_potential: revenuePotential,
      confidence: clamp01(0.45 + firstVisitShare),
      detected_at: now,
    });
  }

  return opportunities.sort((a, b) => b.revenue_potential - a.revenue_potential);
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);
}
