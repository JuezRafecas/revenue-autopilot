import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { EditorialHeadline } from '@/components/dashboard/EditorialHeadline';
import { HealthScore } from '@/components/dashboard/HealthScore';
import { SegmentLedger } from '@/components/dashboard/SegmentLedger';
import { RevenueOpportunity } from '@/components/dashboard/RevenueOpportunity';
import { ActivityTicker } from '@/components/dashboard/ActivityTicker';
import {
  MOCK_SEGMENT_SUMMARIES,
  MOCK_HEALTH_SCORE,
  MOCK_TOTAL_REVENUE_AT_STAKE,
  MOCK_EDITORIAL_HEADLINE,
  MOCK_ACTIVITY_TICKER,
  MOCK_RESTAURANT,
} from '@/lib/mock';

export default function DashboardPage() {
  const activeCount =
    MOCK_SEGMENT_SUMMARIES.find((s) => s.segment === 'vip')!.count +
    MOCK_SEGMENT_SUMMARIES.find((s) => s.segment === 'active')!.count;
  const dormantCount = MOCK_SEGMENT_SUMMARIES.find((s) => s.segment === 'dormant')!.count;

  return (
    <AppShell>
      <Header />

      <section className="editorial-container pt-16 pb-20">
        <EditorialHeadline
          prefix={MOCK_EDITORIAL_HEADLINE.prefix}
          highlight={MOCK_EDITORIAL_HEADLINE.highlight}
          suffix={MOCK_EDITORIAL_HEADLINE.suffix}
        />
      </section>

      <section className="editorial-container grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-16 pb-24">
        <HealthScore
          score={MOCK_HEALTH_SCORE}
          activeCount={activeCount}
          totalCount={MOCK_RESTAURANT.total_guests}
          diagnosis="uno de cada dos comensales se está yendo por la puerta."
        />
        <SegmentLedger summaries={MOCK_SEGMENT_SUMMARIES} />
      </section>

      <RevenueOpportunity
        totalAtStake={MOCK_TOTAL_REVENUE_AT_STAKE}
        dormantCount={dormantCount}
        avgTicket={MOCK_RESTAURANT.avg_ticket}
      />

      <div className="mt-auto">
        <ActivityTicker items={MOCK_ACTIVITY_TICKER} />
      </div>
    </AppShell>
  );
}
