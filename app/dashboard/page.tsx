import { DashboardClient } from './DashboardClient';
import { getKpis, getSegments, getCampaigns, getMessages, type MessageRow } from '@/lib/api';
import type { UseCaseKey, UseCaseBreakdown } from '@/lib/dashboard-types';

const USE_CASE_LABEL: Record<UseCaseKey, string> = {
  reactivation: 'Reactivation',
  post_visit: 'Post-visit',
  second_visit: 'First → Second',
  event: 'Events',
  fill_tables: 'Fill tables',
  other: 'Other',
};

function classifyUseCase(campaignName: string): UseCaseKey {
  const n = campaignName.toLowerCase();
  if (n.includes('reactiv') || n.includes('dormid')) return 'reactivation';
  if (n.includes('post') || n.includes('gracias')) return 'post_visit';
  if (n.includes('segunda') || n.includes('primera')) return 'second_visit';
  if (n.includes('evento') || n.includes('experiencia')) return 'event';
  if (n.includes('mesa') || n.includes('ocupaci')) return 'fill_tables';
  return 'other';
}

function buildUseCaseBreakdown(messages: MessageRow[]): UseCaseBreakdown[] {
  const acc: Record<UseCaseKey, UseCaseBreakdown> = {
    reactivation: { key: 'reactivation', label: USE_CASE_LABEL.reactivation, sent: 0, conversions: 0, revenue: 0 },
    post_visit: { key: 'post_visit', label: USE_CASE_LABEL.post_visit, sent: 0, conversions: 0, revenue: 0 },
    second_visit: { key: 'second_visit', label: USE_CASE_LABEL.second_visit, sent: 0, conversions: 0, revenue: 0 },
    event: { key: 'event', label: USE_CASE_LABEL.event, sent: 0, conversions: 0, revenue: 0 },
    fill_tables: { key: 'fill_tables', label: USE_CASE_LABEL.fill_tables, sent: 0, conversions: 0, revenue: 0 },
    other: { key: 'other', label: USE_CASE_LABEL.other, sent: 0, conversions: 0, revenue: 0 },
  };

  for (const m of messages) {
    const k = classifyUseCase(m.campaign_name);
    const bucket = acc[k];
    if (['sent', 'delivered', 'read', 'responded', 'converted'].includes(m.status)) {
      bucket.sent += 1;
    }
    if (m.status === 'converted') {
      bucket.conversions += 1;
      bucket.revenue += m.realized_revenue ?? 0;
    }
  }

  return Object.values(acc)
    .filter((b) => b.sent > 0 || b.conversions > 0 || b.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);
}

function buildActivityTicker(messages: MessageRow[]): string[] {
  const now = Date.now();
  const meaningful = messages.filter(
    (m) => m.status === 'converted' || m.status === 'responded' || m.status === 'pending_approval',
  );

  return meaningful
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 7)
    .map((m) => {
      const mins = Math.max(1, Math.round((now - new Date(m.created_at).getTime()) / 60_000));
      const when = mins < 60 ? `${mins} MIN AGO` : `${Math.round(mins / 60)} H AGO`;
      const evento =
        m.status === 'converted'
          ? `CONVERTED +$${Math.round((m.realized_revenue ?? 0) / 1000)}K`
          : m.status === 'responded'
            ? 'POSITIVE REPLY'
            : 'PENDING APPROVAL';
      return `${m.guest_name.toUpperCase()} · ${evento} · ${when}`;
    });
}

export default async function DashboardPage() {
  const [kpis, summaries, campaigns, messages] = await Promise.all([
    getKpis(),
    getSegments(),
    getCampaigns(),
    getMessages(),
  ]);

  const vipCount = summaries.find((s) => s.segment === 'vip')?.count ?? 0;
  const active = vipCount + (summaries.find((s) => s.segment === 'active')?.count ?? 0);
  const dormant = summaries.find((s) => s.segment === 'dormant')?.count ?? 0;
  const pending = messages.filter((m) => m.status === 'pending_approval').length;

  const reactivated = messages.filter(
    (m) => m.status === 'converted' && classifyUseCase(m.campaign_name) === 'reactivation',
  ).length;

  const visitsRecovered = messages.filter((m) => m.status === 'converted').length;

  const approvedLike = messages.filter((m) =>
    ['approved', 'queued', 'sent', 'delivered', 'read', 'responded', 'converted'].includes(m.status),
  ).length;
  const decided = approvedLike + messages.filter((m) => m.status === 'skipped').length;
  const approvalRate = decided > 0 ? (approvedLike / decided) * 100 : 0;

  const ticker = buildActivityTicker(messages);
  const breakdown = buildUseCaseBreakdown(messages);
  const postVisita =
    breakdown.find((b) => b.key === 'post_visit') ??
    { key: 'post_visit', label: USE_CASE_LABEL.post_visit, sent: 0, conversions: 0, revenue: 0 };

  return (
    <DashboardClient
      kpis={kpis}
      summaries={summaries}
      campaigns={campaigns}
      messages={messages}
      ticker={ticker}
      breakdown={breakdown}
      postVisita={postVisita}
      counts={{
        active,
        dormant,
        pending,
        reactivated,
        visitsRecovered,
        approvalRate,
      }}
    />
  );
}
