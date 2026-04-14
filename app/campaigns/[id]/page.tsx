import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Label } from '@/components/ui/Label';
import { Numeral } from '@/components/ui/Numeral';
import { Button } from '@/components/ui/Button';
import { CampaignStatusBadge } from '@/components/campaigns/CampaignStatusBadge';
import { WorkflowDiagram } from '@/components/campaigns/WorkflowDiagram';
import { AudienceSummary } from '@/components/campaigns/AudienceSummary';
import { MessagePreview } from '@/components/actions/MessagePreview';
import { getMockCampaignById, MOCK_SAMPLE_MESSAGES } from '@/lib/mock';
import { TEMPLATES } from '@/lib/templates';
import { describeAudience } from '@/lib/audience';
import { formatARS } from '@/lib/constants';

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = getMockCampaignById(id);
  if (!campaign) notFound();
  const tpl = campaign.template_key ? TEMPLATES[campaign.template_key] : null;
  const sampleMessage = tpl ? MOCK_SAMPLE_MESSAGES[tpl.accent] : '';

  return (
    <AppShell>
      <Header />

      <section className="editorial-container pt-12 pb-10">
        <Link
          href="/campaigns"
          className="inline-block font-mono text-[10px] uppercase tracking-label text-fg-subtle hover:text-fg mb-10"
        >
          ← All campaigns
        </Link>

        <div className="flex items-start justify-between gap-8 mb-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <CampaignStatusBadge status={campaign.status} animated />
              <span className="text-[10px] uppercase tracking-label text-fg-subtle">
                {campaign.type === 'automation' ? 'Automation' : 'One-shot campaign'}
              </span>
              {tpl && (
                <span className="text-[10px] uppercase tracking-label text-fg-subtle">
                  · {tpl.name}
                </span>
              )}
            </div>
            <h1
              className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] text-fg max-w-[24ch]"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              {campaign.name}
            </h1>
            {campaign.description && (
              <p
                className="mt-4 font-display italic text-xl text-fg-muted max-w-[56ch] leading-snug"
                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
              >
                {campaign.description}.
              </p>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-3 pt-4">
            {campaign.status === 'active' ? (
              <Button variant="ghost">Pause</Button>
            ) : campaign.status === 'scheduled' ? (
              <Button variant="primary">Launch now</Button>
            ) : (
              <Button variant="primary">Activate</Button>
            )}
            <Button variant="link">Duplicate</Button>
          </div>
        </div>
      </section>

      {/* KPI row */}
      <section className="editorial-container pb-12">
        <div className="grid grid-cols-2 md:grid-cols-5 border-y border-hairline">
          <Metric label="Sent" value={campaign.metrics.sent} />
          <Metric label="Read" value={Math.round(campaign.metrics.read_rate * 100)} suffix="%" />
          <Metric label="Replied" value={Math.round(campaign.metrics.response_rate * 100)} suffix="%" />
          <Metric label="Converted" value={campaign.metrics.converted} />
          <Metric
            label="Revenue"
            value={campaign.metrics.revenue_attributed}
            format="ars"
            accent
          />
        </div>
      </section>

      {/* Workflow + Audience + Message */}
      <section className="editorial-container pb-24 grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,380px)] gap-10">
        <div>
          <Label className="mb-4">Workflow</Label>
          <WorkflowDiagram
            workflow={tpl?.workflow ?? campaign.workflow}
            accent={tpl?.accent ?? 'active'}
          />
        </div>

        <aside className="space-y-8">
          <AudienceSummary
            filter={campaign.audience_filter}
            matchedCount={Math.max(50, campaign.metrics.sent)}
            tierBreakdown={[
              { label: 'VIP', count: Math.round(Math.max(50, campaign.metrics.sent) * 0.18) },
              { label: 'Frequent', count: Math.round(Math.max(50, campaign.metrics.sent) * 0.42) },
              { label: 'Occasional', count: Math.round(Math.max(50, campaign.metrics.sent) * 0.40) },
            ]}
          />

          <div>
            <Label className="mb-3">Message example</Label>
            <MessagePreview message={sampleMessage || 'Example generated from the template.'} />
          </div>

          <div className="border border-hairline bg-bg-raised p-6">
            <Label className="mb-3">Details</Label>
            <dl className="space-y-3 text-[12px]">
              <Row label="Created" value={new Date(campaign.created_at).toLocaleDateString('en-US')} />
              {campaign.started_at && (
                <Row label="Started" value={new Date(campaign.started_at).toLocaleDateString('en-US')} />
              )}
              <Row label="Channels" value={campaign.channels.join(', ')} />
              <Row label="Audience" value={describeAudience(campaign.audience_filter)} />
              {campaign.estimated_revenue && (
                <Row label="Estimated revenue" value={formatARS(campaign.estimated_revenue)} accent />
              )}
            </dl>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}

function Metric({
  label,
  value,
  suffix,
  format,
  accent,
}: {
  label: string;
  value: number;
  suffix?: string;
  format?: 'ars';
  accent?: boolean;
}) {
  return (
    <div className="px-8 py-10 border-r border-hairline last:border-r-0">
      <Label className="mb-3">{label}</Label>
      <div className={`font-mono text-3xl md:text-4xl tabular-nums ${accent ? 'text-accent' : 'text-fg'}`}>
        <Numeral value={value} format={format === 'ars' ? 'ars' : 'plain'} />
        {suffix && <span className="text-sm text-fg-subtle ml-1">{suffix}</span>}
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-[10px] uppercase tracking-label text-fg-subtle shrink-0">{label}</dt>
      <dd className={`font-mono text-[12px] text-right truncate ${accent ? 'text-accent' : 'text-fg-muted'}`}>
        {value}
      </dd>
    </div>
  );
}
