// ============================================================================
// Nomi - Guest Autopilot — Domain Types
// ============================================================================

// ---------- Core entities ---------------------------------------------------

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  avg_ticket: number;
  currency: string;
  timezone?: string;
}

export interface Guest {
  id: string;
  restaurant_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  opt_in_whatsapp?: boolean;
  opt_in_email?: boolean;
  created_at?: string;
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

// ---------- Segmentation ----------------------------------------------------

export type Segment = 'lead' | 'new' | 'active' | 'at_risk' | 'dormant' | 'vip';

/** Value-tier alias used in audience definitions. */
export type AudienceTier = 'vip' | 'frequent' | 'occasional';

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
  tier: AudienceTier;
  calculated_at: string;
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
  actionType: ActionType | 'promote_event';
}

// ---------- Channels --------------------------------------------------------

export type Channel = 'whatsapp' | 'email' | 'whatsapp_then_email' | 'call';

// ---------- Audience filters ------------------------------------------------

/**
 * JSON shape persisted on a campaign to define its audience dynamically.
 * Evaluated against guest_profiles at run-time to materialize the contact list.
 */
export interface AudienceFilter {
  /** Lifecycle segments that are eligible. Empty = all. */
  segments?: Segment[];
  /** Value tiers that are eligible. Empty = all. */
  tiers?: AudienceTier[];
  /** Min total visits threshold. */
  min_total_visits?: number;
  /** Max total visits threshold. */
  max_total_visits?: number;
  /** Require last visit within N days. */
  visited_in_last_days?: number;
  /** Require last visit older than N days. */
  not_visited_in_last_days?: number;
  /** Preferred day of week. */
  preferred_day_of_week?: string;
  /** Preferred shift. */
  preferred_shift?: string;
  /** Opt-in required on a channel. */
  requires_opt_in?: Channel;
  /** Inline audience members loaded from a CSV. When present the runner
   *  uses this list directly and ignores any filters resolved against
   *  guest_profiles. */
  members?: Array<{ name: string; phone: string }>;
}

// ---------- Events / triggers -----------------------------------------------

export type EventType =
  | 'visit_completed'
  | 'visit_detected'
  | 'no_visit_threshold_reached'
  | 'low_occupancy_detected'
  | 'manual_enrollment';

export type TriggerType = 'event' | 'schedule' | 'manual';

export interface EventTrigger {
  type: 'event';
  event: EventType;
  delay_hours?: number;
}

export interface ScheduleTrigger {
  type: 'schedule';
  /** ISO string for one_shot, or cron expression for recurring. */
  at: string;
}

export interface ManualTrigger {
  type: 'manual';
}

export type CampaignTrigger = EventTrigger | ScheduleTrigger | ManualTrigger;

export interface EventRecord {
  id: string;
  restaurant_id: string;
  event_type: EventType;
  guest_id: string | null;
  visit_id: string | null;
  payload: Record<string, unknown>;
  processed_at: string | null;
  created_at: string;
}

// ---------- Workflow steps --------------------------------------------------

export type WorkflowStepKind = 'send_message' | 'make_call' | 'wait' | 'branch' | 'end';

export type BranchConditionKind =
  | 'message_response'
  | 'visit_since_step'
  | 'custom';

export interface SendMessageStep {
  id: string;
  kind: 'send_message';
  channel: Channel;
  template_id: string;
  prompt_key: string;
  fallback?: {
    retry_after_hours: number;
    retry_channel?: Channel;
    max_retries: number;
  };
  next?: string;
}

export interface MakeCallStep {
  id: string;
  kind: 'make_call';
  /** Optional script hint for the (future) voice provider. */
  script?: string;
  next?: string;
}

export interface WaitStep {
  id: string;
  kind: 'wait';
  hours: number;
  next?: string;
}

export interface BranchStep {
  id: string;
  kind: 'branch';
  condition: BranchConditionKind;
  branches: Array<{
    label: string;
    matches: string;
    next: string;
  }>;
}

export interface EndStep {
  id: string;
  kind: 'end';
  outcome: 'completed' | 'escalated';
}

export type WorkflowStep = SendMessageStep | MakeCallStep | WaitStep | BranchStep | EndStep;

// ---------- Templates -------------------------------------------------------

export type TemplateKey =
  | 'post_visit_smart'
  | 'first_to_second_visit'
  | 'reactivate_inactive'
  | 'promote_event'
  | 'fill_empty_tables';

export type CampaignType = 'automation' | 'one_shot';

export type ActionType = 'reactivation' | 'second_visit' | 'fill_tables' | 'post_visit';

export interface CampaignTemplate {
  key: TemplateKey;
  type: CampaignType;
  name: string;
  description: string;
  headline: string;
  /** Dominant accent color key for this template (maps to segment colors). */
  accent: Segment;
  default_audience: AudienceFilter;
  default_trigger: CampaignTrigger;
  workflow: WorkflowStep[];
  kpi_labels: Array<{ label: string; key: string }>;
}

// ---------- Campaigns -------------------------------------------------------

export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'completed'
  | 'archived';

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  read: number;
  responded: number;
  converted: number;
  failed: number;
  revenue_attributed: number;
  /** Pre-computed rates for display. */
  delivery_rate: number;
  read_rate: number;
  response_rate: number;
  conversion_rate: number;
}

export interface Campaign {
  id: string;
  restaurant_id: string;
  template_key: TemplateKey | null;
  type: CampaignType;
  name: string;
  description: string | null;
  status: CampaignStatus;
  audience_filter: AudienceFilter;
  trigger: CampaignTrigger;
  workflow: WorkflowStep[];
  channels: Channel[];
  metrics: CampaignMetrics;
  estimated_revenue: number | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
}

// ---------- Messages --------------------------------------------------------

export type MessageStatus =
  | 'pending_approval'
  | 'approved'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'responded'
  | 'converted'
  | 'failed'
  | 'skipped';

export type MessageResponse = 'positive' | 'negative' | 'no_response';

export interface Message {
  id: string;
  restaurant_id: string;
  campaign_id: string | null;
  workflow_step_id: string | null;
  guest_id: string;
  channel: Channel;
  content: string;
  status: MessageStatus;
  response_type: MessageResponse | null;
  response_content: string | null;
  created_at: string;
  approved_at: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  responded_at: string | null;
  converted_at: string | null;
  failed_at: string | null;
  error_message: string | null;
  estimated_revenue: number | null;
  realized_revenue: number | null;
  /** Hydrated when reading. */
  guest?: Guest;
  campaign?: Campaign;
}

// ---------- Attribution -----------------------------------------------------

export interface Attribution {
  id: string;
  restaurant_id: string;
  campaign_id: string;
  message_id: string;
  guest_id: string;
  visit_id: string | null;
  amount: number;
  attribution_window_days: number;
  attributed_at: string;
}

export interface AttributionSummary {
  campaign_id: string;
  campaign_name: string;
  template_key: TemplateKey | null;
  messages_sent: number;
  conversions: number;
  revenue: number;
  rate: number;
}

// ---------- KPI dashboard ---------------------------------------------------

export interface DashboardKPIs {
  active_campaigns: number;
  messages_sent_30d: number;
  response_rate_30d: number;
  revenue_attributed_30d: number;
  revenue_at_stake: number;
  total_guests: number;
  base_health_score: number;
}
