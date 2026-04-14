export const SYSTEM_PROMPTS = {
  reactivation: `Sos el sistema de comunicación de un restaurante. Generás mensajes de WhatsApp para recuperar clientes que dejaron de venir.

Reglas:
- Máximo 3 líneas
- Tono cálido, humano, cercano — como si escribiera alguien del restaurante que lo conoce
- NUNCA ofrezcas descuento ni promoción
- Usá nostalgia y cercanía, no urgencia
- Mencioná algo específico del cliente si tenés data (día preferido, sector, contexto)
- Incluí una pregunta abierta que invite a responder
- Escribí en español rioplatense natural (vos, no tú)
- NO uses hashtags, NO uses emojis corporativos
- Máximo 1 emoji, solo si queda natural
- El mensaje debe sentirse como un WhatsApp real de una persona real`,

  second_visit: `Sos el sistema de comunicación de un restaurante. Generás mensajes de WhatsApp para invitar a clientes que vinieron una sola vez a que vuelvan.

Reglas:
- Máximo 3 líneas
- Tono amigable y genuino — como si el restaurante se acordara de ellos
- Reforzá la experiencia positiva de la primera visita
- Podés sugerir algo nuevo para probar (un plato, un horario, un sector)
- NO ofrezcas descuento
- Escribí en español rioplatense natural
- Máximo 1 emoji
- El mensaje debe sentirse personal, no masivo`,

  fill_tables: `Sos el sistema de comunicación de un restaurante. Generás mensajes de WhatsApp para invitar clientes específicos a venir en un día/horario donde hay disponibilidad.

Reglas:
- Máximo 3 líneas
- Mencioná el día y horario específico
- Si sabés que el cliente suele venir ese día, mencionalo ("sabemos que te gustan los jueves")
- Tono casual, como una invitación de alguien que te conoce
- NO ofrezcas descuento
- Escribí en español rioplatense natural
- Máximo 1 emoji`,

  post_visit: `Sos el sistema de comunicación de un restaurante. Generás mensajes de WhatsApp post-visita para agradecer y reforzar la relación.

Reglas:
- Máximo 3 líneas
- Agradecé la visita de forma genuina
- Si fue buena experiencia, invitá a dejar una reseña de forma casual (no forzada)
- Si hay algo notable de la visita (cumpleaños, grupo grande, sector especial), mencionalo
- Escribí en español rioplatense natural
- Máximo 1 emoji
- NO vendas nada, NO invites a volver todavía — solo agradecé`,
};

export function buildReactivationPrompt(
  guest: {
    name: string;
    total_visits: number;
    days_since_last: number;
    preferred_day_of_week?: string | null;
    preferred_shift?: string | null;
    preferred_sector?: string | null;
    avg_party_size?: number | null;
    avg_score?: number | null;
  },
  restaurantName: string
): string {
  const parts = [
    `Restaurante: ${restaurantName}`,
    `Cliente: ${guest.name}`,
    `Visitas totales: ${guest.total_visits}`,
    `Última visita: hace ${guest.days_since_last} días`,
  ];
  if (guest.preferred_day_of_week) parts.push(`Día preferido: ${guest.preferred_day_of_week}`);
  if (guest.preferred_shift) parts.push(`Horario preferido: ${guest.preferred_shift}`);
  if (guest.preferred_sector) parts.push(`Sector preferido: ${guest.preferred_sector}`);
  if (guest.avg_party_size) parts.push(`Tamaño grupo habitual: ${Math.round(guest.avg_party_size)} personas`);
  if (guest.avg_score) parts.push(`Score promedio que dejó: ${guest.avg_score}/5`);
  parts.push('\nGenerá UN mensaje de WhatsApp para este cliente. Solo el mensaje, sin explicación.');
  return parts.join('\n');
}

export function buildSecondVisitPrompt(
  guest: {
    name: string;
    first_visit_at: string;
    preferred_shift?: string | null;
    preferred_sector?: string | null;
    party_size?: number | null;
    score?: number | null;
  },
  restaurantName: string
): string {
  const visitDate = new Date(guest.first_visit_at).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const parts = [
    `Restaurante: ${restaurantName}`,
    `Cliente: ${guest.name}`,
    `Visitó por primera vez: ${visitDate}`,
  ];
  if (guest.preferred_shift) parts.push(`Vino al: ${guest.preferred_shift}`);
  if (guest.preferred_sector) parts.push(`Se sentó en: ${guest.preferred_sector}`);
  if (guest.party_size) parts.push(`Vino con ${guest.party_size} personas`);
  if (guest.score) parts.push(`Dejó un score de ${guest.score}/5`);
  parts.push('\nGenerá UN mensaje de WhatsApp para invitarlo a volver. Solo el mensaje, sin explicación.');
  return parts.join('\n');
}

export function buildFillTablesPrompt(
  guest: {
    name: string;
    total_visits: number;
    preferred_day_of_week?: string | null;
    preferred_shift?: string | null;
  },
  restaurantName: string,
  targetDay: string,
  targetShift: string
): string {
  const parts = [
    `Restaurante: ${restaurantName}`,
    `Cliente: ${guest.name}`,
    `Visitas totales: ${guest.total_visits}`,
    `Día que queremos llenar: ${targetDay}`,
    `Horario: ${targetShift}`,
  ];
  if (guest.preferred_day_of_week) parts.push(`Día que suele venir: ${guest.preferred_day_of_week}`);
  if (guest.preferred_shift) parts.push(`Horario habitual: ${guest.preferred_shift}`);
  parts.push('\nGenerá UN mensaje de WhatsApp invitándolo para ese día/horario específico. Solo el mensaje, sin explicación.');
  return parts.join('\n');
}

export function buildPostVisitPrompt(
  guest: {
    name: string;
    total_visits: number;
    party_size?: number | null;
    sector?: string | null;
    score?: number | null;
  },
  restaurantName: string
): string {
  const parts = [
    `Restaurante: ${restaurantName}`,
    `Cliente: ${guest.name}`,
    `Visita número: ${guest.total_visits}`,
  ];
  if (guest.party_size) parts.push(`Vino con ${guest.party_size} personas`);
  if (guest.sector) parts.push(`Se sentó en: ${guest.sector}`);
  if (guest.score) parts.push(`Dejó score: ${guest.score}/5`);
  parts.push('\nGenerá UN mensaje de WhatsApp post-visita para agradecer. Solo el mensaje, sin explicación.');
  return parts.join('\n');
}
