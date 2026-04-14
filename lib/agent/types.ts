import type {
  AudienceFilter,
  Campaign,
  CampaignTrigger,
  Channel,
  Guest,
  Segment,
  TemplateKey,
  WorkflowStep,
} from '../types';

export type OpportunitySeverity = 'high' | 'medium' | 'low';

export type OpportunityType =
  | 'reactivate_dormant'
  | 'reactivate_at_risk'
  | 'second_visit_leak'
  | 'fill_empty_tables';

export interface Opportunity {
  id: string;
  type: OpportunityType;
  severity: OpportunitySeverity;
  target_segment: Segment;
  suggested_template_key: TemplateKey;
  headline: string;
  reasoning: string;
  audience_size: number;
  revenue_potential: number;
  confidence: number;
  detected_at: string;
}

/**
 * Draft campaign as returned by the `draftCampaign` tool — same shape as a
 * persisted Campaign minus the DB-managed fields, plus the agent reasoning.
 */
export type CampaignDraft = Omit<
  Campaign,
  'id' | 'created_at' | 'updated_at' | 'metrics'
> & {
  audience_filter: AudienceFilter;
  trigger: CampaignTrigger;
  workflow: WorkflowStep[];
  channels: Channel[];
  reasoning: string;
  described_audience: string;
  source: 'nomi';
};

export interface QueryCustomersResult {
  count: number;
  sample: Array<Pick<Guest, 'id' | 'name' | 'phone' | 'email'> & { last_visit_at: string | null }>;
  avg_visits: number;
  avg_spent: number;
}

export interface SegmentMetricRow {
  segment: Segment;
  count: number;
  percentage: number;
  revenue_at_stake: number;
}

export interface CampaignResultsSummary {
  id: string;
  name: string;
  status: string;
  sent: number;
  delivered: number;
  read: number;
  responded: number;
  converted: number;
  revenue_attributed: number;
  response_rate: number;
  conversion_rate: number;
}
