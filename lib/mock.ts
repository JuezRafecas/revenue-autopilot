import type {
  Segment,
  SegmentSummary,
  Campaign,
  Message,
  AttributionSummary,
  DashboardKPIs,
} from './types';
import { emptyMetrics } from './campaigns';

/**
 * Curated placeholder data for a pre-hackathon `npm run dev` walkthrough.
 * Matches the distribution of the demo CSV so the visual story is coherent
 * before any real segmentation logic runs.
 */

export const MOCK_RESTAURANT = {
  id: 'r_la_cabrera',
  name: 'La Cabrera',
  slug: 'la-cabrera',
  total_guests: 612,
  avg_ticket: 45000,
  currency: 'ARS',
};

export const MOCK_SEGMENT_SUMMARIES: SegmentSummary[] = [
  { segment: 'vip', count: 31, percentage: 5.1, trend: 'up', revenue_opportunity: 1_395_000 },
  { segment: 'active', count: 89, percentage: 14.5, trend: 'stable', revenue_opportunity: 2_403_000 },
  { segment: 'new', count: 58, percentage: 9.5, trend: 'up', revenue_opportunity: 652_500 },
  { segment: 'at_risk', count: 94, percentage: 15.4, trend: 'down', revenue_opportunity: 634_500 },
  { segment: 'dormant', count: 308, percentage: 50.3, trend: 'down', revenue_opportunity: 1_108_800 },
  { segment: 'lead', count: 32, percentage: 5.2, trend: 'stable', revenue_opportunity: 72_000 },
];

export const MOCK_HEALTH_SCORE = 19.6;
export const MOCK_TOTAL_REVENUE_AT_STAKE = 6_265_800;

export const MOCK_EDITORIAL_HEADLINE = {
  prefix: 'Más de',
  highlight: 'seis millones',
  suffix: 'de pesos se están yendo por la puerta.',
};

export const MOCK_DASHBOARD_KPIS: DashboardKPIs = {
  active_campaigns: 4,
  messages_sent_30d: 2847,
  response_rate_30d: 23.4,
  revenue_attributed_30d: 1_842_000,
  revenue_at_stake: MOCK_TOTAL_REVENUE_AT_STAKE,
  total_guests: 612,
  base_health_score: MOCK_HEALTH_SCORE,
};

export const MOCK_GUESTS: Array<{
  id: string;
  name: string;
  segment: Segment;
  total_visits: number;
  days_since_last: number;
  avg_score: number | null;
  total_spent: number;
}> = [
  { id: 'g1', name: 'Valentina Romero', segment: 'vip', total_visits: 24, days_since_last: 4, avg_score: 4.8, total_spent: 1_250_000 },
  { id: 'g2', name: 'Martín Álvarez', segment: 'vip', total_visits: 19, days_since_last: 9, avg_score: 4.7, total_spent: 985_000 },
  { id: 'g3', name: 'Lucía Fernández', segment: 'active', total_visits: 8, days_since_last: 12, avg_score: 4.5, total_spent: 342_000 },
  { id: 'g4', name: 'Joaquín Méndez', segment: 'active', total_visits: 6, days_since_last: 18, avg_score: 4.2, total_spent: 258_000 },
  { id: 'g5', name: 'Camila Ibáñez', segment: 'new', total_visits: 1, days_since_last: 11, avg_score: 4.5, total_spent: 52_000 },
  { id: 'g6', name: 'Federico Paz', segment: 'at_risk', total_visits: 7, days_since_last: 48, avg_score: 4.0, total_spent: 298_000 },
  { id: 'g7', name: 'Sofía Benítez', segment: 'dormant', total_visits: 11, days_since_last: 134, avg_score: 4.6, total_spent: 512_000 },
  { id: 'g8', name: 'Nicolás Ortega', segment: 'dormant', total_visits: 4, days_since_last: 178, avg_score: 3.8, total_spent: 165_000 },
  { id: 'g9', name: 'Milagros Acosta', segment: 'dormant', total_visits: 9, days_since_last: 92, avg_score: 4.9, total_spent: 418_000 },
  { id: 'g10', name: 'Tomás Giménez', segment: 'dormant', total_visits: 6, days_since_last: 110, avg_score: 4.1, total_spent: 267_000 },
  { id: 'g11', name: 'Agustina Sosa', segment: 'at_risk', total_visits: 5, days_since_last: 42, avg_score: 4.4, total_spent: 215_000 },
  { id: 'g12', name: 'Bruno Cabrera', segment: 'lead', total_visits: 0, days_since_last: 0, avg_score: null, total_spent: 0 },
];

export const MOCK_ACTIVITY_TICKER = [
  'VALENTINA ROMERO · MENSAJE APROBADO · HACE 2 MIN',
  'SOFÍA BENÍTEZ · REACTIVACIÓN ENVIADA · HACE 4 MIN',
  'NICOLÁS ORTEGA · CONVERSIÓN CONFIRMADA +$45K · HACE 7 MIN',
  'MARTÍN ÁLVAREZ · MENSAJE POST-VISITA · HACE 11 MIN',
  'CAMILA IBÁÑEZ · INVITACIÓN SEGUNDA VISITA · HACE 14 MIN',
  'FEDERICO PAZ · MENSAJE APROBADO · HACE 18 MIN',
  'MILAGROS ACOSTA · CONVERSIÓN CONFIRMADA +$92K · HACE 23 MIN',
];

export const MOCK_SAMPLE_MESSAGES: Record<Segment, string> = {
  dormant:
    'Sofía, hace más de cuatro meses que no te vemos por la barra — y la verdad que se te extraña. Seguís prefiriendo los jueves de noche o cambió la cosa?',
  at_risk:
    'Fede, noté que hace un mes largo que no aparecés. Todo bien? Si te pinta volver a caer, tengo guardado tu lugar de siempre en terraza.',
  new:
    'Camila, qué bueno haberte conocido el viernes pasado. Si querés probar el menú de la barra, te recomiendo venir un miércoles — viene más tranquilo. 🍣',
  active:
    'Lucía, gracias por la visita del finde, fue un placer tenerte de vuelta. Si te queda un minuto, nos re ayudás dejando una reseña.',
  vip: 'Valentina, la semana que viene arranca la temporada de atún rojo y ya te estamos reservando la mesa del rincón. Vení un martes y te cuento qué preparamos.',
  lead: 'Bruno, vi que quedaste en lista el mes pasado pero al final no llegaste a caer. Se liberó un turno para el sábado a las 21, si pintaba.',
};

// ---------- Campaigns --------------------------------------------------------

function makeMetrics(sent: number, rates: {
  delivery: number;
  read: number;
  response: number;
  conversion: number;
  revenueMult: number;
}) {
  const delivered = Math.round(sent * rates.delivery);
  const read = Math.round(delivered * rates.read);
  const responded = Math.round(read * rates.response);
  const converted = Math.round(sent * rates.conversion);
  const revenue = Math.round(converted * rates.revenueMult);
  return {
    sent,
    delivered,
    read,
    responded,
    converted,
    failed: sent - delivered,
    revenue_attributed: revenue,
    delivery_rate: rates.delivery,
    read_rate: rates.read,
    response_rate: rates.response,
    conversion_rate: rates.conversion,
  };
}

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'c_reactivate_apr',
    restaurant_id: MOCK_RESTAURANT.id,
    template_key: 'reactivate_inactive',
    type: 'automation',
    name: 'Reactivar dormidos · Abril',
    description: 'Dormidos con 2+ visitas históricas, sin aparecer hace 60d+',
    status: 'active',
    audience_filter: {
      segments: ['dormant', 'at_risk'],
      not_visited_in_last_days: 60,
      min_total_visits: 2,
      requires_opt_in: 'whatsapp',
    },
    trigger: { type: 'event', event: 'no_visit_threshold_reached' },
    workflow: [],
    channels: ['whatsapp_then_email'],
    metrics: makeMetrics(402, { delivery: 0.9, read: 0.72, response: 0.28, conversion: 0.09, revenueMult: 52_000 }),
    estimated_revenue: 2_100_000,
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-14T09:12:00Z',
    started_at: '2026-04-02T08:00:00Z',
    completed_at: null,
  },
  {
    id: 'c_postvisit_always',
    restaurant_id: MOCK_RESTAURANT.id,
    template_key: 'post_visit_smart',
    type: 'automation',
    name: 'Post-visita inteligente',
    description: 'Agradecimiento 24h después de cada visita + pedido de review',
    status: 'active',
    audience_filter: {
      segments: ['vip', 'active', 'new'],
      visited_in_last_days: 7,
      requires_opt_in: 'whatsapp',
    },
    trigger: { type: 'event', event: 'visit_completed', delay_hours: 24 },
    workflow: [],
    channels: ['whatsapp_then_email'],
    metrics: makeMetrics(1284, { delivery: 0.92, read: 0.67, response: 0.23, conversion: 0.14, revenueMult: 38_000 }),
    estimated_revenue: 6_800_000,
    created_at: '2026-03-15T10:00:00Z',
    updated_at: '2026-04-14T10:15:00Z',
    started_at: '2026-03-16T08:00:00Z',
    completed_at: null,
  },
  {
    id: 'c_second_visit',
    restaurant_id: MOCK_RESTAURANT.id,
    template_key: 'first_to_second_visit',
    type: 'automation',
    name: 'Primera → Segunda visita',
    description: 'Nuevos clientes invitados a volver a los 3 días',
    status: 'active',
    audience_filter: { segments: ['new'], requires_opt_in: 'whatsapp' },
    trigger: { type: 'event', event: 'visit_completed', delay_hours: 72 },
    workflow: [],
    channels: ['whatsapp'],
    metrics: makeMetrics(58, { delivery: 0.93, read: 0.75, response: 0.31, conversion: 0.25, revenueMult: 42_000 }),
    estimated_revenue: 680_000,
    created_at: '2026-03-20T10:00:00Z',
    updated_at: '2026-04-13T18:05:00Z',
    started_at: '2026-03-21T08:00:00Z',
    completed_at: null,
  },
  {
    id: 'c_fill_thursday',
    restaurant_id: MOCK_RESTAURANT.id,
    template_key: 'fill_empty_tables',
    type: 'automation',
    name: 'Llenar jueves de cena',
    description: 'Activos con afinidad a jueves cuando baja la ocupación',
    status: 'active',
    audience_filter: {
      segments: ['active', 'at_risk'],
      visited_in_last_days: 90,
      preferred_day_of_week: 'thursday',
      preferred_shift: 'dinner',
    },
    trigger: { type: 'event', event: 'low_occupancy_detected' },
    workflow: [],
    channels: ['whatsapp'],
    metrics: makeMetrics(47, { delivery: 0.94, read: 0.78, response: 0.42, conversion: 0.19, revenueMult: 58_000 }),
    estimated_revenue: 520_000,
    created_at: '2026-04-05T10:00:00Z',
    updated_at: '2026-04-12T14:30:00Z',
    started_at: '2026-04-05T10:30:00Z',
    completed_at: null,
  },
  {
    id: 'c_event_mallmann',
    restaurant_id: MOCK_RESTAURANT.id,
    template_key: 'promote_event',
    type: 'one_shot',
    name: 'La Cabrera × Francis Mallmann',
    description: 'Menú de 5 pasos con chef invitado — 20 de abril',
    status: 'scheduled',
    audience_filter: {
      tiers: ['vip', 'frequent'],
      visited_in_last_days: 180,
      requires_opt_in: 'whatsapp',
    },
    trigger: { type: 'schedule', at: '2026-04-16T10:00:00-03:00' },
    workflow: [],
    channels: ['whatsapp_then_email'],
    metrics: emptyMetrics(),
    estimated_revenue: 1_200_000,
    created_at: '2026-04-10T12:00:00Z',
    updated_at: '2026-04-14T08:00:00Z',
    started_at: null,
    completed_at: null,
  },
];

// ---------- Messages (inbox) ------------------------------------------------

export const MOCK_MESSAGES: Array<
  Pick<Message, 'id' | 'channel' | 'status' | 'content' | 'created_at' | 'realized_revenue'> & {
    guest_name: string;
    campaign_name: string;
  }
> = [
  {
    id: 'm1',
    guest_name: 'Milagros Acosta',
    campaign_name: 'Reactivar dormidos · Abril',
    channel: 'whatsapp_then_email',
    content: 'Milagros, hace 92 días que no cruzás la puerta. Te dejo dicho que el martes reservé…',
    status: 'converted',
    created_at: '2026-04-14T09:42:00Z',
    realized_revenue: 92_000,
  },
  {
    id: 'm2',
    guest_name: 'Sofía Benítez',
    campaign_name: 'Reactivar dormidos · Abril',
    channel: 'whatsapp',
    content: 'Sofía, más de cuatro meses sin aparecer — y la verdad que se te extraña…',
    status: 'responded',
    created_at: '2026-04-14T09:12:00Z',
    realized_revenue: null,
  },
  {
    id: 'm3',
    guest_name: 'Valentina Romero',
    campaign_name: 'Post-visita inteligente',
    channel: 'whatsapp',
    content: 'Valentina, gracias por la visita del finde. Si te queda un minuto nos ayudás…',
    status: 'read',
    created_at: '2026-04-14T08:31:00Z',
    realized_revenue: null,
  },
  {
    id: 'm4',
    guest_name: 'Federico Paz',
    campaign_name: 'Reactivar dormidos · Abril',
    channel: 'whatsapp_then_email',
    content: 'Fede, noté que hace un mes largo que no aparecés. Todo bien?',
    status: 'pending_approval',
    created_at: '2026-04-14T08:12:00Z',
    realized_revenue: null,
  },
  {
    id: 'm5',
    guest_name: 'Camila Ibáñez',
    campaign_name: 'Primera → Segunda visita',
    channel: 'whatsapp',
    content: 'Camila, qué bueno haberte conocido el viernes pasado. Si querés probar el menú…',
    status: 'delivered',
    created_at: '2026-04-14T07:45:00Z',
    realized_revenue: null,
  },
  {
    id: 'm6',
    guest_name: 'Martín Álvarez',
    campaign_name: 'La Cabrera × Francis Mallmann',
    channel: 'whatsapp_then_email',
    content: 'Martín, el 20 de abril tenemos a Francis Mallmann en la cocina. Te guardamos…',
    status: 'pending_approval',
    created_at: '2026-04-14T07:30:00Z',
    realized_revenue: null,
  },
  {
    id: 'm7',
    guest_name: 'Nicolás Ortega',
    campaign_name: 'Reactivar dormidos · Abril',
    channel: 'whatsapp',
    content: 'Nico, hace casi 6 meses que no caés. Se te extraña en la barra.',
    status: 'converted',
    created_at: '2026-04-13T20:12:00Z',
    realized_revenue: 45_000,
  },
  {
    id: 'm8',
    guest_name: 'Tomás Giménez',
    campaign_name: 'Reactivar dormidos · Abril',
    channel: 'whatsapp_then_email',
    content: 'Tomi, hace rato no te vemos. Volvemos a tener tu plato favorito…',
    status: 'failed',
    created_at: '2026-04-13T18:05:00Z',
    realized_revenue: null,
  },
  {
    id: 'm9',
    guest_name: 'Lucía Fernández',
    campaign_name: 'Post-visita inteligente',
    channel: 'whatsapp',
    content: 'Lucía, gracias por la visita del finde, fue un placer tenerte de vuelta…',
    status: 'responded',
    created_at: '2026-04-13T14:20:00Z',
    realized_revenue: null,
  },
  {
    id: 'm10',
    guest_name: 'Agustina Sosa',
    campaign_name: 'Llenar jueves de cena',
    channel: 'whatsapp',
    content: 'Agus, sabemos que te gusta caer un jueves. Se liberaron 4 mesas esta noche…',
    status: 'converted',
    created_at: '2026-04-12T14:30:00Z',
    realized_revenue: 58_000,
  },
];

// ---------- Attribution ----------------------------------------------------

export const MOCK_ATTRIBUTIONS: AttributionSummary[] = [
  {
    campaign_id: 'c_postvisit_always',
    campaign_name: 'Post-visita inteligente',
    template_key: 'post_visit_smart',
    messages_sent: 1284,
    conversions: 180,
    revenue: 6_840_000,
    rate: 0.14,
  },
  {
    campaign_id: 'c_reactivate_apr',
    campaign_name: 'Reactivar dormidos · Abril',
    template_key: 'reactivate_inactive',
    messages_sent: 402,
    conversions: 36,
    revenue: 1_872_000,
    rate: 0.09,
  },
  {
    campaign_id: 'c_second_visit',
    campaign_name: 'Primera → Segunda visita',
    template_key: 'first_to_second_visit',
    messages_sent: 58,
    conversions: 15,
    revenue: 630_000,
    rate: 0.26,
  },
  {
    campaign_id: 'c_fill_thursday',
    campaign_name: 'Llenar jueves de cena',
    template_key: 'fill_empty_tables',
    messages_sent: 47,
    conversions: 9,
    revenue: 522_000,
    rate: 0.19,
  },
  {
    campaign_id: 'c_event_mallmann',
    campaign_name: 'La Cabrera × Francis Mallmann',
    template_key: 'promote_event',
    messages_sent: 0,
    conversions: 0,
    revenue: 0,
    rate: 0,
  },
];

export function getMockCampaignById(id: string): Campaign | undefined {
  return MOCK_CAMPAIGNS.find((c) => c.id === id);
}
