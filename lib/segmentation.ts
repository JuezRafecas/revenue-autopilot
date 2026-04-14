import type { GuestProfile, Segment, Visit } from './types';

/**
 * Clasifica guests en 6 segmentos del ciclo de vida del cliente.
 *
 * Reglas de referencia (a implementar durante el hackathon):
 * - LEAD: tiene registro pero 0 visitas completadas
 * - NEW: 1 sola visita completada en los últimos 30 días
 * - ACTIVE: visitó en los últimos 30 días y tiene 2+ visitas
 * - VIP: visitó en los últimos 30 días, 5+ visitas o top 10% por gasto
 * - AT_RISK: última visita entre 1x y 2x su frecuencia promedio
 * - DORMANT: última visita hace más de 2x su frecuencia promedio O más de 60 días
 */
export function classifyGuests(visitsByGuest: Map<string, Visit[]>): GuestProfile[] {
  if (visitsByGuest.size === 0) return [];
  throw new Error('classifyGuests: Not implemented — build during hackathon');
}

export function calculateRFM(_profile: Partial<GuestProfile>): {
  recency: number;
  frequency: number;
  monetary: number;
} {
  throw new Error('calculateRFM: Not implemented — build during hackathon');
}

export function determineSegment(_profile: Partial<GuestProfile>): Segment {
  throw new Error('determineSegment: Not implemented — build during hackathon');
}
