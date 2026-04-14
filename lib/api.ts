import type {
  Campaign,
  CampaignStatus,
  CampaignTemplate,
  DashboardKPIs,
  Message,
  MessageStatus,
  Segment,
  SegmentSummary,
} from './types';

/**
 * Cliente HTTP minimal para consumir los route handlers de app/api/**.
 * - Client components: path relativo (el browser resuelve contra el host).
 * - Server components: URL absoluta. Prioridad:
 *     1. NEXT_PUBLIC_API_BASE_URL (override explícito, útil si el API vive en otro host).
 *     2. headers().get('host') del request actual (derivado automáticamente en dev/prod).
 *     3. http://localhost:3000 como último fallback.
 */

export async function resolveApiBase(): Promise<string> {
  return resolveBase();
}

async function resolveBase(): Promise<string> {
  if (typeof window !== 'undefined') return '';
  const env = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (env) return env;
  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    const host = h.get('host');
    if (host) {
      const proto = h.get('x-forwarded-proto') ?? 'http';
      return `${proto}://${host}`;
    }
  } catch {
    // fuera de request context (scripts, tests) — cae al default
  }
  return 'http://localhost:3000';
}

async function buildUrl(path: string, query?: Record<string, string | number | undefined>): Promise<string> {
  const base = await resolveBase();
  const url = new URL(path, base || 'http://localhost');
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
  }
  return base ? url.toString() : `${url.pathname}${url.search}`;
}

async function apiGet<T>(path: string, query?: Record<string, string | number | undefined>): Promise<T> {
  const url = await buildUrl(path, query);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

// ---------- Dashboard KPIs --------------------------------------------------

export async function getKpis(range?: '7d' | '30d' | '90d'): Promise<DashboardKPIs> {
  const data = await apiGet<{ kpis: DashboardKPIs }>('/api/kpis', { range });
  return data.kpis;
}

// ---------- Audience --------------------------------------------------------

export async function getSegments(): Promise<SegmentSummary[]> {
  const data = await apiGet<{ summaries: SegmentSummary[] }>('/api/audience/segments');
  return data.summaries;
}

/**
 * Shape consumido por GuestList. Hoy el route handler devuelve este shape flat
 * directo; el spec dice que a futuro va a devolver GuestProfile[] con guest
 * hidratado. Normalizamos ambos shapes para no romper cuando el backend cambie.
 */
export interface GuestRow {
  id: string;
  name: string;
  segment: Segment;
  total_visits: number;
  days_since_last: number;
  avg_score: number | null;
  total_spent: number;
}

function normalizeGuest(g: unknown): GuestRow {
  const r = g as Record<string, unknown> & { guest?: { name?: string } };
  return {
    id: String(r.id ?? ''),
    name: String(r.name ?? r.guest?.name ?? '—'),
    segment: r.segment as Segment,
    total_visits: Number(r.total_visits ?? 0),
    days_since_last: Number(r.days_since_last ?? 0),
    avg_score: r.avg_score == null ? null : Number(r.avg_score),
    total_spent: Number(r.total_spent ?? 0),
  };
}

export interface GuestQuery {
  segment?: Segment;
  sort?: 'visits' | 'spent' | 'recent' | 'inactive';
  min_visits?: number;
  max_days_since_last?: number;
  limit?: number;
  q?: string;
}

export async function getGuests(query: Segment | GuestQuery = {}): Promise<GuestRow[]> {
  const params: GuestQuery =
    typeof query === 'string' ? { segment: query } : query;
  const data = await apiGet<{ guests: unknown[] }>('/api/audience/guests', {
    segment: params.segment,
    sort: params.sort ?? 'visits',
    min_visits: params.min_visits,
    max_days_since_last: params.max_days_since_last,
    limit: params.limit ?? 200,
    q: params.q,
  });
  return data.guests.map(normalizeGuest);
}

// ---------- Campaigns -------------------------------------------------------

export async function getCampaigns(status?: CampaignStatus): Promise<Campaign[]> {
  const data = await apiGet<{ campaigns: Campaign[] }>('/api/campaigns', { status });
  return data.campaigns;
}

// ---------- Messages --------------------------------------------------------

export type MessageRow = Pick<
  Message,
  'id' | 'channel' | 'status' | 'content' | 'created_at' | 'realized_revenue' | 'estimated_revenue'
> & {
  guest_name: string;
  campaign_name: string;
};

function normalizeMessage(m: unknown): MessageRow {
  const r = m as Record<string, unknown> & {
    guest?: { name?: string };
    campaign?: { name?: string };
  };
  return {
    id: String(r.id ?? ''),
    channel: r.channel as MessageRow['channel'],
    status: r.status as MessageStatus,
    content: String(r.content ?? ''),
    created_at: String(r.created_at ?? new Date().toISOString()),
    realized_revenue: r.realized_revenue == null ? null : Number(r.realized_revenue),
    estimated_revenue: r.estimated_revenue == null ? null : Number(r.estimated_revenue),
    guest_name: String(r.guest_name ?? r.guest?.name ?? '—'),
    campaign_name: String(r.campaign_name ?? r.campaign?.name ?? '—'),
  };
}

export async function getMessages(status?: MessageStatus): Promise<MessageRow[]> {
  const data = await apiGet<{ messages: unknown[] }>('/api/messages', { status });
  return data.messages.map(normalizeMessage);
}

// ---------- Templates -------------------------------------------------------

export async function getTemplates(): Promise<CampaignTemplate[]> {
  const data = await apiGet<{ templates: CampaignTemplate[] }>('/api/templates');
  return data.templates;
}
