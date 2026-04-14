import { describe, expect, it } from 'vitest';
import type { CdpGuestPartnerRow } from '../cdp';
import {
  parseCdpGuestPartnerCsv,
  parseCdpVisitCsv,
  cdpGuestPartnerToProfile,
} from '../cdp';

describe('parseCdpVisitCsv', () => {
  it('parsea una reserva con fechas entre comillas triples, tags vacíos y has_guarantee boolean', () => {
    // Fila tomada de la_cabrera_cdp_visit.csv (con las triple-comillas del export).
    const csv = [
      'visit_id,tenant,partner_id,visit_type,party_size,party_size_seated,sector_name,channel,platform,state,visit_outcome,guest_comment,venue_comment,tags,arrived_at,departed_at,score,review_food_rating,review_service_rating,review_ambience_rating,review_overall_rating,review_comment,review_venue_reply,review_tags,review_visit_type,review_likes_count,review_dislikes_count,discount_percentage,visited_at,has_guarantee,guarantee_amount,cancelled_by,cancelled_at,confirmed_at,accepted_at,no_show_at,rejected_at,shift_id,source_state',
      '69b03705dc7dc47bd1858838,partner,8e585a67-6da9-4c8a-b6ca-47c25674bfd3,RESERVATION,3,,Salon sur,QUICK_ADD,,ACCEPTED,PENDING,,,[],,,,,,,,,,,,,,,"""2026-07-19T17:30:00.000Z""",false,,,,,"""2026-03-10T15:21:40.553Z""",,,de16dba8-e73d-4070-bd5d-c880cfd661f8,4',
    ].join('\n');

    const rows = parseCdpVisitCsv(csv);

    expect(rows).toHaveLength(1);
    const row = rows[0]!;
    expect(row.visit_id).toBe('69b03705dc7dc47bd1858838');
    expect(row.visit_type).toBe('RESERVATION');
    expect(row.party_size).toBe(3);
    expect(row.party_size_seated).toBeNull();
    expect(row.sector_name).toBe('Salon sur');
    expect(row.channel).toBe('QUICK_ADD');
    expect(row.state).toBe('ACCEPTED');
    expect(row.tags).toEqual([]);
    expect(row.visited_at).toBe('2026-07-19T17:30:00.000Z');
    expect(row.accepted_at).toBe('2026-03-10T15:21:40.553Z');
    expect(row.has_guarantee).toBe(false);
    expect(row.guarantee_amount).toBeNull();
    expect(row.score).toBeNull();
  });
});

describe('parseCdpGuestPartnerCsv', () => {
  it('parsea agregados numéricos, insights JSON, arrays y fechas triple-quoted', () => {
    const header =
      'guest_partner_id,tenant,partner_id,brand_id,guest_name,guest_email,guest_language,location_name,location_categories,location_city,partner_tags,special_relationship,food_restrictions,total_visits,total_walkins,total_bookings,total_pending,total_no_shows,total_cancellations,total_rejected,no_show_rate,cancellation_rate,rejection_rate,booking_conversion_rate,confirmation_rate,guarantee_insights,cancellation_insights,review_insights,channel_insights,waitlist_insights,preferred_visit_context,total_lead_time_minutes,completed_booking_count,total_score,scored_visit_count,last_score,last_scored_at,last_lead_time_minutes,last_review_rating,total_party_size,party_size_count,total_seated_guests,seated_visit_count,total_guests_brought,is_favorite,preferred_visit_type,preferred_platform,booking_tags,preferred_shift,preferred_day_of_week,preferred_sector,preferred_channel,first_booking_channel,direct_booking_rate,direct_booking_count,total_venue_notes,is_banned,first_visit_at,last_visit_at,days_since_last,total_days_between_visits,visit_gap_count,next_visit_at,days_until_next,calculated_at,review_experience_tags,avg_discount_percentage,total_discounted_visits,last_booking_channel,is_highlighted,source';

    // Reducción de una fila real de la_cabrera_guest_partner.csv: 24 visitas,
    // 3 cancelaciones, insights con totales, array de categorías, fechas envueltas.
    const row =
      'CC5AB85BC1790384FA650EF5306B3414,partner,8e585a67-6da9-4c8a-b6ca-47c25674bfd3,,Guest 51854,guest51854@demo.com,,La Cabrera Palermo,"[""grill"",""steakhouse"",""argentine-cuisine""]",Palermo,[],,,24,0,27,0,0,3,0,0,0.1111,0,0.8889,0.8889,"{""lastAt"":null,""bookings"":[],""totalAmount"":305882.33,""totalBookings"":13}","{""lastAt"":null,""lastBy"":""VENUE"",""cancellations"":[],""cancelledByGuest"":0,""cancelledByVenue"":3,""totalCancellations"":3}","{""reviews"":[],""totalRating"":0,""totalReviews"":0,""foodRatingCount"":0,""totalFoodRating"":0,""serviceRatingCount"":0,""totalServiceRating"":0,""ambienceRatingCount"":0,""totalAmbienceRating"":0}","{""channelMigrated"":false,""directBookingRate"":0,""lastBookingChannel"":""QUICK_ADD"",""firstBookingChannel"":""QUICK_ADD"",""preferredBookingChannel"":""QUICK_ADD""}","{""lastAt"":null,""expired"":0,""firstAt"":null,""pending"":0,""conversions"":0,""totalEntries"":0,""cancellations"":0,""conversionRate"":0}",,115246,24,0,0,,,243,,122,24,16,2,122,false,BOOKING,,[],cena,wednesday,Salon sur,QUICK_ADD,QUICK_ADD,0,0,26,false,"""2025-05-21T23:30:00.000Z""","""2026-03-18T23:30:00.000Z""",21,301,23,,,"""2026-04-09T19:56:26.666Z""",[],,0,QUICK_ADD,false,pipeline';

    const rows = parseCdpGuestPartnerCsv([header, row].join('\n'));

    expect(rows).toHaveLength(1);
    const r = rows[0]!;
    expect(r.guest_partner_id).toBe('CC5AB85BC1790384FA650EF5306B3414');
    expect(r.guest_name).toBe('Guest 51854');
    expect(r.location_name).toBe('La Cabrera Palermo');
    expect(r.location_categories).toEqual([
      'grill',
      'steakhouse',
      'argentine-cuisine',
    ]);
    expect(r.partner_tags).toEqual([]);
    expect(r.total_visits).toBe(24);
    expect(r.total_cancellations).toBe(3);
    expect(r.cancellation_rate).toBeCloseTo(0.1111, 4);
    expect(r.confirmation_rate).toBeCloseTo(0.8889, 4);
    expect(r.guarantee_insights?.totalAmount).toBeCloseTo(305882.33, 2);
    expect(r.guarantee_insights?.totalBookings).toBe(13);
    expect(r.cancellation_insights?.totalCancellations).toBe(3);
    expect(r.cancellation_insights?.cancelledByVenue).toBe(3);
    expect(r.channel_insights?.preferredBookingChannel).toBe('QUICK_ADD');
    expect(r.preferred_shift).toBe('cena');
    expect(r.preferred_day_of_week).toBe('wednesday');
    expect(r.is_favorite).toBe(false);
    expect(r.is_banned).toBe(false);
    expect(r.first_visit_at).toBe('2025-05-21T23:30:00.000Z');
    expect(r.last_visit_at).toBe('2026-03-18T23:30:00.000Z');
    expect(r.days_since_last).toBe(21);
    expect(r.visit_gap_count).toBe(23);
  });
});

describe('cdpGuestPartnerToProfile', () => {
  const baseRow: CdpGuestPartnerRow = {
    guest_partner_id: 'GP123',
    tenant: 'partner',
    guest_id: 'guest_51854',
    partner_id: 'partner-1',
    brand_id: null,
    guest_name: 'Guest 51854',
    guest_email: 'guest51854@demo.com',
    guest_phone: null,
    guest_phone_iso_code: null,
    guest_language: null,
    location_name: 'La Cabrera Palermo',
    location_categories: ['grill', 'steakhouse'],
    location_city: 'Palermo',
    partner_tags: [],
    special_relationship: null,
    food_restrictions: null,
    total_visits: 24,
    total_walkins: 0,
    total_bookings: 27,
    total_pending: 0,
    total_no_shows: 0,
    total_cancellations: 3,
    total_rejected: 0,
    no_show_rate: 0,
    cancellation_rate: 0.1111,
    rejection_rate: 0,
    booking_conversion_rate: 0.8889,
    confirmation_rate: 0.8889,
    guarantee_insights: {
      lastAt: null,
      bookings: [],
      totalAmount: 305882.33,
      totalBookings: 13,
    },
    cancellation_insights: null,
    review_insights: null,
    channel_insights: null,
    waitlist_insights: null,
    preferred_visit_context: null,
    total_lead_time_minutes: 115246,
    completed_booking_count: 24,
    total_score: 0,
    scored_visit_count: 0,
    last_score: null,
    last_scored_at: null,
    last_lead_time_minutes: 243,
    last_review_rating: null,
    total_party_size: 122,
    party_size_count: 24,
    total_seated_guests: 16,
    seated_visit_count: 2,
    total_guests_brought: 122,
    is_favorite: false,
    preferred_visit_type: 'BOOKING',
    preferred_platform: null,
    booking_tags: [],
    preferred_shift: 'cena',
    preferred_day_of_week: 'wednesday',
    preferred_sector: 'Salon sur',
    preferred_channel: 'QUICK_ADD',
    first_booking_channel: 'QUICK_ADD',
    direct_booking_rate: 0,
    direct_booking_count: 0,
    total_venue_notes: 26,
    is_banned: false,
    first_visit_at: '2025-05-21T23:30:00.000Z',
    last_visit_at: '2026-03-18T23:30:00.000Z',
    days_since_last: 21,
    total_days_between_visits: 301,
    visit_gap_count: 23,
    next_visit_at: null,
    days_until_next: null,
    calculated_at: '2026-04-09T19:56:26.666Z',
    review_experience_tags: [],
    avg_discount_percentage: null,
    total_discounted_visits: 0,
    last_booking_channel: 'QUICK_ADD',
    is_highlighted: false,
    source: 'pipeline',
  };

  it('mapea los agregados del CDP al shape del GuestProfile de dominio', () => {
    const profile = cdpGuestPartnerToProfile(baseRow, 'rest-42');

    expect(profile.restaurant_id).toBe('rest-42');
    expect(profile.guest_id).toBe('GP123');
    expect(profile.total_visits).toBe(24);
    expect(profile.total_no_shows).toBe(0);
    expect(profile.total_cancellations).toBe(3);
    expect(profile.first_visit_at).toBe('2025-05-21T23:30:00.000Z');
    expect(profile.last_visit_at).toBe('2026-03-18T23:30:00.000Z');
    expect(profile.days_since_last).toBe(21);
    // 301 días acumulados entre 23 gaps → ~13.09
    expect(profile.avg_days_between_visits).toBeCloseTo(13.09, 2);
    // 122 party size total entre 24 visitas → ~5.08
    expect(profile.avg_party_size).toBeCloseTo(5.08, 2);
    expect(profile.total_spent).toBeCloseTo(305882.33, 2);
    // total_spent / total_visits
    expect(profile.avg_amount).toBeCloseTo(12745.1, 1);
    expect(profile.preferred_shift).toBe('cena');
    expect(profile.preferred_day_of_week).toBe('wednesday');
    expect(profile.preferred_sector).toBe('Salon sur');
    expect(profile.calculated_at).toBe('2026-04-09T19:56:26.666Z');
    // RFM/segment/tier los decide el motor de segmentación aparte.
    expect(profile.rfm_score).toBeNull();
    expect(profile.segment).toBe('new');
    expect(profile.tier).toBe('occasional');
  });

  it('maneja gracefully guest sin visitas ni insights', () => {
    const empty: CdpGuestPartnerRow = {
      ...baseRow,
      total_visits: 0,
      total_party_size: null,
      party_size_count: 0,
      total_days_between_visits: null,
      visit_gap_count: 0,
      guarantee_insights: null,
      first_visit_at: null,
      last_visit_at: null,
      days_since_last: null,
      calculated_at: null,
    };

    const profile = cdpGuestPartnerToProfile(empty, 'rest-42');

    expect(profile.total_visits).toBe(0);
    expect(profile.avg_days_between_visits).toBeNull();
    expect(profile.avg_party_size).toBeNull();
    expect(profile.total_spent).toBeNull();
    expect(profile.avg_amount).toBeNull();
    expect(profile.first_visit_at).toBeNull();
    expect(profile.last_visit_at).toBeNull();
    // calculated_at debe caer a "ahora" cuando el CDP no lo trae.
    expect(profile.calculated_at).toEqual(expect.any(String));
  });
});
