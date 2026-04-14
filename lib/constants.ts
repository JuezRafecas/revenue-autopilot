import type { SegmentConfig, Segment } from './types';

export const SEGMENT_CONFIG: Record<Segment, SegmentConfig> = {
  vip: {
    key: 'vip',
    label: 'VIP',
    description: 'High frequency, high value — the engine of the business',
    color: 'text-segment-vip',
    bgColor: 'bg-segment-vip/10',
    borderColor: 'border-segment-vip',
    icon: '⭐',
    cta: 'Amplify',
    actionType: 'promote_event',
  },
  active: {
    key: 'active',
    label: 'Active',
    description: 'Visit often — your healthy base',
    color: 'text-segment-active',
    bgColor: 'bg-segment-active/10',
    borderColor: 'border-segment-active',
    icon: '🟢',
    cta: 'Sustain',
    actionType: 'post_visit',
  },
  new: {
    key: 'new',
    label: 'New',
    description: 'Recent first visit — critical churn point',
    color: 'text-segment-new',
    bgColor: 'bg-segment-new/10',
    borderColor: 'border-segment-new',
    icon: '🔵',
    cta: 'Bring back',
    actionType: 'second_visit',
  },
  at_risk: {
    key: 'at_risk',
    label: 'At Risk',
    description: 'Used to be active, slipping away',
    color: 'text-segment-at_risk',
    bgColor: 'bg-segment-at_risk/10',
    borderColor: 'border-segment-at_risk',
    icon: '🟡',
    cta: 'Recover',
    actionType: 'reactivation',
  },
  dormant: {
    key: 'dormant',
    label: 'Dormant',
    description: "Haven't visited in a while — the biggest pool of lost revenue",
    color: 'text-segment-dormant',
    bgColor: 'bg-segment-dormant/10',
    borderColor: 'border-segment-dormant',
    icon: '🔴',
    cta: 'Reactivate',
    actionType: 'reactivation',
  },
  lead: {
    key: 'lead',
    label: 'Leads',
    description: 'Engaged but never set foot in the venue',
    color: 'text-segment-lead',
    bgColor: 'bg-segment-lead/10',
    borderColor: 'border-segment-lead',
    icon: '🟣',
    cta: 'Convert',
    actionType: 'second_visit',
  },
};

export const SEGMENT_ORDER: Segment[] = ['vip', 'active', 'new', 'at_risk', 'dormant', 'lead'];

export const SEGMENT_HEX: Record<Segment, string> = {
  vip: '#E8B769',
  active: '#8FAE8B',
  new: '#7FA2C7',
  at_risk: '#D4A574',
  dormant: '#C86A52',
  lead: '#9E8FB8',
};

export const DEFAULT_RESTAURANT = {
  name: 'La Cabrera',
  slug: 'la-cabrera',
  avg_ticket: 45000,
  currency: 'ARS',
};

export const CONVERSION_RATES: Record<Segment, number> = {
  lead: 0.05,
  new: 0.25,
  active: 0.6,
  at_risk: 0.15,
  dormant: 0.08,
  vip: 0.7,
};

export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('es-AR').format(n);
}
