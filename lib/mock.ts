import type { Segment, SegmentSummary } from './types';

/**
 * Curated placeholder data for a pre-hackathon `npm run dev` walkthrough.
 * Matches the distribution of the demo CSV so the visual story is coherent
 * before any real segmentation logic runs.
 */

export const MOCK_RESTAURANT = {
  name: 'Fabric Sushi',
  slug: 'fabric-sushi',
  total_guests: 612,
  avg_ticket: 45000,
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
