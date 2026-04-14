// ============================================================================
// CDP — raw CSV row types + parsers.
//
// Fuente: exports del partner CDP para La Cabrera (tres CSVs).
// Estos tipos reflejan la forma del CSV 1:1, sin reinterpretación.
// Un mapper separado (`cdpGuestPartnerToProfile`) traduce al dominio.
// ============================================================================

import Papa from 'papaparse';
import type { GuestProfile } from './types';

// ---------- Insight JSON blobs embebidos en el CSV -------------------------

export interface GuaranteeInsights {
  lastAt: string | null;
  bookings: Array<{ date: string; amount: number; visitId: string }>;
  totalAmount: number;
  totalBookings: number;
}

export interface CancellationInsights {
  lastAt: string | null;
  lastBy: 'GUEST' | 'VENUE' | null;
  cancellations: Array<{
    by: 'GUEST' | 'VENUE';
    date: string;
    reason: string;
    visitId: string;
  }>;
  cancelledByGuest: number;
  cancelledByVenue: number;
  totalCancellations: number;
}

export interface ReviewInsights {
  reviews: Array<Record<string, unknown>>;
  totalRating: number;
  totalReviews: number;
  foodRatingCount: number;
  totalFoodRating: number;
  serviceRatingCount: number;
  totalServiceRating: number;
  ambienceRatingCount: number;
  totalAmbienceRating: number;
}

export interface ChannelInsights {
  channelMigrated: boolean;
  directBookingRate: number;
  lastBookingChannel: string | null;
  firstBookingChannel: string | null;
  preferredBookingChannel: string | null;
}

export interface WaitlistInsights {
  lastAt: string | null;
  firstAt: string | null;
  expired: number;
  pending: number;
  conversions: number;
  totalEntries: number;
  cancellations: number;
  conversionRate: number;
}

// ---------- la_cabrera_cdp_visit.csv ---------------------------------------

export type CdpVisitType = 'RESERVATION' | 'WALKIN' | string;
export type CdpVisitState =
  | 'ACCEPTED'
  | 'CONFIRMED'
  | 'SEATED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'REJECTED'
  | 'PENDING'
  | string;

export interface CdpVisitRow {
  visit_id: string;
  tenant: string;
  partner_id: string;
  /** Direct link to guest (new CSV format). */
  guest_id: string | null;
  visit_type: CdpVisitType;
  party_size: number | null;
  party_size_seated: number | null;
  sector_name: string | null;
  channel: string | null;
  platform: string | null;
  state: CdpVisitState | null;
  visit_outcome: string | null;
  guest_comment: string | null;
  venue_comment: string | null;
  tags: string[];
  arrived_at: string | null;
  departed_at: string | null;
  score: number | null;
  review_food_rating: number | null;
  review_service_rating: number | null;
  review_ambience_rating: number | null;
  review_overall_rating: number | null;
  review_comment: string | null;
  review_venue_reply: string | null;
  review_tags: string[];
  review_visit_type: string | null;
  review_likes_count: number | null;
  review_dislikes_count: number | null;
  discount_percentage: number | null;
  visited_at: string | null;
  has_guarantee: boolean;
  guarantee_amount: number | null;
  cancelled_by: 'GUEST' | 'VENUE' | null;
  cancelled_at: string | null;
  confirmed_at: string | null;
  accepted_at: string | null;
  no_show_at: string | null;
  rejected_at: string | null;
  shift_id: string | null;
  source_state: string | null;
}

// ---------- la_cabrera_guest_partner.csv -----------------------------------

export interface CdpGuestPartnerRow {
  guest_partner_id: string;
  tenant: string;
  /** Direct link to the unified guest id (new CSV format). */
  guest_id: string | null;
  partner_id: string;
  brand_id: string | null;
  guest_name: string | null;
  /** Was `guest_email` in the old CSV. */
  guest_email: string | null;
  /** New CSV only. */
  guest_phone: string | null;
  /** New CSV only — e.g. "AR". */
  guest_phone_iso_code: string | null;
  guest_language: string | null;
  location_name: string | null;
  location_categories: string[];
  location_city: string | null;
  partner_tags: string[];
  special_relationship: string | null;
  food_restrictions: string | null;
  total_visits: number;
  total_walkins: number;
  total_bookings: number;
  total_pending: number;
  total_no_shows: number;
  total_cancellations: number;
  total_rejected: number;
  no_show_rate: number;
  cancellation_rate: number;
  rejection_rate: number;
  booking_conversion_rate: number;
  confirmation_rate: number;
  guarantee_insights: GuaranteeInsights | null;
  cancellation_insights: CancellationInsights | null;
  review_insights: ReviewInsights | null;
  channel_insights: ChannelInsights | null;
  waitlist_insights: WaitlistInsights | null;
  preferred_visit_context: string | null;
  total_lead_time_minutes: number | null;
  completed_booking_count: number;
  total_score: number | null;
  scored_visit_count: number;
  last_score: number | null;
  last_scored_at: string | null;
  last_lead_time_minutes: number | null;
  last_review_rating: number | null;
  total_party_size: number | null;
  party_size_count: number;
  total_seated_guests: number | null;
  seated_visit_count: number;
  total_guests_brought: number;
  is_favorite: boolean;
  preferred_visit_type: string | null;
  preferred_platform: string | null;
  booking_tags: string[];
  preferred_shift: string | null;
  preferred_day_of_week: string | null;
  preferred_sector: string | null;
  preferred_channel: string | null;
  first_booking_channel: string | null;
  direct_booking_rate: number;
  direct_booking_count: number;
  total_venue_notes: number;
  is_banned: boolean;
  first_visit_at: string | null;
  last_visit_at: string | null;
  days_since_last: number | null;
  total_days_between_visits: number | null;
  visit_gap_count: number;
  next_visit_at: string | null;
  days_until_next: number | null;
  calculated_at: string | null;
  review_experience_tags: string[];
  avg_discount_percentage: number | null;
  total_discounted_visits: number;
  last_booking_channel: string | null;
  is_highlighted: boolean;
  source: string | null;
}

// ---------- la_cabrera_guest_unified.csv -----------------------------------
// Cross-brand unified guest. Útil para dedup entre restaurantes,
// no se usa en el MVP single-tenant.

export interface CdpGuestUnifiedRow {
  guest_id: string;
  name: string | null;
  /** New CSV only. */
  company_name: string | null;
  primary_email: string | null;
  /** New CSV only. */
  primary_phone: string | null;
  /** New CSV only — e.g. "AR". */
  primary_phone_iso_code: string | null;
  total_tenants: number;
  total_locations: number;
  total_visits_global: number;
  total_walkins_global: number;
  total_bookings_global: number;
  total_no_shows_global: number;
  total_cancellations_global: number;
  total_rejected_global: number;
  total_referrals_made: number;
  global_no_show_rate: number;
  total_guests_brought: number;
  platform_score: number | null;
  guarantee_insights: GuaranteeInsights | null;
  cancellation_insights: CancellationInsights | null;
  review_insights: ReviewInsights | null;
  total_lead_time_minutes: number | null;
  completed_booking_count: number;
  total_score: number | null;
  scored_visit_count: number;
  last_score: number | null;
  last_scored_at: string | null;
  last_lead_time_minutes: number | null;
  total_party_size: number | null;
  party_size_count: number;
  total_seated_guests: number | null;
  seated_visit_count: number;
  total_days_between_visits: number | null;
  visit_gap_count: number;
  total_venue_notes_global: number;
  favorite_partner_id: string | null;
  favorite_location_name: string | null;
  preferred_visit_type: string | null;
  preferred_shift: string | null;
  preferred_day_of_week: string | null;
  channel_insights: ChannelInsights | null;
  food_restrictions: string | null;
  is_banned: boolean;
  cuisine_preferences: string[];
  visited_cities: string[];
  first_seen_at: string | null;
  last_seen_at: string | null;
  days_since_last: number | null;
  next_visit_at: string | null;
  days_until_next: number | null;
  next_visit_location_name: string | null;
  calculated_at: string | null;
  guest_language: string | null;
  global_cancellation_rate: number;
  global_rejection_rate: number;
  global_booking_conversion_rate: number;
  global_confirmation_rate: number;
  waitlist_insights: WaitlistInsights | null;
  preferred_platform: string | null;
  preferred_channel: string | null;
  total_pending_global: number;
  last_review_rating: number | null;
  review_experience_tags: string[];
  avg_discount_percentage: number | null;
  total_discounted_visits_global: number;
  source: string | null;
}

// ---------- Coercion helpers -----------------------------------------------

type Raw = string | undefined;

const str = (v: Raw): string | null => {
  if (v === undefined) return null;
  const t = v.trim();
  return t === '' ? null : t;
};

const num = (v: Raw): number | null => {
  const s = str(v);
  if (s === null) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const numOr = (v: Raw, fallback: number): number => num(v) ?? fallback;

const bool = (v: Raw): boolean => str(v)?.toLowerCase() === 'true';

/**
 * El CDP exporta fechas envueltas en comillas: el CSV trae `"""ISO"""`, que
 * papaparse decodea a `"ISO"` (con las comillas literales). Acá las sacamos.
 */
const date = (v: Raw): string | null => {
  const s = str(v);
  if (s === null) return null;
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) {
    return s.slice(1, -1);
  }
  return s;
};

const arr = (v: Raw): string[] => {
  const s = str(v);
  if (s === null) return [];
  try {
    const parsed = JSON.parse(s);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const json = <T>(v: Raw): T | null => {
  const s = str(v);
  if (s === null) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
};

function parseCsv<T extends Record<string, string>>(csv: string): T[] {
  const result = Papa.parse<T>(csv, {
    header: true,
    skipEmptyLines: true,
  });
  return result.data;
}

// ---------- Parsers ---------------------------------------------------------

export function parseCdpVisitCsv(csv: string): CdpVisitRow[] {
  return parseCsv(csv).map(
    (r): CdpVisitRow => ({
      visit_id: r.visit_id ?? '',
      tenant: r.tenant ?? '',
      partner_id: r.partner_id ?? '',
      guest_id: str(r.guest_id),
      visit_type: r.visit_type ?? '',
      party_size: num(r.party_size),
      party_size_seated: num(r.party_size_seated),
      sector_name: str(r.sector_name),
      channel: str(r.channel),
      platform: str(r.platform),
      state: str(r.state),
      visit_outcome: str(r.visit_outcome),
      guest_comment: str(r.guest_comment),
      venue_comment: str(r.venue_comment),
      tags: arr(r.tags),
      arrived_at: date(r.arrived_at),
      departed_at: date(r.departed_at),
      score: num(r.score),
      review_food_rating: num(r.review_food_rating),
      review_service_rating: num(r.review_service_rating),
      review_ambience_rating: num(r.review_ambience_rating),
      review_overall_rating: num(r.review_overall_rating),
      review_comment: str(r.review_comment),
      review_venue_reply: str(r.review_venue_reply),
      review_tags: arr(r.review_tags),
      review_visit_type: str(r.review_visit_type),
      review_likes_count: num(r.review_likes_count),
      review_dislikes_count: num(r.review_dislikes_count),
      discount_percentage: num(r.discount_percentage),
      visited_at: date(r.visited_at),
      has_guarantee: bool(r.has_guarantee),
      guarantee_amount: num(r.guarantee_amount),
      cancelled_by: (str(r.cancelled_by) as 'GUEST' | 'VENUE' | null) ?? null,
      cancelled_at: date(r.cancelled_at),
      confirmed_at: date(r.confirmed_at),
      accepted_at: date(r.accepted_at),
      no_show_at: date(r.no_show_at),
      rejected_at: date(r.rejected_at),
      shift_id: str(r.shift_id),
      source_state: str(r.source_state),
    }),
  );
}

export function parseCdpGuestPartnerCsv(csv: string): CdpGuestPartnerRow[] {
  return parseCsv(csv).map(
    (r): CdpGuestPartnerRow => ({
      guest_partner_id: r.guest_partner_id ?? '',
      tenant: r.tenant ?? '',
      guest_id: str(r.guest_id),
      partner_id: r.partner_id ?? '',
      brand_id: str(r.brand_id),
      guest_name: str(r.guest_name),
      // New CSV uses `guest_primary_email`; old CSV used `guest_email`. Accept both.
      guest_email: str(r.guest_primary_email ?? r.guest_email),
      guest_phone: str(r.guest_primary_phone),
      guest_phone_iso_code: str(r.guest_phone_iso_code),
      guest_language: str(r.guest_language),
      location_name: str(r.location_name),
      location_categories: arr(r.location_categories),
      location_city: str(r.location_city),
      partner_tags: arr(r.partner_tags),
      special_relationship: str(r.special_relationship),
      food_restrictions: str(r.food_restrictions),
      total_visits: numOr(r.total_visits, 0),
      total_walkins: numOr(r.total_walkins, 0),
      total_bookings: numOr(r.total_bookings, 0),
      total_pending: numOr(r.total_pending, 0),
      total_no_shows: numOr(r.total_no_shows, 0),
      total_cancellations: numOr(r.total_cancellations, 0),
      total_rejected: numOr(r.total_rejected, 0),
      no_show_rate: numOr(r.no_show_rate, 0),
      cancellation_rate: numOr(r.cancellation_rate, 0),
      rejection_rate: numOr(r.rejection_rate, 0),
      booking_conversion_rate: numOr(r.booking_conversion_rate, 0),
      confirmation_rate: numOr(r.confirmation_rate, 0),
      guarantee_insights: json<GuaranteeInsights>(r.guarantee_insights),
      cancellation_insights: json<CancellationInsights>(r.cancellation_insights),
      review_insights: json<ReviewInsights>(r.review_insights),
      channel_insights: json<ChannelInsights>(r.channel_insights),
      waitlist_insights: json<WaitlistInsights>(r.waitlist_insights),
      preferred_visit_context: str(r.preferred_visit_context),
      total_lead_time_minutes: num(r.total_lead_time_minutes),
      completed_booking_count: numOr(r.completed_booking_count, 0),
      total_score: num(r.total_score),
      scored_visit_count: numOr(r.scored_visit_count, 0),
      last_score: num(r.last_score),
      last_scored_at: date(r.last_scored_at),
      last_lead_time_minutes: num(r.last_lead_time_minutes),
      last_review_rating: num(r.last_review_rating),
      total_party_size: num(r.total_party_size),
      party_size_count: numOr(r.party_size_count, 0),
      total_seated_guests: num(r.total_seated_guests),
      seated_visit_count: numOr(r.seated_visit_count, 0),
      total_guests_brought: numOr(r.total_guests_brought, 0),
      is_favorite: bool(r.is_favorite),
      preferred_visit_type: str(r.preferred_visit_type),
      preferred_platform: str(r.preferred_platform),
      booking_tags: arr(r.booking_tags),
      preferred_shift: str(r.preferred_shift),
      preferred_day_of_week: str(r.preferred_day_of_week),
      preferred_sector: str(r.preferred_sector),
      preferred_channel: str(r.preferred_channel),
      first_booking_channel: str(r.first_booking_channel),
      direct_booking_rate: numOr(r.direct_booking_rate, 0),
      direct_booking_count: numOr(r.direct_booking_count, 0),
      total_venue_notes: numOr(r.total_venue_notes, 0),
      is_banned: bool(r.is_banned),
      first_visit_at: date(r.first_visit_at),
      last_visit_at: date(r.last_visit_at),
      days_since_last: num(r.days_since_last),
      total_days_between_visits: num(r.total_days_between_visits),
      visit_gap_count: numOr(r.visit_gap_count, 0),
      next_visit_at: date(r.next_visit_at),
      days_until_next: num(r.days_until_next),
      calculated_at: date(r.calculated_at),
      review_experience_tags: arr(r.review_experience_tags),
      avg_discount_percentage: num(r.avg_discount_percentage),
      total_discounted_visits: numOr(r.total_discounted_visits, 0),
      last_booking_channel: str(r.last_booking_channel),
      is_highlighted: bool(r.is_highlighted),
      source: str(r.source),
    }),
  );
}

export function parseCdpGuestUnifiedCsv(csv: string): CdpGuestUnifiedRow[] {
  return parseCsv(csv).map(
    (r): CdpGuestUnifiedRow => ({
      guest_id: r.guest_id ?? '',
      name: str(r.name),
      company_name: str(r.company_name),
      primary_email: str(r.primary_email),
      primary_phone: str(r.primary_phone),
      primary_phone_iso_code: str(r.primary_phone_iso_code),
      total_tenants: numOr(r.total_tenants, 0),
      total_locations: numOr(r.total_locations, 0),
      total_visits_global: numOr(r.total_visits_global, 0),
      total_walkins_global: numOr(r.total_walkins_global, 0),
      total_bookings_global: numOr(r.total_bookings_global, 0),
      total_no_shows_global: numOr(r.total_no_shows_global, 0),
      total_cancellations_global: numOr(r.total_cancellations_global, 0),
      total_rejected_global: numOr(r.total_rejected_global, 0),
      total_referrals_made: numOr(r.total_referrals_made, 0),
      global_no_show_rate: numOr(r.global_no_show_rate, 0),
      total_guests_brought: numOr(r.total_guests_brought, 0),
      platform_score: num(r.platform_score),
      guarantee_insights: json<GuaranteeInsights>(r.guarantee_insights),
      cancellation_insights: json<CancellationInsights>(r.cancellation_insights),
      review_insights: json<ReviewInsights>(r.review_insights),
      total_lead_time_minutes: num(r.total_lead_time_minutes),
      completed_booking_count: numOr(r.completed_booking_count, 0),
      total_score: num(r.total_score),
      scored_visit_count: numOr(r.scored_visit_count, 0),
      last_score: num(r.last_score),
      last_scored_at: date(r.last_scored_at),
      last_lead_time_minutes: num(r.last_lead_time_minutes),
      total_party_size: num(r.total_party_size),
      party_size_count: numOr(r.party_size_count, 0),
      total_seated_guests: num(r.total_seated_guests),
      seated_visit_count: numOr(r.seated_visit_count, 0),
      total_days_between_visits: num(r.total_days_between_visits),
      visit_gap_count: numOr(r.visit_gap_count, 0),
      total_venue_notes_global: numOr(r.total_venue_notes_global, 0),
      favorite_partner_id: str(r.favorite_partner_id),
      favorite_location_name: str(r.favorite_location_name),
      preferred_visit_type: str(r.preferred_visit_type),
      preferred_shift: str(r.preferred_shift),
      preferred_day_of_week: str(r.preferred_day_of_week),
      channel_insights: json<ChannelInsights>(r.channel_insights),
      food_restrictions: str(r.food_restrictions),
      is_banned: bool(r.is_banned),
      cuisine_preferences: arr(r.cuisine_preferences),
      visited_cities: arr(r.visited_cities),
      first_seen_at: date(r.first_seen_at),
      last_seen_at: date(r.last_seen_at),
      days_since_last: num(r.days_since_last),
      next_visit_at: date(r.next_visit_at),
      days_until_next: num(r.days_until_next),
      next_visit_location_name: str(r.next_visit_location_name),
      calculated_at: date(r.calculated_at),
      guest_language: str(r.guest_language),
      global_cancellation_rate: numOr(r.global_cancellation_rate, 0),
      global_rejection_rate: numOr(r.global_rejection_rate, 0),
      global_booking_conversion_rate: numOr(r.global_booking_conversion_rate, 0),
      global_confirmation_rate: numOr(r.global_confirmation_rate, 0),
      waitlist_insights: json<WaitlistInsights>(r.waitlist_insights),
      preferred_platform: str(r.preferred_platform),
      preferred_channel: str(r.preferred_channel),
      total_pending_global: numOr(r.total_pending_global, 0),
      last_review_rating: num(r.last_review_rating),
      review_experience_tags: arr(r.review_experience_tags),
      avg_discount_percentage: num(r.avg_discount_percentage),
      total_discounted_visits_global: numOr(r.total_discounted_visits_global, 0),
      source: str(r.source),
    }),
  );
}

// ---------- Mapper → dominio -----------------------------------------------

/**
 * Traduce una fila de `guest_partner` al `GuestProfile` de dominio.
 *
 * El CDP ya trae los agregados calculados (no_show_rate, preferred_shift, etc.),
 * así que el mapper es casi un rename. Los campos derivados (RFM, segment,
 * tier) los deja como placeholders: el motor de segmentación en `lib/segmentation.ts`
 * los asigna a partir de recency/frequency/monetary.
 */
export function cdpGuestPartnerToProfile(
  row: CdpGuestPartnerRow,
  restaurantId: string,
): GuestProfile {
  const avgPartySize =
    row.party_size_count > 0 && row.total_party_size !== null
      ? row.total_party_size / row.party_size_count
      : null;

  const avgDaysBetweenVisits =
    row.visit_gap_count > 0 && row.total_days_between_visits !== null
      ? row.total_days_between_visits / row.visit_gap_count
      : null;

  const totalSpent = row.guarantee_insights?.totalAmount ?? null;
  const avgAmount =
    totalSpent !== null && row.total_visits > 0
      ? totalSpent / row.total_visits
      : null;

  return {
    id: row.guest_partner_id,
    guest_id: row.guest_partner_id,
    restaurant_id: restaurantId,
    total_visits: row.total_visits,
    total_no_shows: row.total_no_shows,
    total_cancellations: row.total_cancellations,
    first_visit_at: row.first_visit_at,
    last_visit_at: row.last_visit_at,
    days_since_last: row.days_since_last,
    avg_days_between_visits: avgDaysBetweenVisits,
    avg_party_size: avgPartySize,
    avg_amount: avgAmount,
    total_spent: totalSpent,
    avg_score:
      row.scored_visit_count > 0 && row.total_score !== null
        ? row.total_score / row.scored_visit_count
        : null,
    preferred_shift: row.preferred_shift,
    preferred_day_of_week: row.preferred_day_of_week,
    preferred_sector: row.preferred_sector,
    rfm_recency: null,
    rfm_frequency: null,
    rfm_monetary: null,
    rfm_score: null,
    segment: 'new',
    tier: 'occasional',
    calculated_at: row.calculated_at ?? new Date().toISOString(),
  };
}
