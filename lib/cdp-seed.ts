/**
 * CDP → app-layer projection pipeline.
 *
 * Shared between the CLI seed script (`scripts/seed-v2.ts`) and the HTTP
 * ingest route (`POST /api/cdp/import`).
 *
 * Wipes derived tables for the target restaurant, upserts the raw CDP
 * mirror tables (only the columns that exist in the schema — new fields
 * like `guest_id` on visits stay in memory and drive the projection),
 * generates realistic guest names/phones, synthesizes per-visit amounts,
 * and rebuilds `guest_profiles` with real totals.
 *
 * Idempotent: re-running pisa todo para el restaurant pasado.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  parseCdpVisitCsv,
  parseCdpGuestPartnerCsv,
  parseCdpGuestUnifiedCsv,
  cdpGuestPartnerToProfile,
  type CdpVisitRow,
  type CdpGuestPartnerRow,
} from './cdp';
import { TEMPLATES } from './templates';

const BATCH = 1000;

export interface ReseedCounts {
  cdp_visits: number;
  cdp_guest_partners: number;
  cdp_guest_unified: number;
  guests: number;
  visits: number;
  guest_profiles: number;
  orphans: number;
}

export interface ReseedInput {
  visitCsv: string;
  guestPartnerCsv: string;
  guestUnifiedCsv: string;
  restaurantId: string;
  avgTicket: number;
}

// ---------- deterministic random utilities --------------------------------

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- argentine name + phone generators ----------------------------

const FIRST_NAMES = [
  'Agustín', 'Alejandro', 'Andrés', 'Ariel', 'Benjamín', 'Camilo', 'Carlos',
  'Cristian', 'Daniel', 'Diego', 'Emanuel', 'Esteban', 'Ezequiel', 'Facundo',
  'Federico', 'Felipe', 'Fernando', 'Franco', 'Gabriel', 'Germán', 'Gonzalo',
  'Gustavo', 'Hernán', 'Ignacio', 'Javier', 'Joaquín', 'Jorge', 'José',
  'Juan', 'Julián', 'Leandro', 'Leonardo', 'Lucas', 'Luciano', 'Luis',
  'Manuel', 'Marcelo', 'Marcos', 'Mariano', 'Martín', 'Matías', 'Mauricio',
  'Maximiliano', 'Miguel', 'Nahuel', 'Nicolás', 'Octavio', 'Pablo', 'Patricio',
  'Pedro', 'Ramiro', 'Raúl', 'Ricardo', 'Roberto', 'Rodrigo', 'Rubén',
  'Sebastián', 'Sergio', 'Tomás', 'Tobías', 'Valentín', 'Víctor', 'Walter',
  'Adriana', 'Agustina', 'Alejandra', 'Ana', 'Andrea', 'Antonella', 'Belén',
  'Bianca', 'Camila', 'Candela', 'Carla', 'Carolina', 'Catalina', 'Cecilia',
  'Clara', 'Claudia', 'Constanza', 'Daniela', 'Débora', 'Delfina', 'Elena',
  'Emilia', 'Eugenia', 'Evelyn', 'Fabiana', 'Fernanda', 'Florencia', 'Gabriela',
  'Guadalupe', 'Inés', 'Isabel', 'Jazmín', 'Josefina', 'Julia', 'Julieta',
  'Laura', 'Lorena', 'Lucía', 'Luz', 'Magdalena', 'Malena', 'Marcela',
  'María', 'Mariana', 'Marina', 'Micaela', 'Milagros', 'Mónica', 'Nadia',
  'Natalia', 'Nerea', 'Noelia', 'Olivia', 'Paula', 'Pilar', 'Priscila',
  'Rocío', 'Romina', 'Sabrina', 'Silvana', 'Silvia', 'Sofía', 'Soledad',
  'Tamara', 'Valentina', 'Valeria', 'Vanesa', 'Verónica', 'Victoria', 'Ximena',
];

const LAST_NAMES = [
  'González', 'Rodríguez', 'Gómez', 'Fernández', 'López', 'Díaz', 'Martínez',
  'Pérez', 'García', 'Sánchez', 'Romero', 'Sosa', 'Álvarez', 'Torres',
  'Ruiz', 'Ramírez', 'Flores', 'Benítez', 'Acosta', 'Medina', 'Suárez',
  'Herrera', 'Aguirre', 'Pereyra', 'Gutiérrez', 'Giménez', 'Molina', 'Silva',
  'Castro', 'Rojas', 'Ortiz', 'Núñez', 'Luna', 'Juárez', 'Cabrera',
  'Ríos', 'Méndez', 'Vega', 'Cáceres', 'Paz', 'Vázquez',
  'Ferrari', 'Russo', 'Bianchi', 'Rossi', 'Marino', 'Moretti', 'Ricci',
  'Conti', 'Costa', 'Romano', 'Gallo', 'Ferrero', 'Bruno', 'Greco',
  'Ibáñez', 'Arias', 'Escobar', 'Ojeda', 'Quiroga', 'Peralta', 'Villalba',
  'Correa', 'Coronel', 'Maldonado', 'Figueroa', 'Leiva', 'Cardozo', 'Bravo',
  'Miranda', 'Mansilla', 'Soto', 'Valenzuela', 'Lucero', 'Navarro', 'Franco',
  'Ayala', 'Ponce', 'Vera', 'Cordero', 'Melo', 'Mercado', 'Rivero',
  'Domínguez', 'Carrizo', 'Otero', 'Reyes', 'Ramos', 'Pascual', 'Palacios',
  'Iglesias', 'Chávez', 'Duarte', 'Blanco', 'Serrano', 'Campos', 'Morales',
  'Vidal', 'Solís', 'Aguilar', 'Godoy', 'Farías', 'Bustos', 'Arroyo',
];

export function generateName(guestId: string): string {
  const rand = mulberry32(hashString(guestId));
  const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
  return `${first} ${last}`;
}

export function generatePhone(guestId: string, realPhone: string | null): string {
  if (realPhone && realPhone.trim().length > 0) return realPhone;
  const rand = mulberry32(hashString(`${guestId}-phone`));
  const a = String(Math.floor(rand() * 9000) + 1000);
  const b = String(Math.floor(rand() * 9000) + 1000);
  return `+54 9 11 ${a} ${b}`;
}

// ---------- visit outcome + amount helpers --------------------------------

export function mapOutcome(
  state: string | null,
): 'completed' | 'cancelled' | 'no_show' | 'pending' {
  if (!state) return 'pending';
  if (state === 'ARRIVED') return 'completed';
  if (state.startsWith('CANCELLED')) return 'cancelled';
  if (state === 'NO_SHOW') return 'no_show';
  return 'pending';
}

export function mapShift(visitedAt: string | null): 'lunch' | 'dinner' | null {
  if (!visitedAt) return null;
  const hour = new Date(visitedAt).getUTCHours();
  // La Cabrera is UTC-3. Dinner 19:00-02:00 local ≈ 22:00-05:00 UTC.
  if (hour >= 22 || hour < 6) return 'dinner';
  return 'lunch';
}

export function mapDayOfWeek(visitedAt: string | null): string | null {
  if (!visitedAt) return null;
  return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
    new Date(visitedAt).getUTCDay()
  ];
}

export function synthVisitAmount(v: CdpVisitRow, avgTicket: number): number | null {
  const outcome = mapOutcome(v.state);
  if (outcome !== 'completed') return null;
  if (v.has_guarantee && v.guarantee_amount && v.guarantee_amount > 0) {
    return Number(v.guarantee_amount.toFixed(2));
  }
  const party = v.party_size ?? 2;
  const rand = mulberry32(hashString(v.visit_id));
  const multiplier = 0.75 + rand() * 0.6;
  return Number((party * avgTicket * multiplier).toFixed(2));
}

// ---------- batch helpers --------------------------------------------------

async function upsertBatches<T>(
  db: SupabaseClient,
  table: string,
  rows: T[],
  conflictTarget: string,
) {
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH) as unknown as Record<string, unknown>[];
    const { error } = await db.from(table).upsert(slice, { onConflict: conflictTarget });
    if (error) throw new Error(`${table} batch ${i}: ${error.message}`);
  }
}

async function insertBatches<T>(db: SupabaseClient, table: string, rows: T[]) {
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH) as unknown as Record<string, unknown>[];
    const { error } = await db.from(table).insert(slice);
    if (error) throw new Error(`${table} batch ${i}: ${error.message}`);
  }
}

async function insertGuestsWithIdMap(
  db: SupabaseClient,
  payload: Array<Record<string, unknown>>,
  rawPartners: CdpGuestPartnerRow[],
): Promise<{ byPartnerId: Map<string, string>; byCdpGuestId: Map<string, string> }> {
  const byPartnerId = new Map<string, string>();
  const byCdpGuestId = new Map<string, string>();
  for (let i = 0; i < payload.length; i += BATCH) {
    const slice = payload.slice(i, i + BATCH);
    const { data, error } = await db.from('guests').insert(slice).select('id');
    if (error) throw new Error(`guests batch ${i}: ${error.message}`);
    data?.forEach((g, k) => {
      const row = rawPartners[i + k];
      byPartnerId.set(row.guest_partner_id, g.id);
      if (row.guest_id && !byCdpGuestId.has(row.guest_id)) {
        byCdpGuestId.set(row.guest_id, g.id);
      }
    });
  }
  return { byPartnerId, byCdpGuestId };
}

// ---------- wipe derived data ---------------------------------------------

export async function wipeDerivedForRestaurant(db: SupabaseClient, restaurantId: string) {
  for (const table of [
    'attributions',
    'messages',
    'events',
    'campaigns',
    'visits',
    'guest_profiles',
    'guests',
  ] as const) {
    const { error } = await db.from(table).delete().eq('restaurant_id', restaurantId);
    if (error) throw new Error(`wipe ${table}: ${error.message}`);
  }
  for (const [table, pk] of [
    ['cdp_visits', 'visit_id'],
    ['cdp_guest_partners', 'guest_partner_id'],
    ['cdp_guest_unified', 'guest_id'],
  ] as const) {
    const { error } = await db.from(table).delete().neq(pk, '__never__');
    if (error) throw new Error(`wipe ${table}: ${error.message}`);
  }
}

// ---------- CDP row → DB payload projection (drops fields not in schema) -

function cdpVisitForDB(v: CdpVisitRow): Record<string, unknown> {
  return {
    visit_id: v.visit_id,
    tenant: v.tenant,
    partner_id: v.partner_id,
    visit_type: v.visit_type,
    party_size: v.party_size,
    party_size_seated: v.party_size_seated,
    sector_name: v.sector_name,
    channel: v.channel,
    platform: v.platform,
    state: v.state,
    visit_outcome: v.visit_outcome,
    guest_comment: null,
    venue_comment: null,
    tags: v.tags,
    arrived_at: v.arrived_at,
    departed_at: v.departed_at,
    score: v.score,
    review_food_rating: v.review_food_rating,
    review_service_rating: v.review_service_rating,
    review_ambience_rating: v.review_ambience_rating,
    review_overall_rating: v.review_overall_rating,
    review_comment: null,
    review_venue_reply: null,
    review_tags: v.review_tags,
    review_visit_type: v.review_visit_type,
    review_likes_count: v.review_likes_count,
    review_dislikes_count: v.review_dislikes_count,
    discount_percentage: v.discount_percentage,
    visited_at: v.visited_at,
    has_guarantee: v.has_guarantee,
    guarantee_amount: v.guarantee_amount,
    cancelled_by: v.cancelled_by,
    cancelled_at: v.cancelled_at,
    confirmed_at: v.confirmed_at,
    accepted_at: v.accepted_at,
    no_show_at: v.no_show_at,
    rejected_at: v.rejected_at,
    shift_id: v.shift_id,
    source_state: v.source_state,
  };
}

function cdpPartnerForDB(p: CdpGuestPartnerRow): Record<string, unknown> {
  return {
    guest_partner_id: p.guest_partner_id,
    tenant: p.tenant,
    partner_id: p.partner_id,
    brand_id: p.brand_id,
    guest_name: p.guest_name,
    guest_email: p.guest_email,
    guest_language: p.guest_language,
    location_name: p.location_name,
    location_categories: p.location_categories,
    location_city: p.location_city,
    partner_tags: p.partner_tags,
    special_relationship: p.special_relationship,
    food_restrictions: p.food_restrictions,
    total_visits: p.total_visits,
    total_walkins: p.total_walkins,
    total_bookings: p.total_bookings,
    total_pending: p.total_pending,
    total_no_shows: p.total_no_shows,
    total_cancellations: p.total_cancellations,
    total_rejected: p.total_rejected,
    no_show_rate: p.no_show_rate,
    cancellation_rate: p.cancellation_rate,
    rejection_rate: p.rejection_rate,
    booking_conversion_rate: p.booking_conversion_rate,
    confirmation_rate: p.confirmation_rate,
    guarantee_insights: p.guarantee_insights,
    cancellation_insights: p.cancellation_insights,
    review_insights: p.review_insights,
    channel_insights: p.channel_insights,
    waitlist_insights: p.waitlist_insights,
    preferred_visit_context: p.preferred_visit_context,
    total_lead_time_minutes: p.total_lead_time_minutes,
    completed_booking_count: p.completed_booking_count,
    total_score: p.total_score,
    scored_visit_count: p.scored_visit_count,
    last_score: p.last_score,
    last_scored_at: p.last_scored_at,
    last_lead_time_minutes: p.last_lead_time_minutes,
    last_review_rating: p.last_review_rating,
    total_party_size: p.total_party_size,
    party_size_count: p.party_size_count,
    total_seated_guests: p.total_seated_guests,
    seated_visit_count: p.seated_visit_count,
    total_guests_brought: p.total_guests_brought,
    is_favorite: p.is_favorite,
    preferred_visit_type: p.preferred_visit_type,
    preferred_platform: p.preferred_platform,
    booking_tags: p.booking_tags,
    preferred_shift: p.preferred_shift,
    preferred_day_of_week: p.preferred_day_of_week,
    preferred_sector: p.preferred_sector,
    preferred_channel: p.preferred_channel,
    first_booking_channel: p.first_booking_channel,
    direct_booking_rate: p.direct_booking_rate,
    direct_booking_count: p.direct_booking_count,
    total_venue_notes: p.total_venue_notes,
    is_banned: p.is_banned,
    first_visit_at: p.first_visit_at,
    last_visit_at: p.last_visit_at,
    days_since_last: p.days_since_last,
    total_days_between_visits: p.total_days_between_visits,
    visit_gap_count: p.visit_gap_count,
    next_visit_at: p.next_visit_at,
    days_until_next: p.days_until_next,
    calculated_at: p.calculated_at,
    review_experience_tags: p.review_experience_tags,
    avg_discount_percentage: p.avg_discount_percentage,
    total_discounted_visits: p.total_discounted_visits,
    last_booking_channel: p.last_booking_channel,
    is_highlighted: p.is_highlighted,
    source: p.source,
  };
}

// ---------- main entry point ---------------------------------------------

export async function seedCampaignTemplates(db: SupabaseClient) {
  const rows = Object.values(TEMPLATES).map((t) => ({
    key: t.key,
    type: t.type,
    name: t.name,
    description: t.description,
    headline: t.headline,
    accent: t.accent,
    default_audience: t.default_audience,
    default_trigger: t.default_trigger,
    workflow: t.workflow,
    kpi_labels: t.kpi_labels,
  }));
  const { error } = await db.from('campaign_templates').upsert(rows, { onConflict: 'key' });
  if (error) throw new Error(`seed campaign_templates: ${error.message}`);
}

export async function reseedFromCsvs(
  db: SupabaseClient,
  input: ReseedInput,
): Promise<ReseedCounts> {
  const rawVisits = parseCdpVisitCsv(input.visitCsv);
  const rawPartners = parseCdpGuestPartnerCsv(input.guestPartnerCsv);
  const rawUnified = parseCdpGuestUnifiedCsv(input.guestUnifiedCsv);

  await seedCampaignTemplates(db);
  await wipeDerivedForRestaurant(db, input.restaurantId);

  await upsertBatches(db, 'cdp_visits', rawVisits.map(cdpVisitForDB), 'visit_id');
  await upsertBatches(db, 'cdp_guest_partners', rawPartners.map(cdpPartnerForDB), 'guest_partner_id');
  const unifiedPayload = rawUnified.map((u) => {
    const { primary_phone: _p, primary_phone_iso_code: _pi, company_name: _c, ...rest } = u;
    void _p;
    void _pi;
    void _c;
    return rest;
  });
  await upsertBatches(db, 'cdp_guest_unified', unifiedPayload, 'guest_id');

  // guests
  const guestPayload = rawPartners.map((p) => {
    const idForName = p.guest_id ?? p.guest_partner_id;
    return {
      restaurant_id: input.restaurantId,
      name: generateName(idForName),
      phone: generatePhone(idForName, p.guest_phone),
      email: p.guest_email,
      opt_in_whatsapp: true,
      opt_in_email: true,
    };
  });
  const { byPartnerId: guestIdByPartnerId, byCdpGuestId: guestIdByCdpGuestId } =
    await insertGuestsWithIdMap(db, guestPayload, rawPartners);

  // visits
  let orphans = 0;
  const visitPayload = rawVisits
    .map((v) => {
      const uuid = v.guest_id ? guestIdByCdpGuestId.get(v.guest_id) : undefined;
      if (!uuid) {
        orphans++;
        return null;
      }
      const visitDate = v.visited_at ?? v.arrived_at ?? v.accepted_at ?? v.confirmed_at;
      if (!visitDate) {
        orphans++;
        return null;
      }
      return {
        guest_id: uuid,
        restaurant_id: input.restaurantId,
        visit_date: visitDate,
        party_size: v.party_size ?? 2,
        amount: synthVisitAmount(v, input.avgTicket),
        shift: mapShift(v.visited_at),
        day_of_week: mapDayOfWeek(v.visited_at),
        sector: v.sector_name,
        visit_type: 'reservation',
        outcome: mapOutcome(v.state),
        score: v.score,
        review_comment: null,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
  await insertBatches(db, 'visits', visitPayload);

  // guest_profiles (totals aggregated from projected visits)
  const visitsByGuestUuid = new Map<string, Array<(typeof visitPayload)[number]>>();
  for (const v of visitPayload) {
    const arr = visitsByGuestUuid.get(v.guest_id) ?? [];
    arr.push(v);
    visitsByGuestUuid.set(v.guest_id, arr);
  }

  const profilePayload = rawPartners
    .map((p) => {
      const uuid = guestIdByPartnerId.get(p.guest_partner_id);
      if (!uuid) return null;
      const mine = visitsByGuestUuid.get(uuid) ?? [];
      const completed = mine.filter((v) => v.outcome === 'completed');
      const amounts = completed.map((v) => v.amount).filter((a): a is number => a != null);
      const totalSpent = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) : null;
      const avgAmount =
        completed.length > 0 && totalSpent !== null ? totalSpent / completed.length : null;

      const base = cdpGuestPartnerToProfile(p, input.restaurantId);
      const { id: _id, guest_id: _gid, tier: _tier, ...rest } = base;
      void _id;
      void _gid;
      void _tier;

      return {
        ...rest,
        guest_id: uuid,
        total_visits: completed.length > 0 ? completed.length : p.total_visits,
        total_spent: totalSpent ?? base.total_spent,
        avg_amount: avgAmount ?? base.avg_amount,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);
  await insertBatches(db, 'guest_profiles', profilePayload);

  return {
    cdp_visits: rawVisits.length,
    cdp_guest_partners: rawPartners.length,
    cdp_guest_unified: rawUnified.length,
    guests: guestPayload.length,
    visits: visitPayload.length,
    guest_profiles: profilePayload.length,
    orphans,
  };
}
