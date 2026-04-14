import type { GuestProfile, Segment, SegmentSummary } from './types';

/**
 * Revenue math. Implementación real durante el hackathon.
 *
 * La idea: para cada segmento, estimar cuánto revenue está dormido
 * basándose en avg_ticket, conversion_rate esperado, y el count del segmento.
 */
export function calculateRevenueOpportunity(
  _segment: Segment,
  _profiles: GuestProfile[],
  _avgTicket: number
): number {
  throw new Error('calculateRevenueOpportunity: Not implemented — build during hackathon');
}

export function buildSegmentSummaries(
  _profiles: GuestProfile[],
  _avgTicket: number
): SegmentSummary[] {
  throw new Error('buildSegmentSummaries: Not implemented — build during hackathon');
}

export function totalRevenueAtStake(_summaries: SegmentSummary[]): number {
  throw new Error('totalRevenueAtStake: Not implemented — build during hackathon');
}
