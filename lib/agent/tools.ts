import { tool } from 'ai';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AudienceFilter,
  CampaignMetrics,
  CampaignTrigger,
  GuestProfile,
  Segment,
  TemplateKey,
} from '../types';
import { filterProfiles, describeAudience, SEGMENT_LABEL } from '../audience';
import { campaignFromTemplate, computeRates } from '../campaigns';
import { TEMPLATES, TEMPLATE_ORDER, getTemplate } from '../templates';
import { detectOpportunities } from './opportunities';
import type {
  CampaignDraft,
  CampaignResultsSummary,
  Opportunity,
  QueryCustomersResult,
  SegmentMetricRow,
} from './types';

export interface NomiToolDeps {
  restaurantId: string;
  avgTicket: number;
  supabase: SupabaseClient;
}

const SEGMENT_VALUES = ['lead', 'new', 'active', 'at_risk', 'dormant', 'vip'] as const;
const TIER_VALUES = ['vip', 'frequent', 'occasional'] as const;
const TEMPLATE_VALUES = [
  'post_visit_smart',
  'first_to_second_visit',
  'reactivate_inactive',
  'promote_event',
  'fill_empty_tables',
] as const;

async function loadProfiles(
  supabase: SupabaseClient,
  restaurantId: string
): Promise<GuestProfile[]> {
  const { data, error } = await supabase
    .from('guest_profiles')
    .select('*, guest:guests(id, name, phone, email, opt_in_whatsapp, opt_in_email)')
    .eq('restaurant_id', restaurantId);
  if (error) throw error;
  return (data ?? []) as GuestProfile[];
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function revenueAtStakeFor(
  profiles: GuestProfile[],
  segment: Segment,
  avgTicket: number
): number {
  const cohort = profiles.filter((p) => p.segment === segment);
  if (segment === 'dormant') return Math.round(cohort.length * avgTicket * 0.08);
  if (segment === 'at_risk') return Math.round(cohort.length * avgTicket * 0.12);
  if (segment === 'new') return Math.round(cohort.length * avgTicket * 0.15);
  return 0;
}

export function buildNomiTools({ restaurantId, avgTicket, supabase }: NomiToolDeps) {
  return {
    queryCustomers: tool({
      description:
        'Contar y samplear clientes de la CDP según un filtro (segmento, tier, visitas mínimas, recencia). Devuelve count + sample + promedios. Usalo para verificar tamaño de audiencia antes de proponer una campaña.',
      inputSchema: z.object({
        segment: z.enum(SEGMENT_VALUES).optional(),
        tier: z.enum(TIER_VALUES).optional(),
        min_total_visits: z.number().int().nonnegative().optional(),
        not_visited_in_last_days: z.number().int().positive().optional(),
        visited_in_last_days: z.number().int().positive().optional(),
        limit: z.number().int().positive().max(20).optional(),
      }),
      execute: async (args): Promise<QueryCustomersResult> => {
        const profiles = await loadProfiles(supabase, restaurantId);
        const filter: AudienceFilter = {
          segments: args.segment ? [args.segment] : undefined,
          tiers: args.tier ? [args.tier] : undefined,
          min_total_visits: args.min_total_visits,
          not_visited_in_last_days: args.not_visited_in_last_days,
          visited_in_last_days: args.visited_in_last_days,
        };
        const matched = filterProfiles(profiles, filter);
        const sample = matched.slice(0, args.limit ?? 5).map((p) => ({
          id: p.guest?.id ?? p.guest_id,
          name: p.guest?.name ?? 'Sin nombre',
          phone: p.guest?.phone ?? null,
          email: p.guest?.email ?? null,
          last_visit_at: p.last_visit_at,
        }));
        return {
          count: matched.length,
          sample,
          avg_visits: Number(avg(matched.map((p) => p.total_visits ?? 0)).toFixed(1)),
          avg_spent: Math.round(avg(matched.map((p) => p.total_spent ?? 0))),
        };
      },
    }),

    getSegmentMetrics: tool({
      description:
        'Devuelve la distribución de clientes por segmento (lead/new/active/at_risk/dormant/vip) con conteo, porcentaje y revenue at stake estimado. Útil para diagnósticos y priorización.',
      inputSchema: z.object({
        segment: z.enum(SEGMENT_VALUES).optional(),
      }),
      execute: async (args): Promise<{ rows: SegmentMetricRow[] }> => {
        const profiles = await loadProfiles(supabase, restaurantId);
        const total = profiles.length || 1;
        const segments: Segment[] = args.segment
          ? [args.segment]
          : ['vip', 'active', 'new', 'at_risk', 'dormant', 'lead'];
        const rows: SegmentMetricRow[] = segments.map((s) => {
          const count = profiles.filter((p) => p.segment === s).length;
          return {
            segment: s,
            count,
            percentage: Number((count / total).toFixed(3)),
            revenue_at_stake: revenueAtStakeFor(profiles, s, avgTicket),
          };
        });
        return { rows };
      },
    }),

    getCampaignResults: tool({
      description:
        'Devuelve los KPIs de una campaña específica (por id) o el resumen agregado de todas las campañas activas. Usalo para responder "¿cómo va mi campaña de X?".',
      inputSchema: z.object({
        campaign_id: z.string().optional(),
      }),
      execute: async (
        args
      ): Promise<{ campaigns: CampaignResultsSummary[] }> => {
        let query = supabase
          .from('campaigns')
          .select('*')
          .eq('restaurant_id', restaurantId);
        if (args.campaign_id) query = query.eq('id', args.campaign_id);
        else query = query.in('status', ['active', 'completed']);
        const { data, error } = await query;
        if (error) throw error;
        const campaigns = (data ?? []).map((c: Record<string, unknown>) => {
          const rawMetrics = (c.metrics as CampaignMetrics | null) ?? {
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
          const metrics = computeRates(rawMetrics);
          return {
            id: String(c.id),
            name: String(c.name),
            status: String(c.status),
            sent: metrics.sent,
            delivered: metrics.delivered,
            read: metrics.read,
            responded: metrics.responded,
            converted: metrics.converted,
            revenue_attributed: metrics.revenue_attributed,
            response_rate: metrics.response_rate,
            conversion_rate: metrics.conversion_rate,
          } satisfies CampaignResultsSummary;
        });
        return { campaigns };
      },
    }),

    listTemplates: tool({
      description:
        'Lista los 5 templates canónicos de campaña con su nombre, descripción, audiencia default, trigger default y KPIs. Usalo antes de draftCampaign cuando no estés segura de qué template usar.',
      inputSchema: z.object({}),
      execute: async () => {
        return {
          templates: TEMPLATE_ORDER.map((key) => {
            const t = TEMPLATES[key];
            return {
              key,
              name: t.name,
              description: t.description,
              headline: t.headline,
              default_audience: describeAudience(t.default_audience),
              trigger_kind: t.default_trigger.type,
              kpi_labels: t.kpi_labels.map((k) => k.label),
            };
          }),
        };
      },
    }),

    detectOpportunities: tool({
      description:
        'Corre el detector de oportunidades sobre la CDP actual. Devuelve las top oportunidades ordenadas por revenue potencial con reasoning, audiencia sugerida y template sugerido.',
      inputSchema: z.object({}),
      execute: async (): Promise<{ opportunities: Opportunity[] }> => {
        const profiles = await loadProfiles(supabase, restaurantId);
        return { opportunities: detectOpportunities(profiles, avgTicket) };
      },
    }),

    estimateAudienceSize: tool({
      description:
        'Estima cuántos clientes matchean un filtro de audiencia específico. Útil para confirmar tamaño antes de draftear una campaña.',
      inputSchema: z.object({
        segments: z.array(z.enum(SEGMENT_VALUES)).optional(),
        tiers: z.array(z.enum(TIER_VALUES)).optional(),
        min_total_visits: z.number().int().nonnegative().optional(),
        not_visited_in_last_days: z.number().int().positive().optional(),
        visited_in_last_days: z.number().int().positive().optional(),
      }),
      execute: async (args) => {
        const profiles = await loadProfiles(supabase, restaurantId);
        const filter: AudienceFilter = { ...args };
        const matched = filterProfiles(profiles, filter);
        return {
          count: matched.length,
          described: describeAudience(filter),
        };
      },
    }),

    draftCampaign: tool({
      description:
        'Genera un borrador COMPLETO de campaña (audience + trigger + workflow + metrics) basado en un template canónico. NO persiste nada — devuelve el plan para que el operador apruebe en un click. SIEMPRE llamá a esta tool cuando el usuario quiera "crear", "activar", "lanzar" o "armar" una campaña.',
      inputSchema: z.object({
        template_key: z.enum(TEMPLATE_VALUES),
        name_override: z.string().optional().describe('Nombre editorial corto para la campaña.'),
        reasoning: z
          .string()
          .describe('Por qué esta campaña es la correcta en una frase.'),
        audience: z
          .object({
            segments: z.array(z.enum(SEGMENT_VALUES)).optional(),
            tiers: z.array(z.enum(TIER_VALUES)).optional(),
            not_visited_in_last_days: z.number().int().positive().optional(),
            visited_in_last_days: z.number().int().positive().optional(),
            min_total_visits: z.number().int().nonnegative().optional(),
          })
          .optional()
          .describe('Ajustes sobre la audiencia default del template.'),
      }),
      execute: async (args): Promise<{ draft: CampaignDraft }> => {
        const templateKey = args.template_key as TemplateKey;
        const template = getTemplate(templateKey);
        const mergedAudience: AudienceFilter = {
          ...template.default_audience,
          ...(args.audience ?? {}),
        };
        const base = campaignFromTemplate(templateKey, restaurantId, {
          name: args.name_override ?? template.name,
          audience_filter: mergedAudience,
        });
        const profiles = await loadProfiles(supabase, restaurantId);
        const matched = filterProfiles(profiles, mergedAudience);
        const estimatedRevenue = estimateRevenueForTemplate(
          templateKey,
          matched.length,
          avgTicket
        );
        const draft: CampaignDraft = {
          ...base,
          estimated_revenue: estimatedRevenue,
          trigger: base.trigger as CampaignTrigger,
          reasoning: args.reasoning,
          described_audience: describeAudience(mergedAudience),
          source: 'nomi',
        };
        return { draft };
      },
    }),
  } as const;
}

function estimateRevenueForTemplate(
  key: TemplateKey,
  audienceSize: number,
  avgTicket: number
): number {
  const rates: Record<TemplateKey, number> = {
    reactivate_inactive: 0.08,
    first_to_second_visit: 0.15,
    post_visit_smart: 0.04,
    fill_empty_tables: 0.1,
    promote_event: 0.2,
  };
  return Math.round(audienceSize * avgTicket * rates[key]);
}

export function formatSegmentsList(segs: Segment[]): string {
  return segs.map((s) => SEGMENT_LABEL[s]).join(' · ');
}
