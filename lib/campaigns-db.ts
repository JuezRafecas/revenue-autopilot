import type { Campaign, CampaignMetrics, CampaignStatus, CampaignTrigger, Channel, TemplateKey, WorkflowStep } from './types';
import { computeRates, emptyMetrics } from './campaigns';

// ============================================================================
// Campaign row ↔ domain object mapping
// ============================================================================
//
// The `campaigns` table stores metrics in denormalized columns
// (`metric_sent`, `metric_delivered`, ...) and renames `trigger` → `trigger_config`.
// These helpers hide that impedance mismatch from the routes.

export interface CampaignRow {
  id: string;
  restaurant_id: string;
  template_key: TemplateKey | null;
  type: 'automation' | 'one_shot';
  name: string;
  description: string | null;
  status: CampaignStatus;
  audience_filter: Record<string, unknown>;
  trigger_config: Record<string, unknown>;
  workflow: unknown[];
  channels: string[];
  metric_sent: number;
  metric_delivered: number;
  metric_read: number;
  metric_responded: number;
  metric_converted: number;
  metric_failed: number;
  metric_revenue_attributed: number | string;
  estimated_revenue: number | string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export function campaignFromRow(row: CampaignRow): Campaign {
  const baseMetrics: CampaignMetrics = {
    ...emptyMetrics(),
    sent: row.metric_sent,
    delivered: row.metric_delivered,
    read: row.metric_read,
    responded: row.metric_responded,
    converted: row.metric_converted,
    failed: row.metric_failed,
    revenue_attributed: Number(row.metric_revenue_attributed ?? 0),
  };

  return {
    id: row.id,
    restaurant_id: row.restaurant_id,
    template_key: row.template_key,
    type: row.type,
    name: row.name,
    description: row.description,
    status: row.status,
    audience_filter: row.audience_filter as Campaign['audience_filter'],
    trigger: row.trigger_config as unknown as CampaignTrigger,
    workflow: row.workflow as WorkflowStep[],
    channels: row.channels as Channel[],
    metrics: computeRates(baseMetrics),
    estimated_revenue: row.estimated_revenue == null ? null : Number(row.estimated_revenue),
    created_at: row.created_at,
    updated_at: row.updated_at,
    started_at: row.started_at,
    completed_at: row.completed_at,
  };
}

export function campaignInsertPayload(
  draft: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>,
): Record<string, unknown> {
  return {
    restaurant_id: draft.restaurant_id,
    template_key: draft.template_key,
    type: draft.type,
    name: draft.name,
    description: draft.description,
    status: draft.status,
    audience_filter: draft.audience_filter,
    trigger_config: draft.trigger,
    workflow: draft.workflow,
    channels: draft.channels,
    metric_sent: draft.metrics.sent,
    metric_delivered: draft.metrics.delivered,
    metric_read: draft.metrics.read,
    metric_responded: draft.metrics.responded,
    metric_converted: draft.metrics.converted,
    metric_failed: draft.metrics.failed,
    metric_revenue_attributed: draft.metrics.revenue_attributed,
    estimated_revenue: draft.estimated_revenue,
    started_at: draft.started_at,
    completed_at: draft.completed_at,
  };
}
