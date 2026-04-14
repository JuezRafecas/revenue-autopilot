'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { RevenueHero } from '@/components/dashboard/RevenueHero';
import { PostVisitaStrip } from '@/components/dashboard/PostVisitaStrip';
import { HealthScore } from '@/components/dashboard/HealthScore';
import { SegmentLedger } from '@/components/dashboard/SegmentLedger';
import { RevenueOpportunity } from '@/components/dashboard/RevenueOpportunity';
import { ActivityTicker } from '@/components/dashboard/ActivityTicker';
import { KPIGrid } from '@/components/dashboard/KPIGrid';
import { CampaignRow } from '@/components/campaigns/CampaignRow';
import { PendingApprovalsHero } from '@/components/dashboard/PendingApprovalsHero';
import type { MessageRow } from '@/lib/api';
import type { Campaign, DashboardKPIs, SegmentSummary } from '@/lib/types';
import { DEFAULT_RESTAURANT } from '@/lib/constants';
import { pseudoSeries, weeklyDelta } from '@/components/ui/sparkline-data';
import type { UseCaseBreakdown } from '@/lib/dashboard-types';

interface Props {
  kpis: DashboardKPIs;
  summaries: SegmentSummary[];
  campaigns: Campaign[];
  messages: MessageRow[];
  ticker: string[];
  breakdown: UseCaseBreakdown[];
  postVisita: UseCaseBreakdown;
  counts: {
    active: number;
    dormant: number;
    pending: number;
    reactivated: number;
    visitsRecovered: number;
    approvalRate: number;
  };
}

export function DashboardClient({
  kpis,
  summaries,
  campaigns,
  messages,
  ticker,
  breakdown,
  postVisita,
  counts,
}: Props) {
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').slice(0, 3);

  const kpiEntries = [
    {
      label: 'Reactivated · 30d',
      value: counts.reactivated,
      animated: true,
    },
    {
      label: 'Visits recovered · 30d',
      value: counts.visitsRecovered,
      animated: true,
    },
    {
      label: 'Approval rate',
      value: counts.approvalRate,
      format: 'percent' as const,
    },
    {
      label: 'Revenue attributed · 30d',
      value: kpis.revenue_attributed_30d,
      format: 'ars' as const,
      animated: true,
    },
  ].map((k) => {
    const series = pseudoSeries(`kpi:${k.label}`, k.value);
    return { ...k, sparkline: series, delta: weeklyDelta(series) };
  });

  const healthSeries = pseudoSeries('health', kpis.base_health_score, 30, 0.12);
  const healthDiagnosis =
    kpis.base_health_score < 25
      ? 'the base is critical: most guests never return.'
      : kpis.base_health_score < 50
        ? 'one in two guests is walking out the door.'
        : kpis.base_health_score < 75
          ? 'the base works, but there is a large pool of dormant revenue.'
          : 'the base is healthy — focus on leveling up VIPs.';

  return (
    <AppShell pendingCount={counts.pending}>
      <Header />

      <section className="editorial-container section-pt-lead section-pb-close">
        <RevenueHero
          revenueThisMonth={kpis.revenue_attributed_30d}
          reactivated={counts.reactivated}
          visitsRecovered={counts.visitsRecovered}
          revenueAtStake={kpis.revenue_at_stake}
        />
      </section>

      <PendingApprovalsHero messages={messages} />

      <section className="pb-10">
        <div className="editorial-container">
          <KPIGrid kpis={kpiEntries} />
        </div>
      </section>

      <div className="pb-16">
        <PostVisitaStrip
          sent={postVisita.sent}
          secondVisits={postVisita.conversions}
          revenue={postVisita.revenue}
        />
      </div>

      <section className="editorial-container grid grid-cols-1 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] gap-12 lg:gap-16 pb-24">
        <HealthScore
          score={kpis.base_health_score}
          activeCount={counts.active}
          totalCount={kpis.total_guests}
          diagnosis={healthDiagnosis}
          series={healthSeries}
        />
        <SegmentLedger summaries={summaries} />
      </section>

      <section className="pb-20">
        <div className="editorial-container flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
          <div>
            <SectionLabel className="mb-2">Active automations</SectionLabel>
            <h2
              style={{
                fontFamily: 'var(--font-kaszek-display), "Archivo Black", system-ui, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.5rem, 2vw, 1.85rem)',
                letterSpacing: '-0.035em',
                color: 'var(--fg)',
                lineHeight: 1.05,
              }}
            >
              What is running right now.
            </h2>
          </div>
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 text-[10.5px] uppercase font-[600] px-4 py-2 transition-colors self-start md:self-auto k-outline-cta"
            style={{
              letterSpacing: '0.16em',
              border: '1px solid var(--fg)',
              color: 'var(--fg)',
              fontFamily: 'var(--font-kaszek-sans), Inter, system-ui, sans-serif',
            }}
          >
            View all
            <span>→</span>
          </Link>
        </div>
        <div
          className="editorial-container"
          style={{ borderTop: '1.5px solid var(--hairline-strong)' }}
        >
          {activeCampaigns.map((c, i) => (
            <CampaignRow key={c.id} campaign={c} index={i} />
          ))}
        </div>
      </section>

      <RevenueOpportunity
        totalAtStake={kpis.revenue_at_stake}
        dormantCount={counts.dormant}
        avgTicket={DEFAULT_RESTAURANT.avg_ticket}
        breakdown={breakdown}
      />

      {ticker.length > 0 && <ActivityTicker items={ticker} />}
    </AppShell>
  );
}
