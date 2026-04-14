export type Segment = 'lead' | 'new' | 'active' | 'at_risk' | 'dormant' | 'vip';

export type ActionType =
  | 'reactivation'
  | 'second_visit'
  | 'fill_tables'
  | 'post_visit'
  | 'promote_event';

export type ActionStatus = 'pending' | 'approved' | 'sent' | 'delivered' | 'converted';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  avg_ticket: number;
  currency: string;
}

export interface Guest {
  id: string;
  restaurant_id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface Visit {
  id: string;
  guest_id: string;
  restaurant_id: string;
  visit_date: string;
  party_size: number;
  amount: number | null;
  shift: string | null;
  day_of_week: string | null;
  sector: string | null;
  visit_type: string;
  outcome: string;
  score: number | null;
  review_comment: string | null;
}

export interface GuestProfile {
  id: string;
  guest_id: string;
  restaurant_id: string;
  total_visits: number;
  total_no_shows: number;
  total_cancellations: number;
  first_visit_at: string | null;
  last_visit_at: string | null;
  days_since_last: number | null;
  avg_days_between_visits: number | null;
  avg_party_size: number | null;
  avg_amount: number | null;
  total_spent: number | null;
  avg_score: number | null;
  preferred_shift: string | null;
  preferred_day_of_week: string | null;
  preferred_sector: string | null;
  rfm_recency: number | null;
  rfm_frequency: number | null;
  rfm_monetary: number | null;
  rfm_score: string | null;
  segment: Segment;
  calculated_at: string;
  guest?: Guest;
}

export interface Action {
  id: string;
  restaurant_id: string;
  guest_id: string;
  action_type: ActionType;
  message: string;
  channel: string;
  status: ActionStatus;
  estimated_revenue: number | null;
  created_at: string;
  sent_at: string | null;
  converted_at: string | null;
  guest?: Guest;
}

export interface SegmentSummary {
  segment: Segment;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  revenue_opportunity: number;
}

export interface SegmentConfig {
  key: Segment;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  cta: string;
  actionType: ActionType;
}
