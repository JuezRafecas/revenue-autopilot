import type { SupabaseClient } from '@supabase/supabase-js';
import type { Campaign } from '../types';
import { emptyMetrics } from '../campaigns';
import type { CampaignDraft } from './types';

/**
 * Persist a campaign draft (from the agent or from a template picker) to
 * the `campaigns` table. Returns the persisted row.
 */
export async function persistCampaignDraft(
  supabase: SupabaseClient,
  draft: Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'metrics'> & {
    metrics?: Campaign['metrics'];
    source?: string;
    reasoning?: string;
  }
): Promise<Campaign> {
  const row = {
    restaurant_id: draft.restaurant_id,
    template_key: draft.template_key,
    type: draft.type,
    name: draft.name,
    description: draft.description,
    status: draft.status,
    audience_filter: draft.audience_filter,
    trigger: draft.trigger,
    workflow: draft.workflow,
    channels: draft.channels,
    metrics: draft.metrics ?? emptyMetrics(),
    estimated_revenue: draft.estimated_revenue,
    metadata: {
      source: draft.source ?? 'manual',
      reasoning: draft.reasoning ?? null,
    },
  };

  const { data, error } = await supabase
    .from('campaigns')
    .insert(row)
    .select()
    .single();

  if (error) throw error;
  return data as Campaign;
}

export function isValidDraft(draft: unknown): draft is CampaignDraft {
  if (!draft || typeof draft !== 'object') return false;
  const d = draft as Record<string, unknown>;
  return (
    typeof d.restaurant_id === 'string' &&
    typeof d.name === 'string' &&
    typeof d.type === 'string' &&
    Array.isArray(d.workflow) &&
    d.audience_filter != null &&
    d.trigger != null
  );
}
