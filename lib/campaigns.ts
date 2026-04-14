import type {
  BranchStep,
  Campaign,
  CampaignMetrics,
  CampaignStatus,
  Channel,
  TemplateKey,
  WorkflowStep,
} from './types';
import { TEMPLATES } from './templates';

// ============================================================================
// Campaign lifecycle helpers
// ============================================================================

export const CAMPAIGN_STATUS_ORDER: CampaignStatus[] = [
  'active',
  'scheduled',
  'paused',
  'draft',
  'completed',
  'archived',
];

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: 'Borrador',
  scheduled: 'Programada',
  active: 'Activa',
  paused: 'Pausada',
  completed: 'Completada',
  archived: 'Archivada',
};

export const CAMPAIGN_STATUS_TONE: Record<CampaignStatus, 'positive' | 'warning' | 'muted' | 'neutral'> = {
  active: 'positive',
  scheduled: 'neutral',
  paused: 'warning',
  draft: 'muted',
  completed: 'muted',
  archived: 'muted',
};

export function emptyMetrics(): CampaignMetrics {
  return {
    sent: 0,
    delivered: 0,
    read: 0,
    responded: 0,
    converted: 0,
    failed: 0,
    revenue_attributed: 0,
    delivery_rate: 0,
    read_rate: 0,
    response_rate: 0,
    conversion_rate: 0,
  };
}

export function computeRates(metrics: CampaignMetrics): CampaignMetrics {
  const { sent, delivered, read, responded, converted } = metrics;
  return {
    ...metrics,
    delivery_rate: sent === 0 ? 0 : delivered / sent,
    read_rate: delivered === 0 ? 0 : read / delivered,
    response_rate: read === 0 ? 0 : responded / read,
    conversion_rate: sent === 0 ? 0 : converted / sent,
  };
}

/**
 * Instantiate a new draft campaign from a template key.
 * Pure function — does not hit the database.
 */
export function campaignFromTemplate(
  templateKey: TemplateKey,
  restaurantId: string,
  overrides: Partial<Campaign> = {}
): Omit<Campaign, 'id' | 'created_at' | 'updated_at'> {
  const tpl = TEMPLATES[templateKey];
  return {
    restaurant_id: restaurantId,
    template_key: templateKey,
    type: tpl.type,
    name: overrides.name ?? tpl.name,
    description: overrides.description ?? tpl.description,
    status: overrides.status ?? 'draft',
    audience_filter: overrides.audience_filter ?? tpl.default_audience,
    trigger: overrides.trigger ?? tpl.default_trigger,
    workflow: overrides.workflow ?? tpl.workflow,
    channels: overrides.channels ?? deriveChannels(tpl.workflow),
    metrics: overrides.metrics ?? emptyMetrics(),
    estimated_revenue: overrides.estimated_revenue ?? null,
    started_at: null,
    completed_at: null,
  };
}

export function deriveChannels(workflow: WorkflowStep[]): Channel[] {
  const seen = new Set<Channel>();
  for (const step of workflow) {
    if (step.kind === 'send_message') seen.add(step.channel);
    if (step.kind === 'make_call') seen.add('call');
  }
  return Array.from(seen);
}

/**
 * Build a one-shot voice campaign draft from a CSV audience.
 * Pure function — does not hit the database.
 */
export function voiceCampaignDraft(
  restaurantId: string,
  args: {
    name: string;
    scheduleAt: string;
    members: Array<{ name: string; phone: string }>;
  },
): Omit<Campaign, 'id' | 'created_at' | 'updated_at'> {
  const workflow: WorkflowStep[] = [
    { id: 'call_guest', kind: 'make_call', next: 'end' },
    { id: 'end', kind: 'end', outcome: 'completed' },
  ];
  return {
    restaurant_id: restaurantId,
    template_key: null,
    type: 'one_shot',
    name: args.name,
    description: null,
    status: 'draft',
    audience_filter: { members: args.members },
    trigger: { type: 'schedule', at: args.scheduleAt },
    workflow,
    channels: deriveChannels(workflow),
    metrics: emptyMetrics(),
    estimated_revenue: null,
    started_at: null,
    completed_at: null,
  };
}

/**
 * Walk a workflow from start to a terminal end step, collecting the path
 * taken given a list of branch decisions (label → matches value).
 * Used to render the live-path highlight in the WorkflowDiagram.
 */
export function walkWorkflow(
  workflow: WorkflowStep[],
  decisions: Record<string, string> = {}
): string[] {
  const byId = new Map(workflow.map((s) => [s.id, s]));
  const start = workflow[0];
  if (!start) return [];
  const path: string[] = [];
  let current: WorkflowStep | undefined = start;
  const seen = new Set<string>();
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    path.push(current.id);
    if (current.kind === 'end') break;
    if (current.kind === 'branch') {
      const branchStep: BranchStep = current;
      const match = decisions[branchStep.id];
      const branch: BranchStep['branches'][number] | undefined =
        branchStep.branches.find((b) => b.matches === match) ?? branchStep.branches[0];
      current = branch ? byId.get(branch.next) : undefined;
      continue;
    }
    if ('next' in current && current.next) {
      current = byId.get(current.next);
      continue;
    }
    current = undefined;
  }
  return path;
}

export function countWorkflowSends(workflow: WorkflowStep[]): number {
  return workflow.filter((s) => s.kind === 'send_message').length;
}

export function countWorkflowBranches(workflow: WorkflowStep[]): number {
  return workflow.filter((s) => s.kind === 'branch').length;
}
